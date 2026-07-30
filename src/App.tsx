import {
  Activity,
  Bot,
  CheckCircle2,
  Clock3,
  LogOut,
  MessageCircle,
  MonitorCog,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  claimConversation,
  extendConversation,
  getAdminSession,
  loadDashboardData,
  releaseConversation,
  sendManualReply,
  signInWithMagicLink,
  signInWithMicrosoft,
  signOut,
} from "./lib/laddaRepository";
import {
  dashboardRuntimeMode,
  microsoftLoginEnabled,
  supabase,
} from "./lib/supabaseClient";
import type {
  AdminSession,
  ConversationRecord,
  CustomerRecord,
  DashboardData,
  MessageRecord,
} from "./lib/types";
import { demoData, emptyLiveData } from "./lib/demoData";

type ViewKey = "overview" | "inbox" | "crm" | "tasks" | "system";

const navItems: Array<{ key: ViewKey; label: string; icon: typeof Activity }> = [
  { key: "overview", label: "ภาพรวม", icon: Activity },
  { key: "inbox", label: "กล่องข้อความ", icon: MessageCircle },
  { key: "crm", label: "ลูกค้า CRM", icon: UsersRound },
  { key: "tasks", label: "งานติดตาม", icon: Clock3 },
  { key: "system", label: "ระบบ AI", icon: MonitorCog },
];

function compactDate(value: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function statusText(status: string): string {
  if (status === "ok") return "ปกติ";
  if (status === "warn") return "ต้องดู";
  if (status === "down") return "ขัดข้อง";
  return status;
}

function AppSidebar({
  activeView,
  data,
  onSelect,
}: {
  activeView: ViewKey;
  data: DashboardData;
  onSelect: (view: ViewKey) => void;
}) {
  const sidebarStatus = data.serviceStatus.some((item) => item.status === "down")
    ? { className: "down", label: "ระบบมีปัญหา" }
    : data.serviceStatus.length === 0
      ? { className: "unknown", label: "ยังไม่มีข้อมูลระบบ" }
      : data.serviceStatus.some((item) => item.status === "warn")
        ? { className: "warn", label: "มีรายการต้องตรวจ" }
        : { className: "ok", label: "ระบบพร้อมใช้งาน" };
  return (
    <aside className="sidebar">
      <div className="brand">
        <strong>น้องลัดดา</strong>
        <span>ระบบดูแลลูกค้าของบริษัท</span>
      </div>
      <nav className="nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const badge =
            item.key === "inbox" && data.unresolvedCount > 0
              ? data.unresolvedCount
              : null;
          return (
            <button
              className={`nav-item ${activeView === item.key ? "active" : ""}`}
              key={item.key}
              onClick={() => onSelect(item.key)}
              type="button"
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {badge ? <em>{badge}</em> : null}
            </button>
          );
        })}
      </nav>
      <div className={`sidebar-status ${sidebarStatus.className}`}>
        <span />
        {sidebarStatus.label}
      </div>
    </aside>
  );
}

function Topbar({
  session,
  search,
  onSearch,
  onRefresh,
}: {
  session: AdminSession | null;
  search: string;
  onSearch: (value: string) => void;
  onRefresh: () => void;
}) {
  return (
    <header className="topbar">
      <label className="search-box">
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="ค้นหาชื่อลูกค้า เบอร์โทร หรือข้อความ"
        />
      </label>
      <button className="icon-button" onClick={onRefresh} title="โหลดข้อมูลใหม่" type="button">
        <RefreshCw size={17} />
      </button>
      <div className="user-chip">
        <span>{session?.name.slice(0, 1) || "จ"}</span>
        <div>
          <strong>{session?.name || "แอดมิน"}</strong>
          <small>{session?.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}</small>
        </div>
      </div>
    </header>
  );
}

