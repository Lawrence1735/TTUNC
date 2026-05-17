import React, { useState, useMemo } from "react";
import { TabsContent } from "./ui/tabs";
import {
  Folder, CalendarClock, TrendingUp, Search, ChevronLeft,
  ChevronRight, Calendar, MapPin, ChevronDown, Check, X,
  Send, User, FileText, Music, Phone, Mail, GraduationCap,
} from "lucide-react";

interface DirectorRecruitmentTabProps {
  pendingApps: number;
  scheduledInterviews: number;
  applicationsThisWeek: number;
  filteredApplications: any[];
  interviewSchedules: any[];
  handleViewApplication: (app: any) => void;
  handleSetSchedule: (app: any) => void;
  handleApproveInterview: (id: string) => void;
  handleRejectInterview: (id: string) => void;
}

const TALENT_GROUP_LABELS: Record<string, string> = {
  "marching-band": "Marching Band",
  "glee-club": "Glee Club",
  "dance-club": "Dance Club",
  majorettes: "Majorettes",
};

const STATUS_MAP: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending:       { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", label: "Pending"       },
  scheduled:     { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE", label: "Scheduled"     },
  approved:      { bg: "#F0FDF4", text: "#14532D", border: "#BBF7D0", label: "Approved"      },
  qualified:     { bg: "#F0FDF4", text: "#14532D", border: "#BBF7D0", label: "Qualified"     },
  not_qualified: { bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA", label: "Not Qualified" },
  disapproved:   { bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA", label: "Disapproved"   },
};

const DENIAL_REASONS = [
  "Did not meet talent requirements",
  "Incomplete documentation",
  "Interview no-show",
  "Failed audition evaluation",
  "Slot already filled",
  "Other",
];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_ABBRS   = ["S","M","T","W","T","F","S"];

/* ─── Backdrop overlay ─── */
function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(4px)",
      }}
    />
  );
}

/* ─── Modal shell ─── */
function Modal({
  title, subtitle, onClose, footer, children, width = 480,
}: {
  title: string; subtitle?: string; onClose: () => void;
  footer: React.ReactNode; children: React.ReactNode; width?: number;
}) {
  return (
    <>
      <Backdrop onClick={onClose} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 51,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, pointerEvents: "none",
      }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width, maxWidth: "100%", background: "#fff",
            borderRadius: 12, boxShadow: "0 20px 60px -10px rgba(0,0,0,0.25)",
            pointerEvents: "auto", overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0 }}>{title}</h3>
              {subtitle && <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94A3B8", lineHeight: 1, borderRadius: 6 }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
          {/* Body */}
          <div style={{ padding: "20px 24px" }}>{children}</div>
          {/* Footer */}
          <div style={{ padding: "12px 24px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #F1F5F9" }}>
            {footer}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Shared form atoms ─── */
const inputStyle: React.CSSProperties = {
  width: "100%", height: 40, padding: "0 12px",
  fontSize: 14, color: "#0F172A",
  border: "1px solid #E2E8F0", borderRadius: 8,
  outline: "none", background: "#F8FAFC",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "#475569", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.06em",
};
const fieldWrap: React.CSSProperties = { marginBottom: 16 };

/* ─── Btn helpers ─── */
function CancelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 18px", borderRadius: 8,
      border: "1px solid #E2E8F0", background: "#fff",
      fontSize: 14, fontWeight: 500, color: "#475569", cursor: "pointer",
    }}>
      Cancel
    </button>
  );
}

