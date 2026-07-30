import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../packages/database/src/database.types";
import { resolveRuntimeMode } from "./runtimePolicy";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const dashboardRuntimeMode = resolveRuntimeMode({
  isDev: import.meta.env.DEV,
  demoRequested: import.meta.env.VITE_ENABLE_DEMO === "true",
  supabaseConfigured,
});
export const microsoftLoginEnabled =
  import.meta.env.VITE_ENABLE_MICROSOFT_LOGIN === "true";

export const supabase = supabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