function AuthPanel({
  session,
  toast,
  onToast,
  onReload,
}: {
  session: AdminSession | null;
  toast: string;
  onToast: (message: string) => void;
  onReload: () => void;
}) {
  const [email, setEmail] = useState("");

  async function handleMagicLink() {
    const result = await signInWithMagicLink(email);
    onToast(result.message);
  }

  if (dashboardRuntimeMode === "configuration_error") {
    return (
      <div className="notice error">
        <ShieldCheck size={18} />
        <span>Dashboard ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล</span>
      </div>
    );
  }

  if (dashboardRuntimeMode === "demo") {
    return (
      <div className="notice">
        <ShieldCheck size={18} />
        <span>โหมดพัฒนา: กำลังแสดงข้อมูลตัวอย่าง</span>
      </div>
    );
  }

  if (session) {
    return (
      <div className="notice live">
        <CheckCircle2 size={18} />
        <span>เชื่อม Supabase แล้ว: {session.email}</span>
        <button
          className="ghost-button"
          onClick={async () => {
            await signOut();
            onReload();
          }}
          type="button"
        >
          <LogOut size={15} />
          ออก
        </button>
      </div>
    );
  }

  return (
    <section className="auth-panel">
      <div>
        <strong>เข้าสู่ระบบแอดมิน</strong>
        <p>ใช้บัญชีบริษัทเพื่อดูข้อมูลจริงและตอบลูกค้าแบบ manual</p>
      </div>
      {microsoftLoginEnabled ? (
        <button
          className="primary-button"
          onClick={async () => {
            const result = await signInWithMicrosoft();
            onToast(result.message);
          }}
          type="button"
        >
          เข้าด้วย Microsoft
        </button>
      ) : null}
      <label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="อีเมลแอดมิน"
          type="email"
        />
      </label>
      <button className="secondary-button" onClick={handleMagicLink} type="button">
        ส่งลิงก์เข้าใช้งาน
      </button>
      {toast ? <small>{toast}</small> : null}
    </section>
  );
}

