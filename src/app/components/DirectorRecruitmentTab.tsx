import React, { useState, useMemo } from "react";
import { TabsContent } from "./ui/tabs";
import {
<<<<<<< Updated upstream
  Folder, CalendarClock, TrendingUp, Search, ChevronLeft,
  ChevronRight, Calendar, MapPin, ChevronDown, Check, X,
  Send, User, Phone,
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
=======
  Search, ChevronLeft,
  ChevronRight, ChevronDown, Check, X, AlertCircle, Calendar,
} from "lucide-react";

interface DirectorRecruitmentTabProps {
  // Props deprecated - now using API calls instead
  pendingApps?: number;
  scheduledInterviews?: number;
  applicationsThisWeek?: number;
  filteredApplications?: any[];
  interviewSchedules?: any[];
  handleViewApplication?: (app: any) => void;
  handleSetSchedule?: (app: any) => void;
  handleApproveInterview?: (id: string) => void;
  handleRejectInterview?: (id: string) => void;
  // New callback for when application is approved - triggers refresh of training tab
  onApprovalSuccess?: () => void | Promise<void>;
>>>>>>> Stashed changes
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
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0 }}>{title}</h3>
              {subtitle && <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94A3B8", lineHeight: 1, borderRadius: 6 }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <div style={{ padding: "20px 24px" }}>{children}</div>
          <div style={{ padding: "12px 24px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #F1F5F9" }}>
            {footer}
          </div>
        </div>
      </div>
    </>
  );
}

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

function DenyModal({ app, onClose, onConfirm }: { app: any; onClose: () => void; onConfirm: () => void }) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const feedbackLength = feedback.length;
  const isValidFeedback = feedbackLength >= 10;
  return (
    <Modal
      title="Deny Application"
      subtitle={`Reject application for ${app.personalInfo?.name ?? "applicant"}`}
      onClose={onClose}
      width={480}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
<<<<<<< Updated upstream
          onClick={() => { if (reason && feedback) { onConfirm(); onClose(); } }}
          disabled={!reason || !feedback}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: (!reason || !feedback) ? "#CBD5E1" : "#7F1D1D",
            border: "none", fontSize: 14, fontWeight: 600,
            color: "#fff", cursor: (!reason || !feedback) ? "not-allowed" : "pointer",
=======
          onClick={() => { if (reason && isValidFeedback) { onConfirm(reason, feedback); } }}
          disabled={!reason || !isValidFeedback || isLoading}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: (!reason || !isValidFeedback || isLoading) ? "#CBD5E1" : "#7F1D1D",
            border: "none", fontSize: 14, fontWeight: 600,
            color: "#fff", cursor: (!reason || !isValidFeedback || isLoading) ? "not-allowed" : "pointer",
>>>>>>> Stashed changes
          }}
        >
          Confirm Rejection
        </button>
      </>}
    >
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
<<<<<<< Updated upstream
        <label style={labelStyle}>Additional Feedback / Notes <span style={{ color: "#DC2626" }}>*</span></label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide specific feedback explaining this rejection decision..."
=======
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <label style={labelStyle}>Additional Feedback <span style={{ color: "#DC2626" }}>*</span></label>
          <span style={{ fontSize: 12, color: feedbackLength < 10 ? "#DC2626" : "#64748B" }}>{feedbackLength}/10+ chars</span>
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide specific feedback explaining this rejection (minimum 10 characters)..."
>>>>>>> Stashed changes
          rows={4}
          style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5, borderColor: feedbackLength > 0 && feedbackLength < 10 ? "#DC2626" : undefined }}
          required
        />
        {feedbackLength > 0 && feedbackLength < 10 && <p style={{ fontSize: 12, color: "#DC2626", margin: "4px 0 0 0" }}>Feedback must be at least 10 characters</p>}
      </div>
    </Modal>
  );
}

function ProfileModal({ app, onClose }: { app: any; onClose: () => void }) {
  const info = app.personalInfo ?? {};
  const group = TALENT_GROUP_LABELS[app.talentGroup] ?? app.talentGroup ?? "—";
  const status = app.status ?? "pending";
  const badge = STATUS_MAP[status] ?? STATUS_MAP.pending;

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

<<<<<<< Updated upstream
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

  const [scheduleApp,  setScheduleApp]  = useState<any | null>(null);
  const [approveApp,   setApproveApp]   = useState<any | null>(null);
  const [denyApp,      setDenyApp]      = useState<any | null>(null);
  const [profileApp,   setProfileApp]   = useState<any | null>(null);
=======
function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 60,
          background: "#F1F5F9",
          borderRadius: 8,
          animation: "pulse 2s infinite",
        }} />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "40px 20px",
      background: "#F8FAFC",
      borderRadius: 12,
      border: "1px dashed #E2E8F0",
    }}>
      <AlertCircle style={{ width: 40, height: 40, color: "#94A3B8", margin: "0 auto 16px" }} />
      <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>{message}</p>
    </div>
  );
}

