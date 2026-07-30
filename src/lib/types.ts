export type AppMode = "demo" | "live";

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "viewer" | "unknown";
};

export type MessageRecord = {
  id: string;
  direction: "inbound" | "outbound";
  senderType: "customer" | "bot" | "admin" | "system";
  text: string;
  createdAt: string;
  deliveryStatus: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  province: string;
  district: string;
  lineUserId: string;
  lineDisplayName: string;
  crops: string[];
  facts: Array<{ type: string; value: string; confidence: number }>;
  tags: string[];
  lastContactAt: string;
  status: string;
};

export type ConversationRecord = {
  id: string;
  customerId: string;
  customerName: string;
  lineUserId: string;
  province: string;
  crops: string[];
  status: "open" | "closed";
  mode: "bot" | "manual";
  assignedAdminId: string | null;
  manualUntil: string | null;
  version: number;
  unreadCount: number;
  lastMessageAt: string;
  lastText: string;
  risk: "normal" | "watch" | "urgent";
  messages: MessageRecord[];
};

export type FollowUpTaskRecord = {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  status: string;
  dueAt: string;
};

export type SystemStatusRecord = {
  service: string;
  status: "ok" | "warn" | "down";
  detail: string;
};

export type DashboardData = {
  mode: AppMode;
  conversations: ConversationRecord[];
  customers: CustomerRecord[];
  followUps: FollowUpTaskRecord[];
  serviceStatus: SystemStatusRecord[];
  aiQueueNow: number;
  aiSuccessRate: number;
  averageLatencyMs: number | null;
  oldestUnresolvedMinutes: number | null;
  todayMessageCount: number;
  unresolvedCount: number;
};

export type DashboardActionResult = {
  ok: boolean;
  message: string;
};