function Overview({
  data,
  onOpenInbox,
  onOpenTasks,
  onOpenSystem,
  onRefresh,
}: {
  data: DashboardData;
  onOpenInbox: () => void;
  onOpenTasks: () => void;
  onOpenSystem: () => void;
  onRefresh: () => void;
}) {
  const urgent = data.conversations.filter((item) => item.risk === "urgent").length;
  const unhealthyServices = data.serviceStatus.filter((item) => item.status !== "ok").length;
  const systemStatus = data.serviceStatus.some((item) => item.status === "down")
    ? "ขัดข้อง"
    : unhealthyServices > 0 || data.serviceStatus.length === 0
      ? "ต้องตรวจสอบ"
      : "ปกติ";
  const currentDate = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "full",
  }).format(new Date());
  const latencyText = data.averageLatencyMs == null
    ? "-"
    : `${(data.averageLatencyMs / 1000).toFixed(1)} วิ`;
  return (
    <section className="view">
      <div className="page-title">
        <div>
          <h1>ภาพรวมวันนี้</h1>
          <p>{currentDate}</p>
        </div>
        <button className="secondary-button" onClick={onRefresh} type="button">โหลดข้อมูลล่าสุด</button>
      </div>

      <div className="health-strip">
        <div className="strip-title">
          <span />
          <strong>สถานะระบบ</strong>
          <em>{systemStatus}</em>
        </div>
        <div className="metric-grid">
          <Metric label="ข้อความวันนี้" value={String(data.todayMessageCount)} hint="ข้อมูลจาก Supabase" />
          <Metric
            label="รอแอดมิน"
            value={`${data.unresolvedCount} เคส`}
            hint={data.oldestUnresolvedMinutes == null ? "ไม่มีเคสรอ" : `เก่าสุด ${data.oldestUnresolvedMinutes} นาที`}
          />
          <Metric label="ความเร็วเฉลี่ย" value={latencyText} hint="จากงาน AI ล่าสุด" />
          <Metric
            label="คิว AI ตอนนี้"
            value={`${data.aiQueueNow} งาน`}
            hint={data.aiSuccessRate ? `ตอบสำเร็จ ${data.aiSuccessRate}%` : "ยังไม่มีข้อมูล"}
          />
        </div>
      </div>

      <div className="overview-grid">
        <section className="panel action-panel">
          <div className="panel-head">
            <h2>ต้องจัดการตอนนี้</h2>
            <button className="secondary-button" onClick={onOpenInbox} type="button">
              เปิดกล่องข้อความ
            </button>
          </div>
          <ActionRow count={urgent} title="ลูกค้ารอแอดมินตอบ" detail="เปิดเคสที่ต้องตรวจสอบก่อน" button="เปิดดู" onClick={onOpenInbox} />
          <ActionRow count={data.followUps.length} title="งานติดตาม" detail="โทรกลับและติดตามผลกับลูกค้า" button="ดูงาน" onClick={onOpenTasks} />
          <ActionRow count={unhealthyServices} title="บริการที่ต้องตรวจสอบ" detail="ดูสถานะจากข้อมูลตรวจระบบล่าสุด" button="ดูระบบ" onClick={onOpenSystem} />
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>สถานะบริการ</h2>
            <span className={`pill ${systemStatus === "ปกติ" ? "ok" : "watch"}`}>{systemStatus}</span>
          </div>
          <div className="service-list">
            {data.serviceStatus.map((item) => (
              <div className="service-row" key={item.service}>
                <div>
                  <strong>{item.service}</strong>
                  <span>{item.detail}</span>
                </div>
                <em className={`pill ${item.status}`}>{statusText(item.status)}</em>
              </div>
            ))}
            {data.serviceStatus.length === 0 ? <div className="empty-state">ยังไม่มีข้อมูลตรวจระบบ</div> : null}
          </div>
        </section>
      </div>
    </section>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function ActionRow({
  count,
  title,
  detail,
  button,
  onClick,
}: {
  count: number;
  title: string;
  detail: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="action-row">
      <span>{count}</span>
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
      <button className={count > 0 ? "primary-button" : "secondary-button"} onClick={onClick} type="button">
        {button}
      </button>
    </div>
  );
}

function Inbox({
  conversations,
  selected,
  canManage,
  onSelect,
  onClaim,
  onRelease,
  onExtend,
  onSend,
}: {
  conversations: ConversationRecord[];
  selected: ConversationRecord | null;
  canManage: boolean;
  onSelect: (conversation: ConversationRecord) => void;
  onClaim: (conversationId: string) => void;
  onRelease: (conversationId: string) => void;
  onExtend: (conversationId: string) => void;
  onSend: (conversationId: string, text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const active = selected || conversations[0] || null;

  useEffect(() => {
    setDraft("");
  }, [active?.id]);

  return (
    <section className="view inbox-view">
      <div className="page-title compact">
        <div>
          <h1>กล่องข้อความ LINE</h1>
          <p>รับเคสเองเมื่อบอทไม่มั่นใจ แล้วบอทจะหยุดตอบชั่วคราว</p>
        </div>
      </div>
      <div className="inbox-grid">
        <section className="panel conversation-list">
          {conversations.map((conversation) => (
            <button
              className={`conversation-card ${active?.id === conversation.id ? "active" : ""}`}
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              type="button"
            >
              <span className={`risk-dot ${conversation.risk}`} />
              <div>
                <strong>{conversation.customerName}</strong>
                <small>{conversation.lastText}</small>
                <em>
                  {conversation.mode === "manual" ? "แอดมินคุยเอง" : "บอทดูแล"} · {compactDate(conversation.lastMessageAt)}
                </em>
              </div>
              {conversation.unreadCount ? <b>{conversation.unreadCount}</b> : null}
            </button>
          ))}
          {conversations.length === 0 ? <div className="empty-state">ยังไม่มีบทสนทนา</div> : null}
        </section>

        <section className="panel chat-panel">
          {active ? (
            <>
              <div className="chat-head">
                <div>
                  <h2>{active.customerName}</h2>
                  <p>
                    LINE UID: {active.lineUserId} · {active.province} · {active.crops.join(", ") || "ยังไม่ทราบพืช"}
                  </p>
                </div>
                <div className="chat-actions">
                  {!canManage ? (
                    <span className="pill watch">ดูได้อย่างเดียว</span>
                  ) : active.mode === "manual" ? (
                    <>
                      <button className="secondary-button" onClick={() => onExtend(active.id)} type="button">
                        ต่อเวลา
                      </button>
                      <button className="secondary-button" onClick={() => onRelease(active.id)} type="button">
                        คืนให้บอท
                      </button>
                    </>
                  ) : (
                    <button className="primary-button" onClick={() => onClaim(active.id)} type="button">
                      รับเคสเอง
                    </button>
                  )}
                </div>
              </div>
              <div className="manual-state">
                {active.mode === "manual"
                  ? `โหมด manual ถึง ${active.manualUntil ? compactDate(active.manualUntil) : "-"}`
                  : "บอทยังตอบอัตโนมัติ ถ้ารับเคสเอง Hermes จะหยุดตอบเคสนี้"}
              </div>
              <div className="messages">
                {active.messages.map((message) => (
                  <div className={`bubble ${message.direction}`} key={message.id}>
                    <span>{message.senderType === "customer" ? "ลูกค้า" : message.senderType === "bot" ? "บอท" : "แอดมิน"}</span>
                    <p>{message.text}</p>
                    <small>{compactDate(message.createdAt)} · {message.deliveryStatus}</small>
                  </div>
                ))}
              </div>
              <form
                className="reply-box"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!canManage || active.mode !== "manual" || !draft.trim()) return;
                  onSend(active.id, draft.trim());
                  setDraft("");
                }}
              >
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  disabled={!canManage || active.mode !== "manual"}
                  placeholder={active.mode === "manual" ? "พิมพ์คำตอบสั้น ๆ ให้ลูกค้าเข้าใจง่าย" : "รับเคสเองก่อนส่งข้อความ"}
                />
                <button
                  className="primary-button"
                  disabled={!canManage || active.mode !== "manual" || !draft.trim()}
                  type="submit"
                >
                  <Send size={16} />
                  ส่ง LINE
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state">ยังไม่มีข้อความ</div>
          )}
        </section>
      </div>
    </section>
  );
}