// Interview Details Modal - displays interview information when calendar event is clicked
function InterviewDetailsModal({ interview, onClose }: { interview: any; onClose: () => void }) {
  if (!interview) return null;
  
  return (
    <Modal
      title="Interview Details"
      subtitle={interview.applicantName || "Applicant"}
      onClose={onClose}
      width={500}
      footer={<>
        <CancelBtn onClick={onClose} />
      </>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={labelStyle}>Applicant Name</label>
          <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>{interview.applicantName || "N/A"}</div>
        </div>
        <div>
          <label style={labelStyle}>Scheduled Date</label>
          <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>
            {interview.date ? new Date(interview.date).toLocaleDateString() : "N/A"}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Scheduled Time</label>
          <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>{interview.time || "N/A"}</div>
        </div>
        {interview.venue && (
          <div>
            <label style={labelStyle}>Location / Venue</label>
            <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>{interview.venue}</div>
          </div>
        )}
        {interview.notes && (
          <div>
            <label style={labelStyle}>Notes</label>
            <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500, whiteSpace: "pre-wrap" }}>{interview.notes}</div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function DirectorRecruitmentTab({ onApprovalSuccess }: DirectorRecruitmentTabProps) {
  const today = new Date(2026, 4, 20);  // May 20, 2026 - TODAY's date

  // Data state
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());  // Defaults to today (20)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scheduleApp, setScheduleApp] = useState<any | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [approveApp, setApproveApp] = useState<any | null>(null);
  const [denyApp, setDenyApp] = useState<any | null>(null);
  const [detailApp, setDetailApp] = useState<any | null>(null);
  const [interviewDetailsModal, setInterviewDetailsModal] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch ALL applications (remove status filter to get all statuses)
      // This ensures applicants remain visible after scheduling, approving, or rejecting
      const [appsRes, interviewsRes] = await Promise.all([
        apiClient.get('/recruitment/applications'),  // Removed ?status=pending to get ALL applications
        apiClient.get('/recruitment/interviews'),
      ]);

      // Handle nested data structure
      const applicationsData = Array.isArray(appsRes.data.data) ? appsRes.data.data : (Array.isArray(appsRes.data) ? appsRes.data : []);
      const interviewsData = Array.isArray(interviewsRes.data.data) ? interviewsRes.data.data : (Array.isArray(interviewsRes.data) ? interviewsRes.data : []);

      console.log('Fetched applications:', applicationsData);
      console.log('Application statuses:', applicationsData.map((app: any) => ({ id: app.id, status: app.status, hasInterview: !!app.interview })));
      console.log('Fetched interviews:', interviewsData);

      setApplications(applicationsData);
      setInterviews(interviewsData);
    } catch (err: any) {
      // apiClient returns { status, message, data, errors }
      const msg = err.data?.message || err.message || 'Failed to load recruitment data';
      console.error('Fetch error:', err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (applicationId: number, notes: string) => {
    try {
      setActionLoading(true);
      const response = await apiClient.post(`/recruitment/applications/${applicationId}/approve`, { approval_notes: notes });
      toast.success('Application approved');
      setApproveApp(null);
      
      // PRESERVE DATA: Update local state using .map() to preserve ALL properties
      setApplications(prev => prev.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,  // Spread ALL existing properties (applicant_name, email, etc.)
            status: 'approved',
            approval_notes: notes,
            // Preserve interview data if it exists
            interview: app.interview || response.data?.interview,
          };
        }
        return app;
      }));
      
      // Trigger callback to refresh training tab when new trainee is created
      if (onApprovalSuccess) {
        await onApprovalSuccess();
      }
    } catch (err: any) {
      // Handle validation errors (422)
      // Note: apiClient error interceptor returns { status, message, data, errors }
      console.error('Approve request failed. Full error object:', err);
      if (err.status === 422) {
        console.error('422 Response data:', err.data);
        const errors = err.errors;
        const message = err.data?.message;
        
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
          // Laravel validation errors
          const errorMessages = Object.entries(errors)
            .map(([field, msgs]: any) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
          console.error('Validation errors found:', errorMessages);
          toast.error(`Validation failed:\n${errorMessages}`);
        } else if (message) {
          // DomainException message (e.g., workflow violations)
          console.error('Approval failed with message:', message);
          toast.error(message);
        } else {
          console.error('422 Error response:', err.data);
          toast.error('Validation failed: ' + JSON.stringify(err.data));
        }
      } else {
        // Handle other errors
        console.error('Approve error:', err);
        toast.error(err.message || 'Failed to approve application');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (applicationId: number, reason: string, feedback: string) => {
    try {
      setActionLoading(true);
      const response = await apiClient.post(`/recruitment/applications/${applicationId}/reject`, {
        denial_reason: reason,
        denial_feedback: feedback
      });
      toast.success('Application rejected');
      setDenyApp(null);
      
      // PRESERVE DATA: Update local state using .map() to preserve ALL properties
      setApplications(prev => prev.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,  // Spread ALL existing properties (applicant_name, email, etc.)
            status: 'rejected',
            denial_reason: reason,
            denial_feedback: feedback,
            // Preserve interview data if it exists
            interview: app.interview || response.data?.interview,
          };
        }
        return app;
      }));
    } catch (err: any) {
      // Handle validation errors (422)
      // Note: apiClient error interceptor returns { status, message, data, errors }
      console.error('Reject request failed. Full error object:', err);
      if (err.status === 422) {
        console.error('422 Response data:', err.data);
        const errors = err.errors;
        const message = err.data?.message;
        
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
          // Laravel validation errors
          const errorMessages = Object.entries(errors)
            .map(([field, msgs]: any) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
          console.error('Validation errors found:', errorMessages);
          toast.error(`Validation failed:\n${errorMessages}`);
        } else if (message) {
          // DomainException message (e.g., workflow violations)
          console.error('Rejection failed with message:', message);
          toast.error(message);
        } else {
          console.error('422 Error response:', err.data);
          toast.error('Validation failed: ' + JSON.stringify(err.data));
        }
      } else {
        // Handle other errors
        console.error('Reject error:', err);
        toast.error(err.message || 'Failed to reject application');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleInterview = async (applicationId: number, data: any, isReschedule: boolean = false) => {
    try {
      setActionLoading(true);
      
      // Combine date and time into ISO datetime format (required by backend)
      const scheduledDateTime = new Date(`${data.date}T${data.time}:00`);
      const isoDateTime = scheduledDateTime.toISOString();
      
      const payload = {
        scheduled_at: isoDateTime,
        venue: data.venue || '',
        notes: data.notes || '',
      };
      
      // Find the application to check if it has an existing interview
      const appWithInterview = applications.find(app => app.id === applicationId);
      const interviewId = appWithInterview?.interview?.id;
      
      let response: any;
      
      // FIX 422 ERROR: Check if interview exists
      // If interview already exists, use PATCH to update it
      // If not, use POST to create a new one
      if (isReschedule && interviewId) {
        // Reschedule: PATCH existing interview
        response = await apiClient.patch(`/recruitment/interviews/${interviewId}`, payload);
      } else {
        // New schedule: POST to application endpoint
        const endpoint = `/recruitment/applications/${applicationId}/schedule-interview`;
        response = await apiClient.post(endpoint, payload);
      }
      
      toast.success(isReschedule ? 'Interview rescheduled' : 'Interview scheduled');
      setScheduleApp(null);
      setIsRescheduling(false);
      
      // PRESERVE DATA: Update local state using .map() to preserve all properties
      setApplications(prev => prev.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,  // Spread ALL existing properties (name, email, etc.)
            status: 'scheduled',
            // Merge new interview data from response
            interview: response.data?.interview || {
              id: interviewId,  // Preserve existing interview ID if updating
              scheduled_at: isoDateTime,
              venue: payload.venue,
              notes: payload.notes,
              ...app.interview,
            },
          };
        }
        return app;
      }));
    } catch (err: any) {
      // Extract error message from server response
      // apiClient returns { status, message, data, errors }
      const errorMessage = err.data?.message 
        || err.data?.error 
        || err.message 
        || `Failed to ${isReschedule ? 'reschedule' : 'schedule'} interview`;
      
      // Log full error for debugging
      console.error('Interview scheduling error:', {
        status: err.status,
        data: err.data,
        message: err.message,
      });
      
      toast.error(errorMessage);
      
      // Preserve state on error - do NOT update application status
      // Modal remains open so user can retry
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate stats
  const pendingApplications = applications.filter(app => 
    ['pending', 'not_scheduled'].includes((app.status || 'pending').toLowerCase())
  ).length;
  
  const applicationsThisWeek = applications.filter(app => {
    const createdAt = new Date(app.createdAt);
    // Use hardcoded today (May 20, 2026) instead of system date
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdAt >= sevenDaysAgo && createdAt <= today;
  }).length;
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  const displayedApps = useMemo(() =>
    filteredApplications.filter((app) => {
      const name = app.personalInfo?.name?.toLowerCase() ?? "";
      const id   = app.personalInfo?.studentId?.toLowerCase() ?? "";
      const q    = search.toLowerCase();
      return (!q || name.includes(q) || id.includes(q)) && (statusFilter === "all" || (app.status ?? "pending") === statusFilter);
    }),
    [filteredApplications, search, statusFilter]);
=======
  const displayedApps = useMemo(() => {
    console.log('Filtering applications:', { totalApps: applications.length, search, statusFilter });
    
    // UNIFIED FILTER: Combine search and status filter logic
    // This ensures search works regardless of casing or filtering layers
    const finalFilteredData = applications.filter((app) => {
      // Extract name and email with multiple fallback options (MATCH getApplicantName function)
      const name = (app.applicant_name || app.applicantName || app.name || app.candidate_name || app.personalInfo?.name || app.user?.name || "").toLowerCase();
      const email = (app.applicant_email || app.applicantEmail || app.email || app.personalInfo?.email || app.user?.email || "").toLowerCase();
      const studentId = (app.applicant_student_id || app.applicantStudentId || "").toLowerCase();
      
      // Search query (case-insensitive)
      const searchQuery = search.toLowerCase().trim();
      
      // Check if search term matches name, email, or student ID
      const matchesSearch = !searchQuery || 
                           name.includes(searchQuery) || 
                           email.includes(searchQuery) || 
                           studentId.includes(searchQuery);
      
      // Get normalized status - handle all backend status variants
      const appStatus = (app.status || 'pending').toLowerCase();
      
      // Normalize all status variants
      let normalizedStatus = appStatus;
      if (appStatus === 'not_scheduled') normalizedStatus = 'pending';
      if (appStatus === 'rejected' || appStatus === 'not_qualified') normalizedStatus = 'disapproved';
      if (appStatus === 'qualified') normalizedStatus = 'approved';
      if (appStatus === 'accepted') normalizedStatus = 'approved';
      
      // Check status filter - ALWAYS show all if "all" is selected
      const matchesStatus = statusFilter === "all" || statusFilter === "All" || 
                           normalizedStatus === statusFilter.toLowerCase() || 
                           appStatus === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });

    console.log('After filter:', { filtered: finalFilteredData.length });


    // Custom sorting function based on priority
    const sorted = finalFilteredData.sort((appA, appB) => {
      const todayDate = new Date(2026, 4, 20); // May 20, 2026
      const todayStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
      
      // Get status for both apps
      const statusA = (appA.status || 'pending').toLowerCase();
      const statusB = (appB.status || 'pending').toLowerCase();
      
      // Normalize status strings
      const normalizeStatus = (s: string) => {
        if (s === 'not_scheduled' || s === 'pending') return 'not_yet_scheduled';
        if (s === 'rejected' || s === 'disapproved') return 'rejected';
        if (s === 'approved' || s === 'accepted') return 'accepted';
        return s;
      };
      
      const normalizedStatusA = normalizeStatus(statusA);
      const normalizedStatusB = normalizeStatus(statusB);
      
      // PRIORITY 1: Scheduled interviews TODAY (May 20, 2026)
      const isAScheduledToday = normalizedStatusA === 'scheduled' && appA.interview?.scheduled_at 
        ? new Date(appA.interview.scheduled_at).toDateString() === todayStart.toDateString()
        : false;
      const isBScheduledToday = normalizedStatusB === 'scheduled' && appB.interview?.scheduled_at 
        ? new Date(appB.interview.scheduled_at).toDateString() === todayStart.toDateString()
        : false;
      
      if (isAScheduledToday && !isBScheduledToday) return -1;
      if (!isAScheduledToday && isBScheduledToday) return 1;
      
      // PRIORITY 2: Not Yet Scheduled
      if (normalizedStatusA === 'not_yet_scheduled' && normalizedStatusB !== 'not_yet_scheduled') return -1;
      if (normalizedStatusA !== 'not_yet_scheduled' && normalizedStatusB === 'not_yet_scheduled') return 1;
      
      // PRIORITY 3: Accepted
      if (normalizedStatusA === 'accepted' && normalizedStatusB !== 'accepted') return -1;
      if (normalizedStatusA !== 'accepted' && normalizedStatusB === 'accepted') return 1;
      
      // PRIORITY 4: Rejected (always at bottom)
      if (normalizedStatusA === 'rejected' && normalizedStatusB !== 'rejected') return 1;
      if (normalizedStatusA !== 'rejected' && normalizedStatusB === 'rejected') return -1;
      
      // If same priority, sort by applied date (newest first)
      return new Date(appB.applied_at || 0).getTime() - new Date(appA.applied_at || 0).getTime();
    });

    return sorted;
  }, [applications, search, statusFilter]);
>>>>>>> Stashed changes

  const calendarCells: (number | null)[] = [...Array(firstDaySlot).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <TabsContent 
      value="recruitment" 
      id="tab-panel-recruitment" 
      style={{ display: "block", width: "100%", border: "none", padding: 0, margin: 0, boxSizing: "border-box" }}
    >
      {/* ── Main Side-by-Side 70/30 Grid Split Container ── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "7fr 3fr", 
        gap: "24px", 
        width: "100%", 
        alignItems: "start", 
        boxSizing: "border-box" 
      }}>

<<<<<<< Updated upstream
        {/* ══ LEFT SECTION: Covers 70% Width (Quickstats + Workflow Table Container) ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", boxSizing: "border-box" }}>
          
          {/* Quickstat Metric Cards (Now inside the 70% layout side) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", width: "100%", boxSizing: "border-box" }}>
            {[
              { icon: Folder,        label: "Pending Applications",   val: pendingApps          },
              { icon: CalendarClock, label: "Scheduled Interviews",   val: scheduledInterviews  },
              { icon: TrendingUp,    label: "Applications This Week", val: applicationsThisWeek },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxSizing: "border-box" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F9EAEA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 16, height: 16, color: "#7A1E1E" }} />
=======
        {/* Left side: Application Pipeline - flex-1 fills available space, h-full stretches to parent height */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", flex: 1, boxSizing: "border-box" }}>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 100, background: "#F1F5F9", borderRadius: 12, animation: "pulse 2s infinite" }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", width: "100%", boxSizing: "border-box" }}>
              {[
                { label: "Pending Applications", val: pendingApplications, filterValue: "pending" },
                { label: "Scheduled Interviews", val: interviews.length, filterValue: "scheduled" },
                { label: "Applications This Week", val: applicationsThisWeek, filterValue: "all" },
              ].map(({ label, val, filterValue }) => (
                <div 
                  key={label}
                  onClick={() => setStatusFilter(filterValue)}
                  style={{ 
                    background: "#fff", 
                    borderRadius: 12, 
                    border: "1px solid #E5E7EB", 
                    boxShadow: "0 1px 8px rgba(0,0,0,0.06)", 
                    padding: "16px 20px", 
                    display: "flex", 
                    flexDirection: "column",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget).style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
                    (e.currentTarget).style.transform = "translateY(-2px)";
                    (e.currentTarget).style.borderColor = "#D0D0D0";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget).style.boxShadow = "0 1px 8px rgba(0,0,0,0.06)";
                    (e.currentTarget).style.transform = "translateY(0)";
                    (e.currentTarget).style.borderColor = "#E5E7EB";
                  }}
                >
                  <p style={{ fontSize: 11, color: "#64748B", marginBottom: 4, lineHeight: 1, margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: val === 0 ? "#CBD5E1" : "#0F172A", lineHeight: 1, margin: 0 }}>{val}</p>
>>>>>>> Stashed changes
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#64748B", marginBottom: 4, lineHeight: 1, margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: val === 0 ? "#CBD5E1" : "#0F172A", lineHeight: 1, margin: 0 }}>{val}</p>
                </div>
              </div>
            ))}
          </div>

<<<<<<< Updated upstream
          {/* Workflow Table Card */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "24px", boxSizing: "border-box", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0 }}>Application Workflow Pipeline</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
                  <input
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search applicants..."
                    style={{ ...inputStyle, width: 180, paddingLeft: 32 }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ ...inputStyle, width: 150, paddingRight: 28, appearance: "none", cursor: "pointer" }}>
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="approved">Approved</option>
                    <option value="disapproved">Disapproved</option>
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#64748B", pointerEvents: "none" }} />
                </div>
