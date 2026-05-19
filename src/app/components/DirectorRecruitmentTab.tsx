import React, { useState, useEffect, useMemo } from "react";
import { TabsContent } from "./ui/tabs";
import apiClient from "../../api/client";
import { toast } from "sonner";
import {
  Folder, CalendarClock, TrendingUp, Search, ChevronLeft,
  ChevronRight, ChevronDown, Check, X, AlertCircle,
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
}

// Map backend status values to frontend display
const STATUS_MAP: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending:       { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", label: "Not Yet Scheduled" },
  not_scheduled: { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", label: "Not Yet Scheduled" },
  scheduled:     { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE", label: "Scheduled"     },
  approved:      { bg: "#F0FDF4", text: "#14532D", border: "#BBF7D0", label: "Accepted"      },
  accepted:      { bg: "#F0FDF4", text: "#14532D", border: "#BBF7D0", label: "Accepted"      },
  qualified:     { bg: "#F0FDF4", text: "#14532D", border: "#BBF7D0", label: "Qualified"     },
  not_qualified: { bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA", label: "Not Qualified" },
  disapproved:   { bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA", label: "Rejected"   },
  rejected:      { bg: "#FEF2F2", text: "#7F1D1D", border: "#FECACA", label: "Rejected"   },
};

// Helper function to safely extract applicant name from various possible keys
function getApplicantName(app: any): string {
  return (
    app.applicant_name ||
    app.applicantName ||
    app.name ||
    app.candidate_name ||
    app.personalInfo?.name ||
    app.user?.name ||
    "Unknown Name"
  );
}

// Helper function to safely extract applicant email from various possible keys
function getApplicantEmail(app: any): string {
  return (
    app.applicant_email ||
    app.applicantEmail ||
    app.email ||
    app.personalInfo?.email ||
    app.user?.email ||
    "Unknown Email"
  );
}

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

function ScheduleModal({ app, onClose, onConfirm, isLoading, isReschedule = false }: { app: any; onClose: () => void; onConfirm: (data: any) => void; isLoading?: boolean; isReschedule?: boolean }) {
  // Pre-populate with existing interview data if rescheduling
  const existingInterview = app.interview || app.scheduledInterview || app.activeInterview;
  const [form, setForm] = useState({ 
    date: existingInterview?.date?.split('T')[0] || "", 
    time: existingInterview?.time || existingInterview?.scheduled_at?.split('T')[1]?.slice(0, 5) || "", 
    venue: existingInterview?.venue || "Music Building Room 201", 
    notes: existingInterview?.notes || "" 
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  
  // Get today's date in YYYY-MM-DD format for min date restriction
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  return (
    <Modal
      title={isReschedule ? "Reschedule Interview" : "Schedule Interview"}
      subtitle={`${isReschedule ? 'Reschedule' : 'Set'} interview date and time for ${getApplicantName(app) ?? app.personalInfo?.name ?? "applicant"}`}
      onClose={onClose}
      width={500}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => { onConfirm(form); }}
          disabled={!form.date || !form.time || isLoading}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 20px", borderRadius: 8,
            background: (!form.date || !form.time || isLoading) ? "#CBD5E1" : "#7A1E1E",
            border: "none", fontSize: 14, fontWeight: 600,
            color: "#fff", cursor: (!form.date || !form.time || isLoading) ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? (isReschedule ? "Rescheduling..." : "Scheduling...") : (isReschedule ? "Reschedule Interview" : "Schedule Interview")}
        </button>
      </>}
    >
      <div style={fieldWrap}>
        <label style={labelStyle}>Interview Date <span style={{ color: "#DC2626" }}>*</span></label>
        <input 
          type="date" 
          value={form.date} 
          onChange={set('date')} 
          min={minDate}
          style={inputStyle} 
          required 
        />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Interview Time <span style={{ color: "#DC2626" }}>*</span></label>
        <input type="time" value={form.time} onChange={set('time')} style={inputStyle} required />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Venue</label>
        <input type="text" value={form.venue} onChange={set('venue')} placeholder="e.g., Music Building Room 201" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          placeholder="Any special instructions or requirements..."
          rows={3}
          style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
        />
      </div>
    </Modal>
  );
}

function ApproveModal({ app, onClose, onConfirm, isLoading }: { app: any; onClose: () => void; onConfirm: (notes: string) => void; isLoading?: boolean }) {
  const [notes, setNotes] = useState("");
  return (
    <Modal
      title="Approve Application"
      subtitle={`Approve ${app.applicantName ?? app.personalInfo?.name ?? "applicant"}`}
      onClose={onClose}
      width={500}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => { onConfirm(notes); }}
          disabled={isLoading}
          style={{
            display: "flex", alignItems: "center", gap: 8,
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
          Approving this application will move <strong>{app.applicantName ?? app.personalInfo?.name ?? "this applicant"}</strong> to the official talent scholar roster.
        </p>
      </div>
      <div>
        <label style={labelStyle}>Approval Notes <span style={{ color: "#94A3B8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(Optional)</span></label>
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

function DenyModal({ app, onClose, onConfirm, isLoading }: { app: any; onClose: () => void; onConfirm: (reason: string, feedback: string) => void; isLoading?: boolean }) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  return (
    <Modal
      title="Deny Application"
      subtitle={`Reject application for ${app.applicantName ?? app.personalInfo?.name ?? "applicant"}`}
      onClose={onClose}
      width={480}
      footer={<>
        <CancelBtn onClick={onClose} />
        <button
          onClick={() => { if (reason && feedback) { onConfirm(reason, feedback); } }}
          disabled={!reason || !feedback || isLoading}
          style={{
            padding: "9px 20px", borderRadius: 8,
            background: (!reason || !feedback || isLoading) ? "#CBD5E1" : "#7F1D1D",
            border: "none", fontSize: 14, fontWeight: 600,
            color: "#fff", cursor: (!reason || !feedback || isLoading) ? "not-allowed" : "pointer",
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
          This will permanently deny <strong>{app.applicantName ?? app.personalInfo?.name ?? "this applicant"}'s</strong> application. This cannot be undone.
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
        <label style={labelStyle}>Additional Feedback <span style={{ color: "#DC2626" }}>*</span></label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide specific feedback explaining this rejection..."
          rows={4}
          style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", lineHeight: 1.5 }}
          required
        />
      </div>
    </Modal>
  );
}

function DetailModal({ app, onClose }: { app: any; onClose: () => void }) {
  return (
    <Modal
      title="Applicant Details"
      subtitle={`Full information for ${getApplicantName(app)}`}
      onClose={onClose}
      width={500}
      footer={<>
        <CancelBtn onClick={onClose} />
      </>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>{getApplicantName(app)}</div>
        </div>
        <div>
          <label style={labelStyle}>Email Address</label>
          <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>{getApplicantEmail(app)}</div>
        </div>
        {app.applicantStudentId && (
          <div>
            <label style={labelStyle}>Student ID</label>
            <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>{app.applicantStudentId}</div>
          </div>
        )}
        {app.personalInfo?.phone && (
          <div>
            <label style={labelStyle}>Phone</label>
            <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>{app.personalInfo.phone}</div>
          </div>
        )}
        {app.talentGroup && (
          <div>
            <label style={labelStyle}>Talent Group</label>
            <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>{app.talentGroup}</div>
          </div>
        )}
        {app.createdAt && (
          <div>
            <label style={labelStyle}>Applied On</label>
            <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>{new Date(app.createdAt).toLocaleDateString()}</div>
          </div>
        )}
        <div>
          <label style={labelStyle}>Current Status</label>
          <div style={{ fontSize: 14, color: "#0F172A", padding: "10px 0", fontWeight: 500 }}>
            <span style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: STATUS_MAP[app.status || 'pending'].bg,
              color: STATUS_MAP[app.status || 'pending'].text,
              border: `1px solid ${STATUS_MAP[app.status || 'pending'].border}`,
            }}>
              {STATUS_MAP[app.status || 'pending'].label}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

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

export function DirectorRecruitmentTab(_props: DirectorRecruitmentTabProps) {
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
      console.log('Fetched interviews:', interviewsData);

      setApplications(applicationsData);
      setInterviews(interviewsData);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load recruitment data';
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve application');
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
            status: 'disapproved',
            denial_reason: reason,
            denial_feedback: feedback,
            // Preserve interview data if it exists
            interview: app.interview || response.data?.interview,
          };
        }
        return app;
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject application');
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
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || `Failed to ${isReschedule ? 'reschedule' : 'schedule'} interview`;
      
      // Log full error for debugging
      console.error('Interview scheduling error:', {
        status: err.response?.status,
        data: err.response?.data,
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
  const applicationsThisWeek = applications.filter(app => {
    const createdAt = new Date(app.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdAt >= sevenDaysAgo;
  }).length;

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); setSelectedDay(1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); setSelectedDay(1); };

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDaySlot = getFirstDayOfMonth(calYear, calMonth);

  const interviewDays = useMemo(() => {
    const s = new Set<number>();
    interviews.forEach((iv) => { const d = new Date(iv.date); if (d.getFullYear() === calYear && d.getMonth() === calMonth) s.add(d.getDate()); });
    return s;
  }, [interviews, calYear, calMonth]);

  // Helper: Get application status for an interview
  const getApplicationStatusForInterview = (interviewId: number): string => {
    const app = applications.find(a => a.interview?.id === interviewId || a.interview?.application_id === interviewId);
    return app?.status || 'pending';
  };

  const selectedDayEvents = useMemo(() =>
    interviews.filter((iv) => { const d = new Date(iv.date); return d.getFullYear() === calYear && d.getMonth() === calMonth && d.getDate() === selectedDay; }),
    [interviews, calYear, calMonth, selectedDay]);

  const displayedApps = useMemo(() => {
    console.log('Filtering applications:', { totalApps: applications.length, search, statusFilter });
    
    // UNIFIED FILTER: Combine search and status filter logic
    // This ensures search works regardless of casing or filtering layers
    const finalFilteredData = applications.filter((app) => {
      // Extract name and email with multiple fallback options
      const name = (app.applicant_name || app.applicantName || app.name || "").toLowerCase();
      const email = (app.applicant_email || app.applicantEmail || app.email || "").toLowerCase();
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

  const calendarCells: (number | null)[] = [...Array(firstDaySlot).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  if (error && !loading) {
    return (
      <TabsContent value="recruitment" id="tab-panel-recruitment" style={{ padding: "20px" }}>
        <EmptyState message={`Error: ${error}`} />
      </TabsContent>
    );
  }

  return (
    <TabsContent
      value="recruitment"
      id="tab-panel-recruitment"
      style={{ display: "block", width: "100%", border: "none", padding: 0, margin: 0, boxSizing: "border-box" }}
    >
      {/* Flex row layout with stretched heights for both cards */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        gap: "24px",
        width: "100%",
        alignItems: "stretch",
        boxSizing: "border-box"
      }}>

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
                { icon: Folder, label: "Pending Applications", val: applications.length },
                { icon: CalendarClock, label: "Scheduled Interviews", val: interviews.length },
                { icon: TrendingUp, label: "Applications This Week", val: applicationsThisWeek },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxSizing: "border-box" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F9EAEA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 16, height: 16, color: "#7A1E1E" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "#64748B", marginBottom: 4, lineHeight: 1, margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: val === 0 ? "#CBD5E1" : "#0F172A", lineHeight: 1, margin: 0 }}>{val}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table card: min-h-[620px] ensures it stretches to match calendar card height */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: "24px", boxSizing: "border-box", width: "100%", minHeight: "620px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0 }}>Application Workflow Pipeline</h2>
              <button 
                onClick={fetchData}
                style={{
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  background: "#F0F0F0",
                  border: "1px solid #D0D0D0",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#0F172A"
                }}
              >
                ↻ Refresh
              </button>
            </div>

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

              <div style={{ position: "relative", marginLeft: "auto", minWidth: 0, flex: "1 1 auto" }}>
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search applicants..."
                  style={{ ...inputStyle, width: "100%", maxWidth: "400px", paddingLeft: 32 }}
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : displayedApps.length === 0 ? (
              <div>
                {applications.length === 0 ? (
                  <EmptyState message="No applications available. Click 'Refresh' to reload data." />
                ) : (
                  <EmptyState message={`No results found. (${applications.length} apps loaded, filter: "${statusFilter}")`} />
                )}
              </div>
            ) : (
              <div style={{ overflowX: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                      <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Applicant Name</th>
                      <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                      <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      <th style={{ textAlign: "center", padding: "12px 0", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedApps.map((app) => (
                      <tr key={app.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                        <td style={{ padding: "16px 0", fontSize: 13, color: "#0F172A", fontWeight: 500 }}>
                          <button
                            onClick={() => setDetailApp(app)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              color: "#1E40AF",
                              textDecoration: "none",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.textDecoration = "underline";
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.textDecoration = "none";
                            }}
                          >
                            {getApplicantName(app)}
                          </button>
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
                          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            {app.status !== 'approved' && app.status !== 'disapproved' && app.status !== 'accepted' && app.status !== 'rejected' && (
                              <button 
                                onClick={() => {
                                  setIsRescheduling(app.status === 'scheduled');
                                  setScheduleApp(app);
                                }} 
                                style={{ 
                                  padding: "6px 12px", 
                                  fontSize: 12, 
                                  background: "#EFF6FF", 
                                  border: "1px solid #BFDBFE", 
                                  borderRadius: 6, 
                                  color: "#1E40AF", 
                                  cursor: "pointer", 
                                  fontWeight: 500 
                                }}
                              >
                                {app.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
                              </button>
                            )}
                            <button 
                              onClick={() => setApproveApp(app)} 
                              disabled={app.status !== 'scheduled'}
                              style={{ 
                                padding: "6px 12px", 
                                fontSize: 12, 
                                background: app.status !== 'scheduled' ? "#E0FDF4" : "#F0FDF4", 
                                border: app.status !== 'scheduled' ? "1px solid #CCEDE4" : "1px solid #BBF7D0", 
                                borderRadius: 6, 
                                color: app.status !== 'scheduled' ? "#6B7280" : "#14532D", 
                                cursor: app.status !== 'scheduled' ? "not-allowed" : "pointer", 
                                fontWeight: 500,
                                opacity: app.status !== 'scheduled' ? 0.6 : 1
                              }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => setDenyApp(app)} 
                              disabled={app.status !== 'scheduled'}
                              style={{ 
                                padding: "6px 12px", 
                                fontSize: 12, 
                                background: app.status !== 'scheduled' ? "#FDE5E5" : "#FEF2F2", 
                                border: app.status !== 'scheduled' ? "1px solid #F5CCCC" : "1px solid #FECACA", 
                                borderRadius: 6, 
                                color: app.status !== 'scheduled' ? "#6B7280" : "#7F1D1D", 
                                cursor: app.status !== 'scheduled' ? "not-allowed" : "pointer", 
                                fontWeight: 500,
                                opacity: app.status !== 'scheduled' ? 0.6 : 1
                              }}
                            >
                              Reject
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
                  {calendarCells.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => day && setSelectedDay(day)}
                      style={{
                        padding: 8,
                        border: day === selectedDay ? "2px solid #7A1E1E" : "1px solid #E5E7EB",
                        borderRadius: 6,
                        background: day === selectedDay ? "#FEF2F2" : day === null ? "transparent" : "#fff",
                        cursor: day ? "pointer" : "default",
                        fontSize: 12,
                        fontWeight: day === selectedDay ? 700 : 500,
                        color: day === null ? "transparent" : "#0F172A",
                        position: "relative",
                      }}
                    >
                      {day}
                      {day && interviewDays.has(day) && <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#7A1E1E" }} />}
                    </button>
                  ))}
                </div>
              </div>

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
                        <div key={event.id} style={{ background: backgroundColor, padding: 10, borderRadius: 8, borderLeft: `3px solid ${borderColor}`, opacity: isDone ? 0.7 : 1 }}>
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
        </div>
      </div>

      {scheduleApp && <ScheduleModal app={scheduleApp} onClose={() => { setScheduleApp(null); setIsRescheduling(false); }} onConfirm={(data) => handleScheduleInterview(scheduleApp.id, data, isRescheduling)} isLoading={actionLoading} isReschedule={isRescheduling} />}
      {approveApp && <ApproveModal app={approveApp} onClose={() => setApproveApp(null)} onConfirm={(notes) => handleApprove(approveApp.id, notes)} isLoading={actionLoading} />}
      {denyApp && <DenyModal app={denyApp} onClose={() => setDenyApp(null)} onConfirm={(reason, feedback) => handleReject(denyApp.id, reason, feedback)} isLoading={actionLoading} />}
      {detailApp && <DetailModal app={detailApp} onClose={() => setDetailApp(null)} />}
    </TabsContent>
  );
}
