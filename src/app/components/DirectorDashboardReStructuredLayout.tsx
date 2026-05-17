import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bell, CalendarPlus, Eye, Plus, X, TrendingUp, ClipboardList, User as UserIcon, Settings } from './ui/icons';



const BURGUNDY = '#7A1E1E';

type DashboardProps = {
  userName: string;
  userSubtext: string;
  unreadNotifications?: number;
};

function MaroonPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1 text-[12px] font-medium text-[#64748B]">
      {label}
    </span>
  );
}

function IconAction({
  label,
  icon: Icon,
  onClick,
  className,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:bg-gray-50 transition-colors ' +
        (className ?? '')
      }
    >
<Icon className="h-4 w-4 text-[#64748B]" />
    </button>
  );
}

function CalendarCard() {
  // Use a deterministic month view; highlight the actual current date.
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = firstDay; // Keep simple Sunday-first grid.

  const cells: Array<number | null> = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const upcoming = [
    { title: 'Health Talk', date: '21st Sept', accent: '#1D4ED8' },
    { title: 'School Annual Function', date: '23rd Sept - 29th Sept', accent: '#7C3AED' },
    { title: 'Sports Competition', date: '27th Sept - 29th Sept', accent: '#059669' },
    { title: 'Adolescent Health Talk', date: '2nd Oct - 4th Oct', accent: '#DC2626' },
  ];

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-[16px] font-bold text-[#0F172A]">Event Calendar</CardTitle>
            <p className="mt-1 text-[11px] text-[#64748B]">Monthly view and upcoming events</p>
          </div>
          <Button
            type="button"
            className="bg-[#7A1E1E] hover:bg-[#6A1919] rounded-lg text-white px-3 py-1.5 text-[12px] font-semibold"
          >
            + Add Event
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayLabels.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-[#94A3B8]">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, idx) => {
              if (!d) return <div key={idx} className="h-8" />;
              const isToday = d === todayDate;
              return (
                <button
                  key={idx}
                  type="button"
                  className="group relative flex h-8 w-full items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label={`Calendar day ${d}`}
                >
                  <span
                    className={
                      'text-[12px] font-semibold ' +
                      (isToday ? 'bg-[#7A1E1E] text-white w-7 h-7 rounded-full flex items-center justify-center' : 'text-[#334155]')
                    }
                  >
                    {d}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {upcoming.map((ev) => (
            <div key={ev.title} className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2">
              <div className="h-9 w-1 rounded-full" style={{ background: ev.accent }} />
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-[#0F172A] leading-4">{ev.title}</p>
                <p className="text-[11px] text-[#64748B] mt-1">{ev.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UnifiedPipelineTable() {
  const rows = [
    {
      name: 'John Paul Ramos',
      studentId: '2024-00678',
      email: 'john.ramos@student.unc.edu.ph',
      status: 'Pending',
      date: '10/15/2024',
      interviewSchedule: 'Nov 15, 2024, 10:00 AM',
      interviewStatus: 'scheduled',
      location: 'Music Building Room 201',
    },
    {
      name: 'Christopher James Alvarez',
      studentId: '2024-01156',
      email: 'christopheralvaroz@student.unc.edu.ph',
      status: 'Pending',
      date: '10/15/2024',
      interviewSchedule: 'Nov 15, 2024, 10:00 AM',
      interviewStatus: 'scheduled',
      location: 'Music Building Room 201',
    },
    {
      name: 'Maria Santos',
      studentId: '2024-01156',
      email: 'mariacantoz@student.unc.edu.ph',
      status: 'Pending',
      date: '10/15/2024',
      interviewSchedule: 'Nov 15, 2024, 10:00 AM',
      interviewStatus: 'scheduled',
      location: 'Music Building Room 201',
    },
  ];

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[16px] font-bold text-[#0F172A]">Unified Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left">
                {[
                  'Applicant Name',
                  'Application Status',
                  'Application Date',
                  'Interview Schedule',
                  'Interview Status',
                  'Location',
                  'Actions',
                ].map((h) => (
                  <th key={h} className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide pb-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-t border-[#F1F5F9]">
                  <td className="py-4 pr-4">
                    <div className="min-w-[190px]">
                      <div className="font-semibold text-[#0F172A]">{r.name}</div>
                      <div className="text-[11px] text-[#94A3B8] font-mono mt-1">
                        <div>{r.studentId}</div>
                        <div>{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <MaroonPill label={r.status} />
                  </td>
                  <td className="py-4 pr-4 text-[13px] text-[#334155] whitespace-nowrap">{r.date}</td>
                  <td className="py-4 pr-4 text-[13px] text-[#334155] whitespace-nowrap">{r.interviewSchedule}</td>
                  <td className="py-4 pr-4 text-[13px] text-[#334155] whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-gray-50 px-3 py-1 text-[12px] font-semibold text-[#475569]">
                      {r.interviewStatus}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-[13px] text-[#334155] whitespace-nowrap">{r.location}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <IconAction label="View" icon={Eye} />
                      <IconAction label="Add to Calendar" icon={CalendarPlus} />
                      <IconAction label="Add" icon={Plus} />
                      <IconAction label="Delete" icon={X} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function DirectorDashboardReStructuredLayout({ userName, userSubtext, unreadNotifications = 0 }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px]">
          <div className="h-20 flex items-center justify-between gap-4">
            {/* Left branding */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#F9EAEA] border border-[#7A1E1E]/20 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-[18px] font-extrabold tracking-tight text-[#0F172A]">
                  TalentTrackUNC
                </div>
                <div className="text-[11px] text-[#64748B] -mt-0.5">Director Dashboard</div>
              </div>
            </div>

            {/* Center/Left nav */}
            <div className="flex items-center gap-0">
              {[
                { key: 'application', label: 'Application' },
                { key: 'training', label: 'Training' },
                { key: 'members', label: 'Members' },
                { key: 'engagement', label: 'Engagement' },
                { key: 'documents', label: 'Documents' },
              ].map((t) => {
                const active = t.key === 'application';
                return (
                  <button
                    key={t.key}
                    type="button"
                    className={
                      'px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ' +
                      (active ? 'text-[#7A1E1E] border-[#7A1E1E]' : 'text-[#64748B] border-transparent hover:text-[#0F172A] hover:border-[#E2E8F0]')
                    }
                    aria-current={active ? 'page' : undefined}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white hover:border-[#7A1E1E] hover:text-[#7A1E1E] transition-colors"
                aria-label={unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : 'Notifications'}
              >
                <Bell className="w-5 h-5 text-[#475569]" aria-hidden="true" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#7A1E1E] text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-full bg-[#F9EAEA] border border-[#7A1E1E]/20 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#0F172A]">{userName}</div>
                  <div className="text-[11px] text-[#64748B]">{userSubtext}</div>
                </div>
              </div>

              <Button
                type="button"
                className="bg-white border border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] py-6">
        {/* TOP ROW: Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#7A1E1E]/10 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-[#7A1E1E]" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[13px] text-[#6B7280] font-semibold">Pending Applications</div>
                </div>
              </div>
              <div className="text-[34px] font-extrabold text-[#7A1E1E] leading-none">2</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
<Hourglass className="w-6 h-6 text-[#334155]" />
                </div>
                <div>
                  <div className="text-[13px] text-[#6B7280] font-semibold">Scheduled Interviews</div>
                </div>
              </div>
              <div className="text-[34px] font-extrabold text-[#334155] leading-none">2</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#0F766E]" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[13px] text-[#6B7280] font-semibold">Applications This Week</div>
                </div>
              </div>
              <div className="text-[34px] font-extrabold text-[#0F766E] leading-none">0</div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 70/30 split */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <UnifiedPipelineTable />
          </div>
          <div className="lg:col-span-1">
            {/* flush-right + level with stats row and table */}
            <CalendarCard />
          </div>
        </div>
      </main>
    </div>
  );
}

