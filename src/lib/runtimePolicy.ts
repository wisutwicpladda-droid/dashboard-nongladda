export type DashboardRuntimeMode = "live" | "demo" | "configuration_error";

type RuntimeModeInput = {
  isDev: boolean;
  demoRequested: boolean;
  supabaseConfigured: boolean;
};

export function resolveRuntimeMode({
  isDev,
  demoRequested,
  supabaseConfigured,
}: RuntimeModeInput): DashboardRuntimeMode {
  if (supabaseConfigured) return "live";
  if (isDev && demoRequested) return "demo";
  return "configuration_error";
}
