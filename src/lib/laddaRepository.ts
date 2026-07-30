import { demoData } from "./demoData";
import {
  dashboardRuntimeMode,
  supabase,
  supabaseConfigured,
} from "./supabaseClient";
import type {
  AdminSession,
  ConversationRecord,
  CustomerRecord,
  DashboardActionResult,
  DashboardData,
  FollowUpTaskRecord,
  MessageRecord,
  SystemStatusRecord,
} from "./types";

type LaddaTable<Name extends keyof import("../../packages/database/src/database.types").Database["public"]["Tables"]> =
  import("../../packages/database/src/database.types").Database["public"]["Tables"][Name]["Row"];

type CustomerRow = LaddaTable<"Ladda_customers">;
type IdentityRow = LaddaTable<"Ladda_customer_identities">;
type ConversationRow = LaddaTable<"Ladda_conversations">;
type MessageRow = LaddaTable<"Ladda_messages">;
type FactRow = LaddaTable<"Ladda_customer_facts">;
type FollowUpRow = LaddaTable<"Ladda_follow_up_tasks">;
type SystemHealthRow = LaddaTable<"Ladda_system_health">;
type AiUsageRow = LaddaTable<"Ladda_ai_usage">;

function formatJsonFact(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function cropListFromFacts(facts: FactRow[]): string[] {
  const cropFact = facts.find((fact) =>
    ["crop", "crops", "plant", "พืชที่ปลูก"].includes(fact.fact_type),
  );
  if (!cropFact) return [];
  const rawValue = cropFact.fact_value;
  if (Array.isArray(rawValue)) return rawValue.map((item) => String(item));
  return formatJsonFact(rawValue)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function lastMessageText(messages: MessageRow[]): string {
  return messages.at(-1)?.text_content?.trim() || "ยังไม่มีข้อความ";
}

function unreadCount(messages: MessageRow[]): number {
  return messages.filter((message) => message.direction === "inbound").length;
}

function riskForConversation(row: ConversationRow, messages: MessageRow[]): ConversationRecord["risk"] {
  if (row.mode === "manual") return "watch";
  if (messages.some((message) => message.text_content?.includes("ระบบขัดข้อง"))) {
    return "urgent";
  }
  return unreadCount(messages) > 1 ? "urgent" : "normal";
}

function toMessageRecord(row: MessageRow): MessageRecord {
  return {
    id: row.id,
    direction: row.direction,
    senderType: row.sender_type,
    text: row.text_content || "(ไม่มีข้อความ)",
    createdAt: row.created_at,
    deliveryStatus: row.delivery_status,
  };
}

function toCustomerRecord(
  row: CustomerRow,
  identity: IdentityRow | undefined,
  facts: FactRow[],
): CustomerRecord {
  const provinceFact = facts.find((fact) =>
    ["province", "จังหวัด"].includes(fact.fact_type),
  );
  const cropFacts = cropListFromFacts(facts);
  return {
    id: row.id,
    name: row.preferred_name || identity?.display_name_snapshot || "ยังไม่ทราบชื่อ",
    phone: row.phone || "ยังไม่พบเบอร์",
    province: row.province || formatJsonFact(provinceFact?.fact_value) || "-",
    district: row.district || "-",
    lineUserId: identity?.line_user_id || "-",
    lineDisplayName: identity?.display_name_snapshot || "-",
    crops: cropFacts,
    facts: facts.map((fact) => ({
      type: fact.fact_type,
      value: formatJsonFact(fact.fact_value),
      confidence: Number(fact.confidence),
    })),
    tags: [],
    lastContactAt: row.last_contact_at,
    status: row.status,
  };
}

function systemStatusFromRows(rows: SystemHealthRow[]): SystemStatusRecord[] {
  if (rows.length === 0) return [];
  return rows.slice(0, 8).map((row) => ({
    service: row.service,
    status: row.status === "ok" ? "ok" : row.status === "down" ? "down" : "warn",
    detail:
      formatJsonFact(row.detail) ||
      `อัปเดต ${new Date(row.checked_at).toLocaleTimeString("th-TH")}`,
  }));
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: profile } = await supabase
    .from("Ladda_admin_profiles")
    .select("display_name, role, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    email: data.user.email || "",
    name: profile?.display_name || data.user.email || "ผู้ใช้งาน",
    role: profile?.is_active ? profile.role : "unknown",
  };
}

export async function loadDashboardData(): Promise<DashboardData> {
  if (dashboardRuntimeMode === "demo") return demoData;
  if (!supabaseConfigured || !supabase) {
    throw new Error("ยังไม่ได้ตั้งค่า Supabase สำหรับ Production");
  }

  const [
    conversationsResult,
    messagesResult,
    customersResult,
    identitiesResult,
    factsResult,
    followUpsResult,
    healthResult,
    aiUsageResult,
  ] = await Promise.all([
    supabase
      .from("Ladda_conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(60),
    supabase
      .from("Ladda_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(500),
    supabase.from("Ladda_customers").select("*").limit(200),
    supabase.from("Ladda_customer_identities").select("*").limit(200),
    supabase.from("Ladda_customer_facts").select("*").limit(500),
    supabase
      .from("Ladda_follow_up_tasks")
      .select("*")
      .order("due_at", { ascending: true })
      .limit(80),
    supabase
      .from("Ladda_system_health")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(20),
    supabase
      .from("Ladda_ai_usage")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const results = [
    conversationsResult,
    messagesResult,
    customersResult,
    identitiesResult,
    factsResult,
    followUpsResult,
    healthResult,
    aiUsageResult,
  ];
  const failed = results.find((result) => result.error);
  if (failed?.error) {
    throw new Error(`โหลดข้อมูล Dashboard ไม่สำเร็จ: ${failed.error.message}`);
  }

  const conversations = (conversationsResult.data || []) as ConversationRow[];
  const messages = (messagesResult.data || []) as MessageRow[];
  const customers = (customersResult.data || []) as CustomerRow[];
  const identities = (identitiesResult.data || []) as IdentityRow[];
  const facts = (factsResult.data || []) as FactRow[];
  const followUps = (followUpsResult.data || []) as FollowUpRow[];
  const healthRows = (healthResult.data || []) as SystemHealthRow[];
  const aiUsage = (aiUsageResult.data || []) as AiUsageRow[];

  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const identityById = new Map(identities.map((identity) => [identity.id, identity]));
  const factsByCustomer = new Map<string, FactRow[]>();
  for (const fact of facts) {
    const customerFacts = factsByCustomer.get(fact.customer_id) || [];
    customerFacts.push(fact);
    factsByCustomer.set(fact.customer_id, customerFacts);
  }
  const messagesByConversation = new Map<string, MessageRow[]>();
  for (const message of messages) {
    const conversationMessages = messagesByConversation.get(message.conversation_id) || [];
    conversationMessages.push(message);
    messagesByConversation.set(message.conversation_id, conversationMessages);
  }

  const customerRecords = customers.map((customer) => {
    const identity = identities.find((item) => item.customer_id === customer.id);
    return toCustomerRecord(customer, identity, factsByCustomer.get(customer.id) || []);
  });

  const conversationRecords: ConversationRecord[] = conversations.map((conversation) => {
    const customer = customerById.get(conversation.customer_id);
    const identity = identityById.get(conversation.customer_identity_id);
    const customerFacts = factsByCustomer.get(conversation.customer_id) || [];
    const conversationMessages = messagesByConversation.get(conversation.id) || [];
    const customerRecord = customer
      ? toCustomerRecord(customer, identity, customerFacts)
      : undefined;

    return {
      id: conversation.id,
      customerId: conversation.customer_id,
      customerName:
        customerRecord?.name || identity?.display_name_snapshot || "ยังไม่ทราบชื่อ",
      lineUserId: identity?.line_user_id || "-",
      province: customerRecord?.province || "-",
      crops: customerRecord?.crops || [],
      status: conversation.status,
      mode: conversation.mode,
      assignedAdminId: conversation.assigned_admin_id,
      manualUntil: conversation.manual_until,
      version: Number(conversation.version),
      unreadCount: unreadCount(conversationMessages),
      lastMessageAt:
        conversation.last_customer_message_at ||
        conversation.updated_at ||
        conversation.created_at,
      lastText: lastMessageText(conversationMessages),
      risk: riskForConversation(conversation, conversationMessages),
      messages: conversationMessages.map(toMessageRecord),
    };
  });

  const successfulAi = aiUsage.filter((row) => row.outcome === "success").length;
  const aiSuccessRate =
    aiUsage.length === 0 ? 0 : Math.round((successfulAi / aiUsage.length) * 100);
  const latencySamples = aiUsage
    .map((row) => row.latency_ms)
    .filter((value): value is number => typeof value === "number" && value >= 0);
  const averageLatencyMs = latencySamples.length
    ? Math.round(latencySamples.reduce((sum, value) => sum + value, 0) / latencySamples.length)
    : null;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMessageCount = messages.filter(
    (message) => new Date(message.created_at).getTime() >= todayStart.getTime(),
  ).length;
  const unresolvedConversations = conversationRecords.filter(
    (conversation) => conversation.status === "open" && conversation.unreadCount > 0,
  );
  const oldestUnresolvedMinutes = unresolvedConversations.length
    ? Math.max(
        0,
        Math.round(
          (Date.now() -
            Math.min(
              ...unresolvedConversations.map((conversation) =>
                new Date(conversation.lastMessageAt).getTime(),
              ),
            )) /
            60_000,
        ),
      )
    : null;

  return {
    mode: "live",
    conversations: conversationRecords,
    customers: customerRecords,
    followUps: followUps.map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      customerName:
        customerById.get(row.customer_id)?.preferred_name || "ยังไม่ทราบชื่อ",
      title: row.title,
      status: row.status,
      dueAt: row.due_at,
    })),
    serviceStatus: systemStatusFromRows(healthRows),
    aiQueueNow: aiUsage.filter((row) => row.outcome === "queued").length,
    aiSuccessRate,
    averageLatencyMs,
    oldestUnresolvedMinutes,
    todayMessageCount,
    unresolvedCount: unresolvedConversations.length,
  };
}

export async function signInWithMicrosoft(): Promise<DashboardActionResult> {
  if (!supabase) return { ok: false, message: "ยังไม่ได้ตั้งค่า Supabase" };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: { redirectTo: window.location.origin },
  });
  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: "กำลังเปิดหน้าเข้าสู่ระบบ" };
}