=======
          {/* Table card: min-h-[620px] ensures it stretches to match calendar card height */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "24px", boxSizing: "border-box", width: "100%", minHeight: "620px", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: "0 0 24px 0" }}>Application Workflow Pipeline</h2>

            {/* Status Filter and Search Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", whiteSpace: "nowrap" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Filter by Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #E2E8F0",
                    background: "#F8FAFC",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#0F172A",
                    cursor: "pointer",
                    appearance: "none",
                    paddingRight: 24,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                  }}
                >
                  <option value="all">All</option>
                  <option value="pending">Not Yet Scheduled</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="approved">Accepted</option>
                  <option value="disapproved">Rejected</option>
                </select>
              </div>

              <div style={{ position: "relative", marginLeft: "auto", width: "420px" }}>
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search applicants..."
                  style={{ ...inputStyle, width: "100%", paddingLeft: 32 }}
                />
>>>>>>> Stashed changes
              </div>
            </div>

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
                      <td style={{ padding: "16px 20px 16px 0", fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>
                        {appliedDate}
                      </td>
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
                      <td style={{ padding: "16px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            title="Schedule Interview"
                            onClick={() => setScheduleApp(app)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#BFDBFE"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; }}
                          >
                            <Calendar style={{ width: 14, height: 14, color: "#1D4ED8" }} />
                          </button>
<<<<<<< Updated upstream
                          <button
                            title="Approve Application"
                            onClick={() => setApproveApp(app)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0FDF4"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#BBF7D0"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; }}
                          >
                            <Check style={{ width: 14, height: 14, color: "#15803D" }} />
                          </button>
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
        </div>

        {/* ══ RIGHT SECTION: Covers 30% Width (Sticky Calendar Column Beside It) ══ */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: 20, display: "flex", flexDirection: "column", gap: 16, boxSizing: "border-box", position: "sticky", top: 16, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar style={{ width: 14, height: 14, color: "#7A1E1E" }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Interview Schedule</span>
=======
                        </td>
                        <td style={{ padding: "16px 0", fontSize: 13, color: "#64748B" }}>{getApplicantEmail(app)}</td>
                        <td style={{ padding: "16px 0" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            background: STATUS_MAP[app.status || 'pending'].bg,
                            color: STATUS_MAP[app.status || 'pending'].text,
                            border: `1px solid ${STATUS_MAP[app.status || 'pending'].border}`,
                          }}>
                            {STATUS_MAP[app.status || 'pending'].label}
                          </span>
                        </td>
                        <td style={{ padding: "16px 0", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                            {/* SCHEDULE / RESCHEDULE ICON BUTTON */}
                            {app.status !== 'approved' && app.status !== 'disapproved' && app.status !== 'accepted' && app.status !== 'rejected' && (
                              <button 
                                onClick={() => {
                                  setIsRescheduling(app.status === 'scheduled');
                                  setScheduleApp(app);
                                }} 
                                aria-label={app.status === 'scheduled' ? 'Reschedule interview' : 'Schedule interview'}
                                title={app.status === 'scheduled' ? 'Reschedule interview' : 'Schedule interview'}
                                style={{ 
                                  padding: "8px", 
                                  background: "#EFF6FF", 
                                  border: "1px solid #BFDBFE", 
                                  borderRadius: 6, 
                                  cursor: "pointer", 
                                  display: "flex", 
                                  alignItems: "center", 
                                  justifyContent: "center",
                                  transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => { (e.currentTarget).style.background = "#DBEAFE"; }}
                                onMouseLeave={(e) => { (e.currentTarget).style.background = "#EFF6FF"; }}
                              >
                                <Calendar style={{ width: 16, height: 16, color: "#1E40AF" }} />
                              </button>
                            )}
                            
                            {/* APPROVE ICON BUTTON - GATED BY INTERVIEW AND STATUS */}
                            <button 
                              onClick={() => setApproveApp(app)} 
                              disabled={!app.interview?.id || !['pending', 'scheduled'].includes(app.status)}
                              aria-label="Accept applicant"
                              title={!app.interview?.id ? 'Schedule an interview first' : (app.status === 'approved' || app.status === 'rejected') ? 'Application already decided' : 'Accept applicant'}
                              style={{ 
                                padding: "8px", 
                                background: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? "#F0F0F0" : "#F0FDF4", 
                                border: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? "1px solid #D0D0D0" : "1px solid #BBF7D0", 
                                borderRadius: 6, 
                                cursor: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? "not-allowed" : "pointer", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                opacity: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? 0.5 : 1,
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => { if (app.interview?.id && ['pending', 'scheduled'].includes(app.status)) (e.currentTarget).style.background = "#DCFCE7"; }}
                              onMouseLeave={(e) => { if (app.interview?.id && ['pending', 'scheduled'].includes(app.status)) (e.currentTarget).style.background = "#F0FDF4"; }}
                            >
                              <Check style={{ width: 16, height: 16, color: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? "#999" : "#14532D" }} />
                            </button>
                            
                            {/* REJECT ICON BUTTON - GATED BY INTERVIEW AND STATUS */}
                            <button 
                              onClick={() => setDenyApp(app)} 
                              disabled={!app.interview?.id || !['pending', 'scheduled'].includes(app.status)}
                              aria-label="Reject applicant"
                              title={!app.interview?.id ? 'Schedule an interview first' : (app.status === 'approved' || app.status === 'rejected') ? 'Application already decided' : 'Reject applicant'}
                              style={{ 
                                padding: "8px", 
                                background: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? "#F0F0F0" : "#FEF2F2", 
                                border: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? "1px solid #D0D0D0" : "1px solid #FECACA", 
                                borderRadius: 6, 
                                cursor: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? "not-allowed" : "pointer", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                opacity: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? 0.5 : 1,
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => { if (app.interview?.id && ['pending', 'scheduled'].includes(app.status)) (e.currentTarget).style.background = "#FEE5E5"; }}
                              onMouseLeave={(e) => { if (app.interview?.id && ['pending', 'scheduled'].includes(app.status)) (e.currentTarget).style.background = "#FEF2F2"; }}
                            >
                              <X style={{ width: 16, height: 16, color: (!app.interview?.id || !['pending', 'scheduled'].includes(app.status)) ? "#999" : "#7F1D1D" }} />
                            </button>
                            

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Calendar/Events - flex-1 stretches to parent height, min-h-[620px] matches table card */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "24px", boxSizing: "border-box", minWidth: "320px", minHeight: "620px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: "0 0 16px 0" }}>Interview Schedule</h3>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><ChevronLeft style={{ width: 16, height: 16 }} /></button>
                  <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{MONTH_NAMES[calMonth]} {calYear}</h4>
                  <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><ChevronRight style={{ width: 16, height: 16 }} /></button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                  {DAY_ABBRS.map((d, i) => <div key={`day-abbr-${i}`} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#94A3B8", padding: 8 }}>{d}</div>)}
                  {calendarCells.map((day, i) => {
                    const isToday = day === today.getDate() && calYear === today.getFullYear() && calMonth === today.getMonth();
                    const isSelected = day === selectedDay;
                    
                    return (
                      <button
                        key={i}
                        onClick={() => day && setSelectedDay(day)}
                        style={{
                          padding: 8,
                          border: isSelected ? "2px solid #7A1E1E" : isToday ? "2px solid #0EA5E9" : "1px solid #E5E7EB",
                          borderRadius: 6,
                          background: isSelected ? "#FEF2F2" : isToday ? "#E0F2FE" : day === null ? "transparent" : "#fff",
                          cursor: day ? "pointer" : "default",
                          fontSize: 12,
                          fontWeight: (isSelected || isToday) ? 700 : 500,
                          color: day === null ? "transparent" : "#0F172A",
                          position: "relative",
                          boxShadow: isToday ? "inset 0 0 0 1px #0EA5E9" : "none",
                        }}
                      >
                        {day}
                        {day && interviewDays.has(day) && <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: isSelected ? "#7A1E1E" : isToday ? "#0EA5E9" : "#7A1E1E" }} />}
                      </button>
                    );
                  })}
                </div>
>>>>>>> Stashed changes
              </div>
              <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 3, lineHeight: 1, margin: 0 }}>Upcoming evaluations</p>
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

<<<<<<< Updated upstream
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {DAY_ABBRS.map((d, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: "#CBD5E1", padding: "2px 0" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginTop: -8 }}>
            {calendarCells.map((day, i) => {
              if (!day) return <div key={i} style={{ padding: "4px 0" }} />;
              const isSelected = day === selectedDay;
              const hasEvent   = interviewDays.has(day);
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    textAlign: "center", fontSize: 12, fontWeight: 600,
                    padding: "6px 0", cursor: "pointer", borderRadius: 6,
                    position: "relative", margin: "2px",
                    background: isSelected ? "#7A1E1E" : "transparent",
                    color: isSelected ? "#fff" : "#334155",
                  }}
                >
                  {day}
                  {hasEvent && !isSelected && (
                    <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#7A1E1E" }} />
                    )}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, marginTop: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, marginTop: 0 }}>
              Schedule for {MONTH_NAMES[calMonth]} {selectedDay}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto" }}>
              {selectedDayEvents.length > 0 ? selectedDayEvents.map((ev: any, idx: number) => (
                <div key={idx} style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px", borderLeft: "3px solid #7A1E1E" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: 0 }}>{ev.applicantName}</p>
                  <p style={{ fontSize: 11, color: "#64748B", margin: "2px 0 0" }}>{ev.time} • {TALENT_GROUP_LABELS[ev.talentGroup] || ev.talentGroup}</p>
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
=======
              <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 16 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", margin: "0 0 12px 0" }}>Events on {MONTH_NAMES[calMonth]} {selectedDay}</h4>
                {selectedDayEvents.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>No interviews scheduled</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedDayEvents.map((event) => {
                      // MARK AS DONE: Get the application status for this event
                      const eventStatus = getApplicationStatusForInterview(event.id);
                      const isDone = eventStatus === 'approved' || eventStatus === 'disapproved' || eventStatus === 'accepted' || eventStatus === 'rejected';
                      
                      // Style changes: muted colors for completed events
                      const backgroundColor = isDone ? "#F1F5F9" : "#F8FAFC";
                      const borderColor = isDone ? "#CBD5E1" : "#7A1E1E";
                      const textColor = isDone ? "#94A3B8" : "#0F172A";
                      
                      return (
                        <div 
                          key={event.id} 
                          onClick={() => setInterviewDetailsModal(event)}
                          style={{ 
                            background: backgroundColor, 
                            padding: 10, 
                            borderRadius: 8, 
                            borderLeft: `3px solid ${borderColor}`, 
                            borderRight: "1px solid #E5E7EB",
                            borderTop: "1px solid #E5E7EB",
                            borderBottom: "1px solid #E5E7EB",
                            opacity: isDone ? 0.7 : 1,
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => { 
                            (e.currentTarget).style.background = isDone ? "#E8EFF5" : "#FFFFFF";
                            (e.currentTarget).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                          }}
                          onMouseLeave={(e) => { 
                            (e.currentTarget).style.background = backgroundColor;
                            (e.currentTarget).style.boxShadow = "none";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: textColor, margin: 0 }}>{event.applicantName}</p>
                            {isDone && <span style={{ fontSize: 10, fontWeight: 600, color: borderColor, background: "#E0E7FF", padding: "2px 8px", borderRadius: 4 }}>[Done]</span>}
                          </div>
                          <p style={{ fontSize: 11, color: textColor, margin: "0 0 2px 0", opacity: 0.8 }}>{event.time}</p>
                          <p style={{ fontSize: 11, color: textColor, margin: 0, opacity: 0.8 }}>{event.venue}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
>>>>>>> Stashed changes
        </div>

      </div>

<<<<<<< Updated upstream
      {/* Action Modals */}
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
=======
      {scheduleApp && <ScheduleModal app={scheduleApp} onClose={() => { setScheduleApp(null); setIsRescheduling(false); }} onConfirm={(data) => handleScheduleInterview(scheduleApp.id, data, isRescheduling)} isLoading={actionLoading} isReschedule={isRescheduling} />}
      {approveApp && <ApproveModal app={approveApp} onClose={() => setApproveApp(null)} onConfirm={(notes) => handleApprove(approveApp.id, notes)} isLoading={actionLoading} />}
      {denyApp && <DenyModal app={denyApp} onClose={() => setDenyApp(null)} onConfirm={(reason, feedback) => handleReject(denyApp.id, reason, feedback)} isLoading={actionLoading} />}
      {detailApp && <DetailModal app={detailApp} onClose={() => setDetailApp(null)} />}
      {interviewDetailsModal && <InterviewDetailsModal interview={interviewDetailsModal} onClose={() => setInterviewDetailsModal(null)} />}
>>>>>>> Stashed changes
    </TabsContent>
  );
}