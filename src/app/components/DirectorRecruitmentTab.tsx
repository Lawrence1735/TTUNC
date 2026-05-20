import React, { useState, useMemo, useEffect } from "react";
import { TabsContent } from "./ui/tabs";
import {
  Search, ChevronLeft, ChevronRight, ChevronDown,
  Check, X, AlertCircle, Calendar, MapPin, Send, User, Phone,
} from "lucide-react";
import { toast } from "sonner";
import { api as apiClient } from "../services/api";

interface DirectorRecruitmentTabProps {
  pendingApps?: number;
  scheduledInterviews?: number;
  applicationsThisWeek?: number;
  filteredApplications?: any[];
  interviewSchedules?: any[];
  handleViewApplication?: (app: any) => void;
  handleSetSchedule?: (app: any) => void;
  handleApproveInterview?: (id: string) => void;
  handleRejectInterview?: (id: string) => void;
  onApprovalSuccess?: () => void | Promise<void>;
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

function ScheduleModal({ app, onClose, onConfirm, isLoading = false, isReschedule = false }: { app: any; onClose: () => void; onConfirm: (data: any) => void; isLoading?: boolean; isReschedule?: boolean }) {
  const [form, setForm] = useState({ date: "", time: "", venue: "Music Building Room 201", notes: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Modal
      title={isReschedule ? "Reschedule Interview" : "Schedule Interview"}
      subtitle={`Set interview date and time for ${getApplicantName(app)}`}
      onClose={onClose}
      width={500}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => { if (!isLoading) onConfirm(form); }}
          disabled={!form.date || !form.time || isLoading}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 20px", borderRadius: 8,
            background: (!form.date || !form.time || isLoading) ? "#CBD5E1" : "#7A1E1E",
            border: "none", fontSize: 14, fontWeight: 600,
            color: "#fff", cursor: (!form.date || !form.time || isLoading) ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          <Send style={{ width: 14, height: 14 }} />
          {isLoading ? "Saving..." : isReschedule ? "Reschedule" : "Send Schedule"}
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

function ApproveModal({ app, onClose, onConfirm, isLoading = false }: { app: any; onClose: () => void; onConfirm: (notes: string) => void; isLoading?: boolean }) {
  const [notes, setNotes] = useState("");
  return (
    <Modal
      title="Approve Application"
      subtitle={`Confirm scholarship approval for ${getApplicantName(app)}`}
      onClose={onClose}
      width={480}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => { if (!isLoading) onConfirm(notes); }}
          disabled={isLoading}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: isLoading ? "#CBD5E1" : "#14532D", border: "none",
            fontSize: 14, fontWeight: 600, color: "#fff", cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Approving..." : "Confirm Approval"}
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
          Approving this application will move <strong>{getApplicantName(app)}</strong> to the official talent scholar roster and trigger onboarding.
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

function DenyModal({ app, onClose, onConfirm, isLoading = false }: { app: any; onClose: () => void; onConfirm: (reason: string, feedback: string) => void; isLoading?: boolean }) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const feedbackLength = feedback.length;
  const isValidFeedback = feedbackLength >= 10;
  return (
    <Modal
      title="Deny Application"
      subtitle={`Reject application for ${getApplicantName(app)}`}
      onClose={onClose}
      width={480}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => { if (reason && isValidFeedback && !isLoading) onConfirm(reason, feedback); }}
          disabled={!reason || !isValidFeedback || isLoading}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: (!reason || !isValidFeedback || isLoading) ? "#CBD5E1" : "#7F1D1D",
            border: "none", fontSize: 14, fontWeight: 600,
            color: "#fff", cursor: (!reason || !isValidFeedback || isLoading) ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Rejecting..." : "Confirm Rejection"}
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
          This action will permanently deny <strong>{getApplicantName(app)}'s</strong> scholarship application. This cannot be undone.
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <label style={labelStyle}>Additional Feedback <span style={{ color: "#DC2626" }}>*</span></label>
          <span style={{ fontSize: 12, color: feedbackLength < 10 ? "#DC2626" : "#64748B" }}>{feedbackLength}/10+ chars</span>
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide specific feedback explaining this rejection (minimum 10 characters)..."
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

// ── Helper functions ─────────────────────────────────────────────────────────
const getApplicantName = (app: any): string =>
  app.applicant_name || app.applicantName || app.name || app.personalInfo?.name || app.user?.name || "—";

const getApplicantEmail = (app: any): string =>
  app.applicant_email || app.applicantEmail || app.email || app.personalInfo?.email || app.user?.email || "—";

const getApplicantStudentId = (app: any): string =>
  app.applicant_student_id || app.applicantStudentId || app.personalInfo?.studentId || "—";

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

export function DirectorRecruitmentTab({ onApprovalSuccess, interviewSchedules = [] }: DirectorRecruitmentTabProps) {
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

      // Fetch all applications — interview data is embedded via eager loading
      const appsRes = await apiClient.get('/recruitment/applications');

      // Handle nested data structure
      const applicationsData = Array.isArray(appsRes.data.data) ? appsRes.data.data : (Array.isArray(appsRes.data) ? appsRes.data : []);

      console.log('Fetched applications:', applicationsData);
      console.log('Application statuses:', applicationsData.map((app: any) => ({ id: app.id, status: app.status, hasInterview: !!app.interview })));

      setApplications(applicationsData);
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
      
      // The backend scheduleInterview uses updateOrCreate, so the same endpoint
      // handles both new schedules and reschedules without needing a separate PATCH route.
      const endpoint = `/recruitment/applications/${applicationId}/schedule-interview`;
      response = await apiClient.post(endpoint, payload);
      
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

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); setSelectedDay(1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); setSelectedDay(1); };

  const daysInMonth  = getDaysInMonth(calYear, calMonth);
  const firstDaySlot = getFirstDayOfMonth(calYear, calMonth);

  const interviewDays = useMemo(() => {
    const s = new Set<number>();
    applications.forEach((app) => {
      if (app.interview?.scheduled_at) {
        const d = new Date(app.interview.scheduled_at);
        if (d.getFullYear() === calYear && d.getMonth() === calMonth) s.add(d.getDate());
      }
    });
    return s;
  }, [applications, calYear, calMonth]);

  const selectedDayEvents = useMemo(() =>
    applications
      .filter((app) => {
        if (!app.interview?.scheduled_at) return false;
        const d = new Date(app.interview.scheduled_at);
        return d.getFullYear() === calYear && d.getMonth() === calMonth && d.getDate() === selectedDay;
      })
      .map((app) => ({
        id: app.interview.id,
        applicantName: getApplicantName(app),
        date: app.interview.scheduled_at,
        time: new Date(app.interview.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        venue: app.interview.venue || "",
        notes: app.interview.notes || "",
        applicationId: app.id,
        applicationStatus: app.status,
      })),
    [applications, calYear, calMonth, selectedDay]);

  const displayedApps = useMemo(() => {
    const finalFilteredData = applications.filter((app) => {
      const name = (app.applicant_name || app.applicantName || app.name || app.personalInfo?.name || app.user?.name || "").toLowerCase();
      const email = (app.applicant_email || app.applicantEmail || app.email || app.personalInfo?.email || app.user?.email || "").toLowerCase();
      const studentId = (app.applicant_student_id || app.applicantStudentId || "").toLowerCase();
      const searchQuery = search.toLowerCase().trim();
      const matchesSearch = !searchQuery || name.includes(searchQuery) || email.includes(searchQuery) || studentId.includes(searchQuery);
      const appStatus = (app.status || 'pending').toLowerCase();
      let normalizedStatus = appStatus;
      if (appStatus === 'not_scheduled') normalizedStatus = 'pending';
      if (appStatus === 'rejected' || appStatus === 'not_qualified') normalizedStatus = 'disapproved';
      if (appStatus === 'qualified' || appStatus === 'accepted') normalizedStatus = 'approved';
      if (appStatus === 'interview_scheduled') normalizedStatus = 'scheduled';
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter.toLowerCase() || appStatus === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    return finalFilteredData.sort((a, b) => {
      const todayStart = new Date(2026, 4, 20);
      const norm = (s: string) => {
        s = s.toLowerCase();
        if (s === 'not_scheduled' || s === 'pending') return 'pending';
        if (s === 'rejected' || s === 'disapproved') return 'rejected';
        if (s === 'approved' || s === 'accepted') return 'approved';
        return s;
      };
      const sa = norm(a.status || 'pending');
      const sb = norm(b.status || 'pending');
      const aToday = sa === 'scheduled' && a.interview?.scheduled_at && new Date(a.interview.scheduled_at).toDateString() === todayStart.toDateString();
      const bToday = sb === 'scheduled' && b.interview?.scheduled_at && new Date(b.interview.scheduled_at).toDateString() === todayStart.toDateString();
      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;
      const order = ['scheduled', 'pending', 'approved', 'rejected'];
      const oi = order.indexOf(sa); const oj = order.indexOf(sb);
      if (oi !== oj) return (oi === -1 ? 99 : oi) - (oj === -1 ? 99 : oj);
      return new Date(b.applied_at || 0).getTime() - new Date(a.applied_at || 0).getTime();
    });
  }, [applications, search, statusFilter]);

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

        {/* Left side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", flex: 1, boxSizing: "border-box" }}>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 100, background: "#F1F5F9", borderRadius: 12 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", width: "100%", boxSizing: "border-box" }}>
              {[
                { label: "Pending Applications", val: pendingApplications, filterValue: "pending" },
                { label: "Scheduled Interviews", val: applications.filter(a => a.status === 'interview_scheduled' || a.status === 'scheduled').length, filterValue: "scheduled" },
                { label: "Applications This Week", val: applicationsThisWeek, filterValue: "all" },
              ].map(({ label, val, filterValue }) => (
                <div
                  key={label}
                  onClick={() => setStatusFilter(filterValue)}
                  style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box", cursor: "pointer" }}
                >
                  <p style={{ fontSize: 11, color: "#64748B", lineHeight: 1, margin: "0 0 4px" }}>{label}</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: val === 0 ? "#CBD5E1" : "#0F172A", lineHeight: 1, margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Workflow Table Card */}
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
              </div>
            </div>

            {loading ? <LoadingSkeleton /> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                  {["Applicant", "Applied", "Status", "Actions"].map((col) => (
                    <th key={col} style={{ paddingBottom: 10, textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#94A3B8", paddingRight: col === "Actions" ? 0 : 16 }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedApps.length > 0 ? displayedApps.map((app) => {
                  const status = app.status ?? "pending";
                  const badge  = STATUS_MAP[status] ?? STATUS_MAP.pending;
                  const appliedDate = (app.applied_at || app.appliedAt)
                    ? new Date(app.applied_at || app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—";

                  return (
                    <tr key={app.id} style={{ borderBottom: "1px solid #F8FAFC" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px 16px 16px 0" }}>
                        <button onClick={() => setDetailApp(app)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#7A1E1E", margin: 0, lineHeight: 1.3, textDecoration: "underline", textDecorationColor: "rgba(122,30,30,0.3)" }}>
                            {getApplicantName(app)}
                          </p>
                        </button>
                        <p style={{ fontSize: 11, color: "#94A3B8", margin: "3px 0 0", fontFamily: "monospace" }}>
                          {getApplicantStudentId(app)}
                        </p>
                      </td>
                      <td style={{ padding: "16px 16px 16px 0", fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>
                        {appliedDate}
                      </td>
                      <td style={{ padding: "16px 16px 16px 0" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap" }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "16px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {app.status !== 'approved' && app.status !== 'rejected' && (
                          <button
                            title={app.status === 'interview_scheduled' || app.status === 'scheduled' ? 'Reschedule Interview' : 'Schedule Interview'}
                            onClick={() => { setIsRescheduling(app.status === 'interview_scheduled' || app.status === 'scheduled'); setScheduleApp(app); }}
                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                          >
                            <Calendar style={{ width: 14, height: 14, color: "#1D4ED8" }} />
                          </button>
                          )}
                          <button
                            title="Accept applicant"
                            onClick={() => setApproveApp(app)}
                            disabled={!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? "1px solid #D0D0D0" : "1px solid #BBF7D0", background: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? "#F0F0F0" : "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", cursor: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? "not-allowed" : "pointer", opacity: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? 0.5 : 1 }}
                          >
                            <Check style={{ width: 14, height: 14, color: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? "#999" : "#15803D" }} />
                          </button>
                          <button
                            title="Reject applicant"
                            onClick={() => setDenyApp(app)}
                            disabled={!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? "1px solid #D0D0D0" : "1px solid #FECACA", background: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? "#F0F0F0" : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", cursor: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? "not-allowed" : "pointer", opacity: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? 0.5 : 1 }}
                          >
                            <X style={{ width: 14, height: 14, color: (!app.interview?.id || !['pending', 'interview_scheduled', 'scheduled'].includes(app.status)) ? "#999" : "#B91C1C" }} />
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
              </div>
            </>
          )}
          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, marginTop: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, marginTop: 0 }}>
              Schedule for {MONTH_NAMES[calMonth]} {selectedDay}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
              {selectedDayEvents.length > 0 ? selectedDayEvents.map((ev: any) => {
                const isDone = ['approved', 'rejected', 'disapproved'].includes(ev.applicationStatus);
                return (
                  <div key={ev.id}
                    onClick={() => setInterviewDetailsModal(ev)}
                    style={{ background: isDone ? "#F1F5F9" : "#F8FAFC", borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${isDone ? "#CBD5E1" : "#7A1E1E"}`, cursor: "pointer", opacity: isDone ? 0.7 : 1 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: isDone ? "#94A3B8" : "#0F172A", margin: 0 }}>{ev.applicantName}</p>
                      {isDone && <span style={{ fontSize: 10, color: "#94A3B8" }}>Done</span>}
                    </div>
                    <p style={{ fontSize: 11, color: "#64748B", margin: "2px 0 0" }}>{ev.time}</p>
                    {ev.venue && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <MapPin style={{ width: 10, height: 10, color: "#94A3B8", flexShrink: 0 }} />
                        <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{ev.venue}</p>
                      </div>
                    )}
                  </div>
                );
              }) : (
                <p style={{ fontSize: 12, color: "#CBD5E1", margin: 0, padding: "6px 0" }}>No interviews scheduled for this day.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {scheduleApp && <ScheduleModal app={scheduleApp} onClose={() => { setScheduleApp(null); setIsRescheduling(false); }} onConfirm={(data) => handleScheduleInterview(scheduleApp.id, data, isRescheduling)} isLoading={actionLoading} isReschedule={isRescheduling} />}
      {approveApp && <ApproveModal app={approveApp} onClose={() => setApproveApp(null)} onConfirm={(notes) => handleApprove(approveApp.id, notes)} isLoading={actionLoading} />}
      {denyApp && <DenyModal app={denyApp} onClose={() => setDenyApp(null)} onConfirm={(reason, feedback) => handleReject(denyApp.id, reason, feedback)} isLoading={actionLoading} />}
      {detailApp && <ProfileModal app={detailApp} onClose={() => setDetailApp(null)} />}
      {interviewDetailsModal && <InterviewDetailsModal interview={interviewDetailsModal} onClose={() => setInterviewDetailsModal(null)} />}
    </TabsContent>
  );
}