function Crm({ customers }: { customers: CustomerRecord[] }) {
  return (
    <section className="view">
      <div className="page-title compact">
        <div>
          <h1>ลูกค้า CRM</h1>
          <p>ลูกค้าที่ทัก LINE จะถูกจับเป็น 1 คนตาม LINE UID แล้วเติมข้อมูลจากบทสนทนา</p>
        </div>
      </div>
      <section className="panel customer-table">
        <div className="table-head">
          <span>ลูกค้า</span>
          <span>LINE UID</span>
          <span>พื้นที่ / พืช</span>
          <span>ข้อมูลที่บอทเก็บได้</span>
          <span>ติดต่อล่าสุด</span>
        </div>
        {customers.map((customer) => (
          <div className="customer-row" key={customer.id}>
            <div>
              <strong>{customer.name}</strong>
              <small>{customer.phone}</small>
            </div>
            <code>{customer.lineUserId}</code>
            <div>
              <span>{customer.province}</span>
              <small>{customer.crops.join(", ") || "ยังไม่ทราบ"}</small>
            </div>
            <div className="fact-list">
              {customer.facts.slice(0, 3).map((fact) => (
                <em key={`${customer.id}-${fact.type}`}>{fact.type}: {fact.value}</em>
              ))}
            </div>
            <span>{compactDate(customer.lastContactAt)}</span>
          </div>
        ))}
        {customers.length === 0 ? <div className="empty-state">ยังไม่มีข้อมูลลูกค้า</div> : null}
      </section>
    </section>
  );
}

function Tasks({ data }: { data: DashboardData }) {
  return (
    <section className="view">
      <div className="page-title compact">
        <div>
          <h1>งานติดตาม</h1>
          <p>งานที่แอดมินต้องโทรกลับหรือติดตามผลหลังแนะนำสินค้า</p>
        </div>
      </div>
      <section className="panel">
        {data.followUps.map((task) => (
          <div className="task-row" key={task.id}>
            <Clock3 size={18} />
            <div>
              <strong>{task.title}</strong>
              <small>{task.customerName} · ครบกำหนด {compactDate(task.dueAt)}</small>
            </div>
            <span className="pill watch">{task.status === "open" ? "รอทำ" : task.status}</span>
          </div>
        ))}
        {data.followUps.length === 0 ? <div className="empty-state">ยังไม่มีงานติดตาม</div> : null}
      </section>
    </section>
  );
}