/* ─── Modal A: Schedule Interview ─── */
function ScheduleModal({ app, onClose, onConfirm }: { app: any; onClose: () => void; onConfirm: (data: any) => void }) {
  const [form, setForm] = useState({ date: "", time: "", venue: "Music Building Room 201", notes: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Modal
      title="Schedule Interview"
      subtitle={`Set interview date and time for ${app.personalInfo?.name ?? "applicant"}`}
      onClose={onClose}
      width={500}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => { onConfirm(form); onClose(); }}
          disabled={!form.date || !form.time}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 20px", borderRadius: 8,
            background: (!form.date || !form.time) ? "#CBD5E1" : "#7A1E1E",
            border: "none", fontSize: 14, fontWeight: 600,
            color: "#fff", cursor: (!form.date || !form.time) ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          <Send style={{ width: 14, height: 14 }} />
          Send Schedule
        </button>
      </>}
    >
      <div style={fieldWrap}>
        <label style={labelStyle}>Interview Date <span style={{ color: "#DC2626" }}>*</span></label>
        <input type="date" value={form.date} onChange={set("date")} style={inputStyle} required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, ...fieldWrap }}>
        <div>
          <label style={labelStyle}>Time <span style={{ color: "#DC2626" }}>*</span></label>
          <input type="time" value={form.time} onChange={set("time")} style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>Venue</label>
          <input type="text" value={form.venue} onChange={set("venue")} placeholder="Room / Location" style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Notes <span style={{ color: "#94A3B8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(Optional)</span></label>
        <textarea
          value={form.notes} onChange={set("notes")}
          placeholder="Any additional notes for this interview..."
          rows={3}
          style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
        />
      </div>
    </Modal>
  );
}

/* ─── Modal B: Approve Application ─── */
function ApproveModal({ app, onClose, onConfirm }: { app: any; onClose: () => void; onConfirm: () => void }) {
  const [notes, setNotes] = useState("");
  return (
    <Modal
      title="Approve Application"
      subtitle={`Confirm scholarship approval for ${app.personalInfo?.name ?? "applicant"}`}
      onClose={onClose}
      width={480}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => { onConfirm(); onClose(); }}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: "#14532D", border: "none",
            fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer",
          }}
        >
          Confirm Approval
        </button>
      </>}
    >
      {/* Notice */}
      <div style={{
        background: "#F0FDF4", border: "1px solid #BBF7D0",
        borderRadius: 8, padding: "12px 14px", marginBottom: 20,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <Check style={{ width: 16, height: 16, color: "#15803D", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: "#14532D", lineHeight: 1.5, margin: 0 }}>
          Approving this application will move <strong>{app.personalInfo?.name ?? "this applicant"}</strong> to the official talent scholar roster and trigger onboarding.
        </p>
      </div>
      <div>
        <label style={labelStyle}>Approval Notes / Remarks <span style={{ color: "#94A3B8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(Optional)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any remarks or conditions for this approval..."
          rows={3}
          style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
        />
      </div>
    </Modal>
  );
}

/* ─── Modal C: Deny Application ─── */
function DenyModal({ app, onClose, onConfirm }: { app: any; onClose: () => void; onConfirm: () => void }) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  return (
    <Modal
      title="Deny Application"
      subtitle={`Reject application for ${app.personalInfo?.name ?? "applicant"}`}
      onClose={onClose}
      width={480}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => { if (reason && feedback) { onConfirm(); onClose(); } }}
          disabled={!reason || !feedback}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: (!reason || !feedback) ? "#CBD5E1" : "#7F1D1D",
            border: "none", fontSize: 14, fontWeight: 600,
            color: "#fff", cursor: (!reason || !feedback) ? "not-allowed" : "pointer",
          }}
        >
          Confirm Rejection
        </button>
      </>}
    >
      {/* Warning notice */}
      <div style={{
        background: "#FEF2F2", border: "1px solid #FECACA",
        borderRadius: 8, padding: "12px 14px", marginBottom: 20,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <X style={{ width: 16, height: 16, color: "#B91C1C", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.5, margin: 0 }}>
          This action will permanently deny <strong>{app.personalInfo?.name ?? "this applicant"}'s</strong> scholarship application. This cannot be undone.
        </p>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Reason for Denial <span style={{ color: "#DC2626" }}>*</span></label>
        <div style={{ position: "relative" }}>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 32 }}
          >
            <option value="">Select a reason...</option>
            {DENIAL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94A3B8", pointerEvents: "none" }} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Additional Feedback / Notes <span style={{ color: "#DC2626" }}>*</span></label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide specific feedback explaining this rejection decision..."
          rows={4}
          style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
          required
        />
      </div>
    </Modal>
  );
}

