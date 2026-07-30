import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ManualReplyPayload = {
  conversation_id?: string;
  text?: string;
};

const dashboardOrigin = Deno.env.get("DASHBOARD_ALLOWED_ORIGIN") ??
  "https://dashboard.srv1651337.hstgr.cloud";

const corsHeaders = {
  "Access-Control-Allow-Origin": dashboardOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const lineToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !lineToken) {
    return jsonResponse(500, { error: "missing_server_environment" });
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse(401, { error: "unauthorized" });
  }

  const payload = (await request.json()) as ManualReplyPayload;
  const conversationId = payload.conversation_id?.trim();
  const text = payload.text?.trim();

  if (!conversationId || !text) {
    return jsonResponse(400, { error: "conversation_id_and_text_required" });
  }

  if (text.length > 1000) {
    return jsonResponse(400, { error: "message_too_long" });
  }

  const { data: profile, error: profileError } = await adminClient
    .from("Ladda_admin_profiles")
    .select("user_id, role, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    return jsonResponse(403, { error: "admin_required" });
  }

  const { data: conversation, error: conversationError } = await adminClient
    .from("Ladda_conversations")
    .select("id, customer_id, customer_identity_id, mode, assigned_admin_id, manual_until")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError || !conversation) {
    return jsonResponse(404, { error: "conversation_not_found" });
  }

  if (
    conversation.mode !== "manual" ||
    conversation.assigned_admin_id !== user.id ||
    !conversation.manual_until ||
    new Date(conversation.manual_until).getTime() <= Date.now()
  ) {
    return jsonResponse(409, { error: "conversation_not_held_by_admin" });
  }

  const { data: leaseExtended, error: leaseError } = await userClient.rpc(
    "ladda_extend_manual_lease",
    { conversation_id: conversationId },
  );

  if (leaseError || !leaseExtended) {
    return jsonResponse(409, { error: "conversation_lease_expired" });
  }

  const { data: identity, error: identityError } = await adminClient
    .from("Ladda_customer_identities")
    .select("line_user_id")
    .eq("id", conversation.customer_identity_id)
    .maybeSingle();

  if (identityError || !identity?.line_user_id) {
    return jsonResponse(404, { error: "line_identity_not_found" });
  }

  const lineResponse = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lineToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: identity.line_user_id,
      messages: [{ type: "text", text }],
    }),
  });

  const deliveryStatus = lineResponse.ok ? "sent" : "failed";

  const { error: insertError } = await adminClient.from("Ladda_messages").insert({
    conversation_id: conversation.id,
    customer_id: conversation.customer_id,
    direction: "outbound",
    sender_type: "admin",
    sender_admin_id: user.id,
    message_type: "text",
    text_content: text,
    delivery_status: deliveryStatus,
  });

  if (insertError) {
    return jsonResponse(500, { error: "message_record_failed" });
  }

  if (!lineResponse.ok) {
    return jsonResponse(502, { error: "line_push_failed" });
  }

  return jsonResponse(200, { ok: true });
});