export async function signInWithMagicLink(email: string): Promise<DashboardActionResult> {
  if (!supabase) return { ok: false, message: "ยังไม่ได้ตั้งค่า Supabase" };
  const normalizedEmail = email.trim();
  if (!normalizedEmail) return { ok: false, message: "กรุณากรอกอีเมล" };
  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: { emailRedirectTo: window.location.origin },
  });
  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: "ส่งลิงก์เข้าใช้งานไปที่อีเมลแล้ว" };
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

export async function claimConversation(
  conversationId: string,
): Promise<DashboardActionResult> {
  if (!supabase) return { ok: false, message: "โหมดตัวอย่าง: ยังไม่ต่อ Supabase" };
  const { error } = await supabase.rpc("ladda_claim_conversation", {
    conversation_id: conversationId,
  });
  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: "รับเคสแล้ว บอทจะหยุดตอบอัตโนมัติ" };
}

export async function releaseConversation(
  conversationId: string,
): Promise<DashboardActionResult> {
  if (!supabase) return { ok: false, message: "โหมดตัวอย่าง: ยังไม่ต่อ Supabase" };
  const { error } = await supabase.rpc("ladda_release_conversation", {
    conversation_id: conversationId,
  });
  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: "คืนเคสให้บอทแล้ว" };
}

export async function extendConversation(
  conversationId: string,
): Promise<DashboardActionResult> {
  if (!supabase) return { ok: false, message: "โหมดตัวอย่าง: ยังไม่ต่อ Supabase" };
  const { error } = await supabase.rpc("ladda_extend_manual_lease", {
    conversation_id: conversationId,
  });
  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: "ต่อเวลาคุยเองแล้ว" };
}

export async function sendManualReply(
  conversationId: string,
  text: string,
): Promise<DashboardActionResult> {
  if (!supabase) {
    return { ok: false, message: "โหมดตัวอย่าง: ยังไม่ส่งจริง" };
  }
  const { error } = await supabase.functions.invoke("ladda-manual-reply", {
    body: { conversation_id: conversationId, text },
  });
  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: "ส่งข้อความแล้ว" };
}