function SystemView({ data }: { data: DashboardData }) {
  return (
    <section className="view">
      <div className="page-title compact">
        <div>
          <h1>ระบบ AI</h1>
          <p>ดูสถานะ LINE, Hermes, ฐานความรู้ และคิวงาน</p>
        </div>
      </div>
      <div className="system-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>สถานะบริการ</h2>
            <Bot size={20} />
          </div>
          {data.serviceStatus.map((item) => (
            <div className="service-row" key={item.service}>
              <div>
                <strong>{item.service}</strong>
                <span>{item.detail}</span>
              </div>
              <em className={`pill ${item.status}`}>{statusText(item.status)}</em>
            </div>
          ))}
          {data.serviceStatus.length === 0 ? <div className="empty-state">ยังไม่มีข้อมูลตรวจระบบ</div> : null}
        </section>
        <section className="panel system-help">
          <h2>กติกาตอบลูกค้า</h2>
          <p>ถ้าแอดมินกดรับเคสเอง ระบบจะตั้งโหมด manual ให้บทสนทนานั้นทันที</p>
          <p>Hermes จะไม่ส่งคำตอบอัตโนมัติจนกว่าแอดมินคืนเคสหรือหมดเวลา</p>
          <p>การส่ง LINE ใช้ Edge Function ฝั่ง server เท่านั้น ไม่ส่ง token เข้า browser</p>
        </section>
      </div>
    </section>
  );
}