/* ─── Modal D: Student Profile ─── */
function ProfileModal({ app, onClose }: { app: any; onClose: () => void }) {
  const info = app.personalInfo ?? {};
  const group = TALENT_GROUP_LABELS[app.talentGroup] ?? app.talentGroup ?? "—";
  const status = app.status ?? "pending";
  const badge = STATUS_MAP[status] ?? STATUS_MAP.pending;
  const appliedDate = app.appliedAt
    ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon style={{ width: 14, height: 14, color: "#7A1E1E" }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#7A1E1E", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</span>
      </div>
      <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "12px 14px" }}>{children}</div>
    </div>
  );

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 16 }}>
      <span style={{ fontSize: 12, color: "#64748B", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172A", textAlign: "right" }}>{value || "—"}</span>
    </div>
  );

  return (
    <Modal
      title="Student Profile"
      subtitle={`Comprehensive application details for ${info.name ?? "applicant"}`}
      onClose={onClose}
      width={560}
      footer={
        <button onClick={onClose} style={{ padding: "9px 24px", borderRadius: 8, background: "#7A1E1E", border: "none", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
          Close
        </button>
      }
    >
      {/* Identity strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 16px", background: "#F8FAFC",
        borderRadius: 10, marginBottom: 20,
        border: "1px solid #E2E8F0",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "#F9EAEA", border: "2px solid #7A1E1E",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <User style={{ width: 20, height: 20, color: "#7A1E1E" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>{info.name ?? "—"}</p>
          <p style={{ fontSize: 12, color: "#94A3B8", margin: "2px 0 0", fontFamily: "monospace" }}>{info.studentId ?? "—"}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 500, background: "#EFF6FF", color: "#1D4ED8", borderRadius: 999, padding: "3px 10px" }}>
            {group}
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, background: badge.bg, color: badge.text, borderRadius: 999, padding: "3px 10px", border: `1px solid ${badge.border}` }}>
            {badge.label}
          </span>
        </div>
      </div>

      <Section icon={User} title="Personal Information">
        <Row label="Full Name"     value={info.name} />
        <Row label="Student ID"    value={info.studentId} />
        <Row label="Email Address" value={info.email} />
        <Row label="Phone Number"  value={info.phone} />
        <Row label="Year Level"    value={info.yearLevel} />
        <Row label="Course"        value={info.course} />
        <Row label="Address"       value={info.address} />
      </Section>

      {(info.emergencyContact || info.emergencyPhone) && (
        <Section icon={Phone} title="Emergency Contact">
          <Row label="Contact Name"  value={info.emergencyContact} />
          <Row label="Contact Phone" value={info.emergencyPhone} />
        </Section>
      )}
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════ */
export function DirectorRecruitmentTab({
  pendingApps,
  scheduledInterviews,
  applicationsThisWeek,
  filteredApplications,
  interviewSchedules,
  handleViewApplication,
  handleSetSchedule,
  handleApproveInterview,
  handleRejectInterview,
}: DirectorRecruitmentTabProps) {
  const today = new Date(2026, 4, 17);
  const [calYear,      setCalYear]      = useState(today.getFullYear());
  const [calMonth,     setCalMonth]     = useState(today.getMonth());
  const [selectedDay,  setSelectedDay]  = useState(today.getDate());
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
  const [scheduleApp,  setScheduleApp]  = useState<any | null>(null);
  const [approveApp,   setApproveApp]   = useState<any | null>(null);
  const [denyApp,      setDenyApp]      = useState<any | null>(null);
  const [profileApp,   setProfileApp]   = useState<any | null>(null);

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); setSelectedDay(1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); setSelectedDay(1); };

  const daysInMonth  = getDaysInMonth(calYear, calMonth);
  const firstDaySlot = getFirstDayOfMonth(calYear, calMonth);

  const interviewDays = useMemo(() => {
    const s = new Set<number>();
    interviewSchedules.forEach((iv) => { const d = new Date(iv.date); if (d.getFullYear() === calYear && d.getMonth() === calMonth) s.add(d.getDate()); });
    return s;
  }, [interviewSchedules, calYear, calMonth]);

  const selectedDayEvents = useMemo(() =>
    interviewSchedules.filter((iv) => { const d = new Date(iv.date); return d.getFullYear() === calYear && d.getMonth() === calMonth && d.getDate() === selectedDay; }),
    [interviewSchedules, calYear, calMonth, selectedDay]);

  const displayedApps = useMemo(() =>
    filteredApplications.filter((app) => {
      const name = app.personalInfo?.name?.toLowerCase() ?? "";
      const id   = app.personalInfo?.studentId?.toLowerCase() ?? "";
      const q    = search.toLowerCase();
      return (!q || name.includes(q) || id.includes(q)) && (statusFilter === "all" || (app.status ?? "pending") === statusFilter);
    }),
    [filteredApplications, search, statusFilter]);

  const calendarCells: (number | null)[] = [...Array(firstDaySlot).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <TabsContent value="recruitment" id="tab-panel-recruitment" role="tabpanel" aria-label="Recruitment">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Metric Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { icon: Folder,        label: "Pending Applications",   val: pendingApps          },
            { icon: CalendarClock, label: "Scheduled Interviews",   val: scheduledInterviews  },
            { icon: TrendingUp,    label: "Applications This Week", val: applicationsThisWeek },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F9EAEA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 18, height: 18, color: "#7A1E1E" }} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#64748B", marginBottom: 6, lineHeight: 1 }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: val === 0 ? "#CBD5E1" : "#0F172A", lineHeight: 1 }}>{val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── 65/35 split ── */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

          {/* ══ LEFT: Pipeline Table ══ */}
          <div style={{ flex: "0 0 65%", width: "65%", background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "24px" }}>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0 }}>Application Workflow Pipeline</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
                  <input
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search applicants..."
                    style={{ ...inputStyle, width: 200, paddingLeft: 32 }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ ...inputStyle, width: 160, paddingRight: 28, appearance: "none", cursor: "pointer" }}>
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="approved">Approved</option>
                    <option value="disapproved">Disapproved</option>
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#64748B", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                  {["Applicant Details", "Applied Date", "Status", "Actions"].map((col) => (
                    <th key={col} style={{ paddingBottom: 10, textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#94A3B8", paddingRight: col === "Actions" ? 0 : 20 }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedApps.length > 0 ? displayedApps.map((app) => {
                  const status = app.status ?? "pending";
                  const badge  = STATUS_MAP[status] ?? STATUS_MAP.pending;
                  const appliedDate = app.appliedAt
                    ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—";

                  return (
                    <tr key={app.id} style={{ borderBottom: "1px solid #F8FAFC" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Applicant details */}
                      <td style={{ padding: "16px 20px 16px 0" }}>
                        <button
                          onClick={() => setProfileApp(app)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                        >
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#7A1E1E", margin: 0, lineHeight: 1.3, textDecoration: "underline", textDecorationColor: "rgba(122,30,30,0.3)" }}>
                            {app.personalInfo?.name ?? "—"}
                          </p>
                        </button>
                        <p style={{ fontSize: 11, color: "#94A3B8", margin: "3px 0 0", fontFamily: "monospace" }}>
                          {app.personalInfo?.studentId ?? "—"}
                        </p>
                      </td>
                      {/* Applied date */}
                      <td style={{ padding: "16px 20px 16px 0", fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>
                        {appliedDate}
                      </td>
                      {/* Status badge */}
                      <td style={{ padding: "16px 20px 16px 0" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          background: badge.bg, color: badge.text,
                          border: `1px solid ${badge.border}`,
                          borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap",
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      {/* Action icons */}
                      <td style={{ padding: "16px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {/* Schedule */}
                          <button
                            title="Schedule Interview"
                            onClick={() => setScheduleApp(app)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#BFDBFE"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; }}
                          >
                            <Calendar style={{ width: 14, height: 14, color: "#1D4ED8" }} />
                          </button>
                          {/* Approve */}
                          <button
                            title="Approve Application"
                            onClick={() => setApproveApp(app)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0FDF4"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#BBF7D0"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; }}
                          >
                            <Check style={{ width: 14, height: 14, color: "#15803D" }} />
                          </button>
                          {/* Deny */}
                          <button
                            title="Deny Application"
                            onClick={() => setDenyApp(app)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#FECACA"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; }}
                          >
                            <X style={{ width: 14, height: 14, color: "#B91C1C" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} style={{ padding: "64px 0", textAlign: "center", fontSize: 13, color: "#CBD5E1" }}>
                      No applications match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ══ RIGHT: Calendar 35% ══ */}
          <div style={{ flex: "0 0 35%", width: "35%", background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar style={{ width: 14, height: 14, color: "#7A1E1E" }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Interview Schedule</span>
                </div>
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 3, lineHeight: 1 }}>Upcoming and completed evaluations</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={prevMonth} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <ChevronLeft style={{ width: 12, height: 12, color: "#94A3B8" }} />
                </button>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", width: 90, textAlign: "center" }}>
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>
                <button onClick={nextMonth} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <ChevronRight style={{ width: 12, height: 12, color: "#94A3B8" }} />
                </button>
              </div>
            </div>

            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {DAY_ABBRS.map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: "#CBD5E1", padding: "2px 0" }}>{d}</div>
              ))}
            </div>

            {/* Date cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginTop: -8 }}>
              {calendarCells.map((day, i) => {
                if (!day) return <div key={i} style={{ padding: "4px 0" }} />;
                const isSelected = day === selectedDay;
                const hasEvent   = interviewDays.has(day);
                return (
                  <div key={i} onClick={() => setSelectedDay(day)} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3px 0", cursor: "pointer" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: isSelected ? 700 : 400, background: isSelected ? "#7A1E1E" : "transparent", color: isSelected ? "#fff" : "#374151" }}>
                      {day}
                    </div>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 2, background: hasEvent ? (isSelected ? "rgba(255,255,255,0.6)" : "#7A1E1E") : "transparent" }} />
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {MONTH_NAMES[calMonth]} {selectedDay} — Schedule
              </p>
              {selectedDayEvents.length > 0 ? selectedDayEvents.map((ev) => (
                <div key={ev.id} style={{ background: "#EFF6FF", borderLeft: "3px solid #1D4ED8", borderRadius: "0 8px 8px 0", padding: "10px 12px" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", margin: 0, lineHeight: 1.4 }}>{ev.applicantName} — {ev.time}</p>
                  {ev.venue && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <MapPin style={{ width: 10, height: 10, color: "#94A3B8", flexShrink: 0 }} />
                      <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{ev.venue}</p>
                    </div>
                  )}
                </div>
              )) : (
                <p style={{ fontSize: 12, color: "#CBD5E1", margin: 0, padding: "6px 0" }}>No interviews scheduled for this day.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {scheduleApp && (
        <ScheduleModal
          app={scheduleApp}
          onClose={() => setScheduleApp(null)}
          onConfirm={(data) => handleSetSchedule({ ...scheduleApp, scheduleData: data })}
        />
      )}
      {approveApp && (
        <ApproveModal
          app={approveApp}
          onClose={() => setApproveApp(null)}
          onConfirm={() => handleApproveInterview(approveApp.id)}
        />
      )}
      {denyApp && (
        <DenyModal
          app={denyApp}
          onClose={() => setDenyApp(null)}
          onConfirm={() => handleRejectInterview(denyApp.id)}
        />
      )}
      {profileApp && (
        <ProfileModal
          app={profileApp}
          onClose={() => setProfileApp(null)}
        />
      )}
    </TabsContent>
  );
}