export function App() {
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [data, setData] = useState<DashboardData>(
    dashboardRuntimeMode === "demo" ? demoData : emptyLiveData,
  );
  const [session, setSession] = useState<AdminSession | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  async function reload() {
    setLoading(true);
    setLoadError("");
    try {
      if (dashboardRuntimeMode === "configuration_error") {
        setSession(null);
        setData(emptyLiveData);
        return;
      }

      if (dashboardRuntimeMode === "demo") {
        setSession(null);
        setData(demoData);
        return;
      }

      const nextSession = await getAdminSession();
      setSession(nextSession);
      if (!nextSession || nextSession.role === "unknown") {
        setData(emptyLiveData);
        return;
      }

      const nextData = await loadDashboardData();
      setData(nextData);
      setSelectedConversationId((current) =>
        current && nextData.conversations.some((item) => item.id === current)
          ? current
          : nextData.conversations[0]?.id || null,
      );
    } catch (error) {
      setData(emptyLiveData);
      setLoadError(error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    const authSubscription = supabase?.auth.onAuthStateChange(() => {
      window.setTimeout(() => void reload(), 0);
    }).data.subscription;
    const refreshTimer = window.setInterval(() => void reload(), 15_000);
    return () => {
      authSubscription?.unsubscribe();
      window.clearInterval(refreshTimer);
    };
  }, []);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data.conversations;
    return data.conversations.filter((conversation) =>
      [
        conversation.customerName,
        conversation.lineUserId,
        conversation.lastText,
        conversation.province,
        conversation.crops.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [data.conversations, search]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data.customers;
    return data.customers.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.lineUserId,
        customer.province,
        customer.crops.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [data.customers, search]);

  const selectedConversation =
    filteredConversations.find((conversation) => conversation.id === selectedConversationId) ||
    filteredConversations[0] ||
    null;

  async function runAction(action: () => Promise<{ ok: boolean; message: string }>) {
    try {
      const result = await action();
      setToast(result.message);
      if (result.ok) await reload();
    } catch (error) {
      setToast(error instanceof Error ? error.message : "ทำรายการไม่สำเร็จ");
    }
  }

  const canManage = data.mode === "demo" || session?.role === "admin";

  function updateDemoConversation(
    conversationId: string,
    updater: (conversation: ConversationRecord) => ConversationRecord,
  ) {
    setData((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId ? updater(conversation) : conversation,
      ),
    }));
  }

  function handleClaim(conversationId: string) {
    if (!canManage) {
      setToast("บัญชีนี้ไม่มีสิทธิ์รับเคส");
      return;
    }
    if (data.mode === "demo") {
      updateDemoConversation(conversationId, (conversation) => ({
        ...conversation,
        mode: "manual",
        assignedAdminId: "demo-admin",
        manualUntil: new Date(Date.now() + 30 * 60_000).toISOString(),
      }));
      setToast("รับเคสแล้ว บอทจะหยุดตอบอัตโนมัติ");
      return;
    }
    void runAction(() => claimConversation(conversationId));
  }

  function handleRelease(conversationId: string) {
    if (!canManage) {
      setToast("บัญชีนี้ไม่มีสิทธิ์คืนเคส");
      return;
    }
    if (data.mode === "demo") {
      updateDemoConversation(conversationId, (conversation) => ({
        ...conversation,
        mode: "bot",
        assignedAdminId: null,
        manualUntil: null,
      }));
      setToast("คืนเคสให้บอทแล้ว");
      return;
    }
    void runAction(() => releaseConversation(conversationId));
  }

  function handleExtend(conversationId: string) {
    if (!canManage) {
      setToast("บัญชีนี้ไม่มีสิทธิ์ต่อเวลาเคส");
      return;
    }
    if (data.mode === "demo") {
      updateDemoConversation(conversationId, (conversation) => ({
        ...conversation,
        manualUntil: new Date(Date.now() + 30 * 60_000).toISOString(),
      }));
      setToast("ต่อเวลาคุยเองแล้ว");
      return;
    }
    void runAction(() => extendConversation(conversationId));
  }

  function handleSend(conversationId: string, text: string) {
    if (!canManage) {
      setToast("บัญชีนี้ไม่มีสิทธิ์ส่งข้อความ");
      return;
    }
    if (data.mode === "demo") {
      const nextMessage: MessageRecord = {
        id: `demo-admin-${Date.now()}`,
        direction: "outbound",
        senderType: "admin",
        text,
        createdAt: new Date().toISOString(),
        deliveryStatus: "sent",
      };
      updateDemoConversation(conversationId, (conversation) => ({
        ...conversation,
        lastText: text,
        messages: [...conversation.messages, nextMessage],
      }));
      setToast("โหมดตัวอย่าง: เพิ่มข้อความในหน้าจอแล้ว");
      return;
    }
    void runAction(() => sendManualReply(conversationId, text));
  }

  function view() {
    if (activeView === "overview") {
      return (
        <Overview
          data={data}
          onOpenInbox={() => setActiveView("inbox")}
          onOpenTasks={() => setActiveView("tasks")}
          onOpenSystem={() => setActiveView("system")}
          onRefresh={reload}
        />
      );
    }
    if (activeView === "inbox") {
      return (
        <Inbox
          conversations={filteredConversations}
          selected={selectedConversation}
          canManage={canManage}
          onSelect={(conversation) => setSelectedConversationId(conversation.id)}
          onClaim={handleClaim}
          onRelease={handleRelease}
          onExtend={handleExtend}
          onSend={handleSend}
        />
      );
    }
    if (activeView === "crm") return <Crm customers={filteredCustomers} />;
    if (activeView === "tasks") return <Tasks data={data} />;
    return <SystemView data={data} />;
  }

  const canViewDashboard =
    dashboardRuntimeMode === "demo" ||
    session?.role === "admin" ||
    session?.role === "viewer";

  return (
    <div className="app-shell">
      <AppSidebar activeView={activeView} data={data} onSelect={setActiveView} />
      <main className="main">
        <Topbar session={session} search={search} onSearch={setSearch} onRefresh={reload} />
        <div className="content">
          <AuthPanel
            session={session}
            toast={toast}
            onToast={setToast}
            onReload={reload}
          />
          {loading ? <div className="loading">กำลังโหลดข้อมูล...</div> : null}
          {!loading && loadError ? (
            <div className="notice error">{loadError}</div>
          ) : null}
          {!loading && !loadError && session?.role === "unknown" ? (
            <div className="notice error">บัญชีนี้ยังไม่มีสิทธิ์ใช้งาน กรุณาให้ผู้ดูแลเพิ่มบัญชีแอดมิน</div>
          ) : null}
          {!loading && !loadError && dashboardRuntimeMode === "live" && !session ? (
            <div className="panel empty-state">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลลูกค้า</div>
          ) : null}
          {!loading && !loadError && canViewDashboard ? view() : null}
        </div>
      </main>
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
