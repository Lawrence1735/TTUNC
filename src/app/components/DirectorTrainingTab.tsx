import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Calendar, FileText, Search, ChevronRight, ChevronDown, TrendingUp } from './ui/icons';
import { toast } from 'sonner';
import { DashboardQuickStatCard } from './ui/DashboardQuickStatCard';

interface DirectorTrainingTabProps {
  trainees: any[];
  droppedTrainees?: any[];
  trainingCompletionRate: number;
  traineeSearchTerm: string;
  setTraineeSearchTerm: (v: string) => void;
  traineeStatuses: Record<string, string>; // reserved for future use
  traineeChapters: Record<string, Record<string, boolean>>;
  traineeInstruments: Record<string, string>;
  traineeVoices: Record<string, string>;
  trainingAttendance: any[];
  setTrainingAttendance: (v: any[]) => void;
  setSelectedTrainee: (t: any) => void;
  setShowTraineeDialog: (v: boolean) => void;
  setSelectedTraineePerformance: (t: any) => void;
  setShowTraineePerformanceDialog: (v: boolean) => void;
  setShowAddDateDialog: (v: boolean) => void;
  setShowSummaryReportDialog: (v: boolean) => void;
  onSyncAttendanceSession?: (sessionDate: string, attendees: Record<string, any>, noPractice?: boolean) => void;
  evaluations: any[];
  getScoreColor: (score: number) => string;
  onReactivateTrainee?: (trainee: any) => void;
}

export function DirectorTrainingTab({
  trainees,
  droppedTrainees = [],
  trainingCompletionRate,
  traineeSearchTerm,
  setTraineeSearchTerm,
  // traineeStatuses unused in current view but kept for API compatibility
  traineeChapters,
  traineeInstruments,
  traineeVoices,
  trainingAttendance,
  setTrainingAttendance,
  setSelectedTrainee,
  setShowTraineeDialog,
  setSelectedTraineePerformance,
  setShowTraineePerformanceDialog,
  setShowAddDateDialog,
  setShowSummaryReportDialog,
  onSyncAttendanceSession,
  evaluations,
  getScoreColor,
  onReactivateTrainee,
}: DirectorTrainingTabProps) {
  // State for expandable evaluation details
  const [expandedEvaluations, setExpandedEvaluations] = useState<Set<string>>(new Set());

  // State for attendance date-selection and calendar navigation
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(() => new Date().toLocaleDateString('en-CA'));
  const [calendarViewDate, setCalendarViewDate] = useState(() => ({ year: new Date().getFullYear(), month: new Date().getMonth() }));

  // When attendance data loads, auto-select the most recent date if current selection has no record
  useEffect(() => {
    if (trainingAttendance.length === 0) return;
    const hasMatch = trainingAttendance.some(
      r => new Date(r.date).toLocaleDateString('en-CA') === selectedAttendanceDate
    );
    if (!hasMatch) {
      // Pick the most recent training date
      const sorted = [...trainingAttendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      const latestDateStr = new Date(latest.date).toLocaleDateString('en-CA');
      setSelectedAttendanceDate(latestDateStr);
      // Navigate the calendar to that month
      const d = new Date(latest.date);
      setCalendarViewDate({ year: d.getFullYear(), month: d.getMonth() });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingAttendance]);

  const toggleEvaluationExpanded = (evaluationId: string) => {
    const newSet = new Set(expandedEvaluations);
    if (newSet.has(evaluationId)) {
      newSet.delete(evaluationId);
    } else {
      newSet.add(evaluationId);
    }
    setExpandedEvaluations(newSet);
  };

  const getAttendanceKey = (trainee: any): string => String(trainee?._rawTrainee?.id || trainee?.id || '');

  // Debug logging
  useEffect(() => {
    console.log('DirectorTrainingTab received trainees:', {
      count: trainees?.length,
      data: trainees,
      instruments: traineeInstruments,
      chapters: traineeChapters,
      voices: traineeVoices
    });
  }, [trainees, traineeInstruments, traineeChapters, traineeVoices]);

  const getTraineeCompletion = (trainee: any): number => {
    const backendCompletion = Number(trainee?.completionRate ?? trainee?._rawTrainee?.completion_rate ?? 0);
    const chapterData = traineeChapters[trainee.id!];
    if (chapterData !== undefined) {
      const chapterPercent = Math.round((Object.values(chapterData).filter(Boolean).length / 30) * 100);
      // Prefer the most current progress snapshot from backend while preserving chapter-level detail when higher.
      return Math.max(chapterPercent, Number.isFinite(backendCompletion) ? backendCompletion : 0);
    }
    return Number.isFinite(backendCompletion) ? backendCompletion : 0;
  };

  const quickStats = useMemo(() => {
    const statusOf = (t: any) => String(t?.currentStatus ?? t?.trainingStatus ?? t?._rawTrainee?.current_status ?? '').toLowerCase();
    const activeCount = trainees.filter((t) => {
      const s = statusOf(t);
      if (!s) return true;
      return s === 'active' || s === 'in_progress' || s === 'in-training' || s === 'in training';
    }).length;

    const completionValues = trainees.map(getTraineeCompletion).filter((v) => Number.isFinite(v));
    const avgCompletion = completionValues.length > 0
      ? Math.round(completionValues.reduce((sum, v) => sum + v, 0) / completionValues.length)
      : Number(trainingCompletionRate || 0);

    return {
      activeTrainees: activeCount,
      completionRate: avgCompletion,
    };
  }, [trainees, traineeChapters, trainingCompletionRate]);

  const traineeManagementRef = useRef<HTMLDivElement | null>(null);
  const attendanceRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
          <TabsContent value="training" id="tab-panel-training" role="tabpanel" aria-label="Training" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[640px]">
              <DashboardQuickStatCard
                label="Active Trainees"
                value={quickStats.activeTrainees}
                onClick={() => scrollToSection(traineeManagementRef)}
              />
              <DashboardQuickStatCard
                label="Completion Rate"
                value={`${quickStats.completionRate}%`}
                onClick={() => scrollToSection(attendanceRef)}
              />
            </div>

            {droppedTrainees.length > 0 && (
              <Card className="border border-[#e0e0e0] shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[16px] text-[#7A1E1E]">Deactivated Trainees</CardTitle>
                  <CardDescription>Reactivate trainees to return them to the active roster.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {droppedTrainees.map((trainee) => (
                    <div key={trainee.id} className="flex items-center justify-between border border-[#e0e0e0] rounded-md px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">{trainee.name}</p>
                        <p className="text-xs text-[#6c757d]">{trainee.studentId || trainee.email || 'No ID'}</p>
                        {trainee.deactivationNote && (
                          <p className="text-xs text-[#7A1E1E] mt-1">Reason: {trainee.deactivationNote}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white"
                        onClick={() => onReactivateTrainee?.(trainee)}
                      >
                        Reactivate
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Trainee Management Table */}
            <div ref={traineeManagementRef}>
            <Card className="border-[1.6px] border-[#e0e0e0] shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Trainee Management</CardTitle>
                    <CardDescription>View and manage all trainees</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#6c757d]" />
                    <Input
                      type="text"
                      placeholder="Search by trainee name..."
                      value={traineeSearchTerm}
                      onChange={(e) => setTraineeSearchTerm(e.target.value)}
                      className="pl-11 pr-4 py-2.5"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                  </div>
                </div>

                {(() => {
                  const filtered = trainees.filter((trainee) => {
                    if (!traineeSearchTerm.trim()) return true;
                    return trainee.name.toLowerCase().includes(traineeSearchTerm.toLowerCase().trim());
                  });

                  if (filtered.length === 0) {
                    return <p className="text-center text-[#6c757d] py-8">No trainees found</p>;
                  }
                  return (
                    <>
                      {/* Mobile: tappable cards */}
                      <div className="md:hidden space-y-2 overflow-y-auto max-h-[640px]">
                        {filtered.map((trainee) => {
                          // ─── DATA SOURCE MAPPING ───
                          // Training Completion: % of 30 chapters marked as completed (tracked in traineeChapters state)
                          // Date Joined: trainee.dateJoined from User model in database
                          // Instrument: trainee assigned instrument (from traineeInstruments state or trainee object)
                          
                          const trainingCompletion = getTraineeCompletion(trainee);
                          
                          const instrument = trainee.instrument || trainee.assignedInstrument || traineeInstruments[trainee.id!] || traineeVoices[trainee.id!] || '—';
                          
                          const dateJoined = trainee.dateJoined
                            ? new Date(trainee.dateJoined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—';
                          return (
                            <div key={trainee.id} className="border border-[#e0e0e0] rounded-lg overflow-hidden">
                              <div className="p-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                onClick={() => { setSelectedTrainee(trainee); setShowTraineeDialog(true); }}>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-sm font-medium text-[#1a1a1a] truncate">{trainee.name}</span>
                                  <ChevronRight className="w-4 h-4 text-[#6c757d] shrink-0" />
                                </div>
                                <p className="text-xs text-[#6c757d]">{instrument}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-[#6c757d]">{dateJoined}</span>
                                  <span className={`text-xs font-medium ${trainingCompletion >= 90 ? 'text-green-600' : trainingCompletion >= 75 ? 'text-[#7A1E1E]' : trainingCompletion >= 50 ? 'text-yellow-600' : trainingCompletion > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                                    {trainingCompletion}% complete
                                  </span>
                                </div>
                              </div>
                              <div className="px-3 py-2 bg-gray-50 border-t border-[#e0e0e0] flex items-center justify-between cursor-pointer hover:bg-[#7A1E1E]/5 transition-colors"
                                onClick={() => { setSelectedTraineePerformance(trainee); setShowTraineePerformanceDialog(true); }}>
                                <span className="text-xs text-[#7A1E1E]">View Performance</span>
                                <TrendingUp className="w-3 h-3 text-[#7A1E1E]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop: clickable table */}
                      <div className="hidden md:block border border-[#e0e0e0] rounded-lg overflow-auto max-h-[420px]">
                        <Table className="min-w-max">
                          <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Instrument</TableHead>
                              <TableHead>Date Joined</TableHead>
                              <TableHead>Training Completion</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filtered.map((trainee) => {
                              // IMPORTANT: Use resolved completion from backend/chapter progress.
                              const trainingCompletion = getTraineeCompletion(trainee);
                              
                              const instrument = trainee.instrument || trainee.assignedInstrument || traineeInstruments[trainee.id!] || traineeVoices[trainee.id!] || '—';
                              
                              const dateJoined = trainee.dateJoined
                                ? new Date(trainee.dateJoined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—';
                              
                              return (
                                <TableRow key={trainee.id} className="hover:bg-gray-50">
                                  <TableCell className="font-medium cursor-pointer text-[#1a1a1a] hover:underline"
                                    onClick={() => { setSelectedTrainee(trainee); setShowTraineeDialog(true); }}>
                                    {trainee.name}
                                  </TableCell>
                                  <TableCell className="text-[#6c757d]">{instrument}</TableCell>
                                  <TableCell className="text-[#6c757d]">{dateJoined}</TableCell>
                                  <TableCell>
                                    <span className={`font-medium ${trainingCompletion >= 90 ? 'text-green-600' : trainingCompletion >= 75 ? 'text-[#7A1E1E]' : trainingCompletion >= 50 ? 'text-yellow-600' : trainingCompletion > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                                      {trainingCompletion}%
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button size="sm" variant="outline"
                                      className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white"
                                      onClick={() => { setSelectedTraineePerformance(trainee); setShowTraineePerformanceDialog(true); }}>
                                      <TrendingUp className="w-3 h-3 mr-1" />Performance
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            </div>

            {/* Training Attendance - Modern 2-column design */}
            <div ref={attendanceRef}>
            <Card className="border-[1.6px] border-[#e0e0e0] shadow-md overflow-hidden">
              <CardHeader className="border-b border-[#e0e0e0]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle>Training Attendance</CardTitle>
                    <CardDescription>Select a session date on the calendar to mark attendance</CardDescription>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <Button
                      onClick={() => {
                        if (trainees.length === 0) {
                          toast.error('No trainees available for attendance tracking');
                          return;
                        }
                        setShowAddDateDialog(true);
                      }}
                      className="bg-[#7A1E1E] hover:bg-[#6A1919] px-4 py-2"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">{trainingAttendance.length === 0 ? 'Generate Dates' : 'Manage Dates'}</span>
                      <span className="sm:hidden">{trainingAttendance.length === 0 ? 'Generate' : 'Manage'}</span>
                    </Button>
                    <Button
                      className="bg-[#7A1E1E] hover:bg-[#6A1919] text-white px-4 py-2"
                      onClick={() => setShowSummaryReportDialog(true)}
                      disabled={trainingAttendance.length === 0}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Summary Report</span>
                      <span className="sm:hidden">Report</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {trainingAttendance.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="font-medium text-[#7A1E1E] mb-1">No Attendance Sessions Yet</h3>
                    <p className="text-sm text-slate-400">Click "Generate Dates" to create training sessions and start tracking attendance</p>
                  </div>
                ) : (() => {
                  const { year: calYear, month: calMonth } = calendarViewDate;
                  const firstDay = new Date(calYear, calMonth, 1).getDay();
                  const startOffset = (firstDay + 6) % 7; // Monday-first
                  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                  const datesWithRecords = new Set(
                    trainingAttendance.map(r => new Date(r.date).toLocaleDateString('en-CA'))
                  );
                  const todayStr = new Date().toLocaleDateString('en-CA');
                  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', { month: 'long' });
                  const selectedRecord = trainingAttendance.find(
                    r => new Date(r.date).toLocaleDateString('en-CA') === selectedAttendanceDate
                  );
                  const presentCount = trainees.filter(t => selectedRecord?.attendees?.[getAttendanceKey(t)] === 'present').length;
                  const absentCount = trainees.filter(t => {
                    const s = selectedRecord?.attendees?.[getAttendanceKey(t)];
                    return s !== 'present' && s !== 'excused';
                  }).length;
                  const excusedCount = trainees.filter(t => selectedRecord?.attendees?.[getAttendanceKey(t)] === 'excused').length;
                  const sessionRate = trainees.length > 0 ? Math.round((presentCount / trainees.length) * 100) : 0;

                  return (
                    <div className="flex flex-col lg:flex-row" style={{ minHeight: 480 }}>

                      {/* Left Panel — Mini-calendar + session stats */}
                      <div className="w-full lg:w-64 xl:w-72 bg-slate-50 border-b lg:border-b-0 lg:border-l border-[#e0e0e0] p-5 flex-shrink-0 space-y-5 lg:order-2">

                        {/* Mini Calendar */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <button
                              onClick={() => setCalendarViewDate((prev: { year: number; month: number }) => {
                                const d = new Date(prev.year, prev.month - 1, 1);
                                return { year: d.getFullYear(), month: d.getMonth() };
                              })}
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 font-bold"
                            >‹</button>
                            <span className="text-sm font-semibold text-[#1a1a1a]">{monthName} {calYear}</span>
                            <button
                              onClick={() => setCalendarViewDate((prev: { year: number; month: number }) => {
                                const d = new Date(prev.year, prev.month + 1, 1);
                                return { year: d.getFullYear(), month: d.getMonth() };
                              })}
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 font-bold"
                            >›</button>
                          </div>
                          <div className="grid grid-cols-7 mb-1">
                            {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                              <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-y-1">
                            {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                              const day = i + 1;
                              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              const isToday = dateStr === todayStr;
                              const isSelected = dateStr === selectedAttendanceDate;
                              const hasRecord = datesWithRecords.has(dateStr);
                              const isFutureDate = dateStr > todayStr;
                              const isClickable = hasRecord && !isFutureDate;
                              return (
                                <div key={day} className="flex flex-col items-center">
                                  <button
                                    onClick={() => { if (isClickable) setSelectedAttendanceDate(dateStr); }}
                                    title={isFutureDate ? 'Cannot view attendance for a future session' : undefined}
                                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-all ${
                                      isSelected
                                        ? 'bg-[#7A1E1E] text-white font-bold'
                                        : isToday && hasRecord
                                        ? 'bg-amber-100 text-amber-800 font-bold hover:bg-amber-200 cursor-pointer'
                                        : isToday
                                        ? 'bg-amber-50 text-amber-600 font-bold'
                                        : isFutureDate && hasRecord
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : hasRecord
                                        ? 'text-[#1a1a1a] hover:bg-white cursor-pointer'
                                        : 'text-slate-300 cursor-default'
                                    }`}
                                  >
                                    {day}
                                  </button>
                                  {hasRecord && (
                                    <div className={`w-1 h-1 rounded-full mt-0.5 ${
                                      isSelected ? 'bg-[#7A1E1E]' : isToday ? 'bg-amber-400' : 'bg-green-400'
                                    }`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {/* Legend */}
                          <div className="mt-4 space-y-1.5">
                            {[
                              { dot: 'bg-green-400', label: 'Session recorded' },
                              { dot: 'bg-amber-400', label: 'Today' },
                            ].map(({ dot, label }) => (
                              <div key={label} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                                <span className="text-[10px] text-slate-400">{label}</span>
                              </div>
                            ))}
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-2.5 rounded bg-[#7A1E1E] flex-shrink-0" />
                              <span className="text-[10px] text-slate-400">Selected</span>
                            </div>
                          </div>
                        </div>

                        {/* Session Stats Card */}
                        <div className="bg-white rounded-xl border border-[#e0e0e0] p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                            {selectedRecord
                              ? new Date(selectedAttendanceDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                              : 'No Date Selected'}
                          </p>
                          {!selectedRecord ? (
                            <p className="text-xs text-slate-400">Select a highlighted date to view session stats</p>
                          ) : selectedRecord.noPractice ? (
                            <span className="inline-flex items-center bg-slate-100 text-slate-500 text-xs font-medium px-2.5 py-1 rounded-full">No Practice Day</span>
                          ) : (
                            <div className="space-y-2.5">
                              {[
                                { dot: 'bg-green-400', label: 'Present', val: presentCount, color: 'text-green-700' },
                                { dot: 'bg-slate-300', label: 'Absent',  val: absentCount,  color: 'text-slate-500' },
                                { dot: 'bg-amber-400', label: 'Excused', val: excusedCount, color: 'text-amber-600' },
                              ].map(({ dot, label, val, color }) => (
                                <div key={label} className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${dot}`} />
                                    <span className="text-sm text-slate-600">{label}</span>
                                  </div>
                                  <span className={`text-sm font-bold ${color}`}>{val}</span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-semibold text-slate-500">Session Rate</span>
                                  <span className={`text-sm font-bold ${
                                    sessionRate >= 75 ? 'text-green-700' : sessionRate >= 50 ? 'text-amber-600' : 'text-slate-400'
                                  }`}>{sessionRate}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      sessionRate >= 75 ? 'bg-green-400' : sessionRate >= 50 ? 'bg-amber-400' : 'bg-slate-300'
                                    }`}
                                    style={{ width: `${sessionRate}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Panel — Attendance Roster */}
                      <div className="flex-1 overflow-auto lg:order-1">
                        {!selectedRecord ? (
                          <div className="flex flex-col items-center justify-center h-full text-center p-10">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                              <Calendar className="w-7 h-7 text-slate-300" />
                            </div>
                            <p className="font-semibold text-slate-500 mb-1">Select a Session Date</p>
                            <p className="text-xs text-slate-400 max-w-xs">Click any highlighted date on the calendar to view and mark attendance for that session</p>
                          </div>
                        ) : selectedRecord.noPractice ? (
                          <div className="flex flex-col items-center justify-center h-full text-center p-10">
                            <p className="text-lg font-semibold text-slate-400">No Practice</p>
                            <p className="text-xs text-slate-300 mt-1">This date was marked as no practice</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-[#EEF2F7] border-b border-slate-300">
                                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Session Date</th>
                                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's Accomplishment</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {selectedAttendanceDate !== todayStr && (
                                  <tr>
                                    <td colSpan={4} className="px-5 py-3">
                                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                        <span className="font-semibold">⚠</span>
                                        {selectedAttendanceDate > todayStr
                                          ? 'Attendance cannot be marked — this session has not happened yet.'
                                          : 'Attendance period has ended — this is a read-only view of a past session.'}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                                {trainees.map((trainee, idx) => {
                                  const attendanceKey = getAttendanceKey(trainee);
                                  const currentStatus = (selectedRecord.attendees?.[attendanceKey] || 'absent') as 'present' | 'absent' | 'excused';
                                  const isEditableSession = selectedAttendanceDate === todayStr;
                                  const allPracticeDays = trainingAttendance.filter(r => !r.noPractice);
                                  const totalSessions = allPracticeDays.length;
                                  const presentTotal = allPracticeDays.filter(r => r.attendees?.[attendanceKey] === 'present').length;
                                  const overallRate = totalSessions > 0 ? Math.round((presentTotal / totalSessions) * 100) : 0;
                                  const instrument = trainee.instrument || traineeInstruments[trainee.id!] || traineeVoices[trainee.id!] || '';
                                  const totalModules = 30;
                                  const modulePercent = getTraineeCompletion(trainee);
                                  const completedModules = Math.round((Math.min(100, Math.max(0, modulePercent)) / 100) * totalModules);

                                  // Session timestamp display
                                  const sessionDate = new Date(selectedAttendanceDate);
                                  const sessionDateStr = sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

                                  return (
                                    <tr key={trainee.id} className="hover:bg-slate-50 transition-colors">
                                      {/* Name */}
                                      <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">{trainee.name}</p>
                                        {instrument && <p className="text-xs text-slate-400 mt-0.5">{instrument}</p>}
                                        <p className="text-xs text-slate-300 mt-0.5">#{idx + 1}</p>
                                      </td>

                                      {/* Status pills */}
                                      <td className="px-5 py-4">
                                        <div className="inline-flex items-center gap-0.5 bg-slate-100 rounded-lg p-1">
                                          {([
                                            { status: 'present' as const, label: 'Present', active: 'bg-white text-green-700 shadow-sm ring-1 ring-green-200' },
                                            { status: 'absent'  as const, label: 'Absent',  active: 'bg-white text-rose-500 shadow-sm ring-1 ring-rose-200'  },
                                            { status: 'excused' as const, label: 'Excused', active: 'bg-white text-amber-600 shadow-sm ring-1 ring-amber-200' },
                                          ]).map(({ status, label, active }) => (
                                            <button
                                              key={status}
                                              disabled={!isEditableSession}
                                              title={!isEditableSession ? (selectedAttendanceDate > todayStr ? 'Session has not happened yet' : 'Attendance period ended') : undefined}
                                              onClick={() => {
                                                if (!isEditableSession) return;
                                                const updated = trainingAttendance.map(r =>
                                                  new Date(r.date).toLocaleDateString('en-CA') === selectedAttendanceDate
                                                    ? { ...r, attendees: { ...r.attendees, [attendanceKey]: status } }
                                                    : r
                                                );
                                                setTrainingAttendance(updated);
                                                const selectedUpdated = updated.find(
                                                  (r) => new Date(r.date).toLocaleDateString('en-CA') === selectedAttendanceDate
                                                );
                                                if (selectedUpdated && onSyncAttendanceSession) {
                                                  onSyncAttendanceSession(selectedAttendanceDate, selectedUpdated.attendees, Boolean(selectedUpdated.noPractice));
                                                }
                                              }}
                                              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                                !isEditableSession
                                                  ? (currentStatus === status ? `${active} opacity-60 cursor-not-allowed` : 'text-slate-300 cursor-not-allowed')
                                                  : currentStatus === status
                                                  ? active
                                                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                                              }`}
                                            >
                                              {label}
                                            </button>
                                          ))}
                                        </div>
                                        <p className={`text-[11px] font-medium mt-1.5 ${
                                          overallRate >= 75 ? 'text-green-600' : overallRate >= 50 ? 'text-amber-600' : 'text-slate-400'
                                        }`}>{presentTotal}/{totalSessions} sessions &bull; {overallRate}% overall</p>
                                      </td>

                                      {/* Session Date / Timestamp */}
                                      <td className="px-5 py-4">
                                        <p className="text-sm font-medium text-[#1a1a1a]">{sessionDateStr}</p>
                                        <p className={`text-[11px] font-semibold mt-1 ${
                                          currentStatus === 'present' ? 'text-green-600' :
                                          currentStatus === 'excused' ? 'text-amber-600' : 'text-slate-400'
                                        }`}>
                                          {currentStatus === 'present' ? '✓ Marked Present' :
                                           currentStatus === 'excused' ? '~ Excused Absence' : '✗ Absent'}
                                        </p>
                                      </td>

                                      {/* Today's Accomplishment — module progress */}
                                      <td className="px-5 py-4">
                                        {isEditableSession ? (
                                          <>
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-xs font-semibold text-[#1a1a1a]">
                                                {completedModules}/{totalModules} Modules
                                              </span>
                                              <span className={`text-xs font-bold ml-3 ${
                                                modulePercent === 100 ? 'text-green-600' :
                                                modulePercent >= 50  ? 'text-[#7A1E1E]' : 'text-slate-400'
                                              }`}>{modulePercent}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-36">
                                              <div
                                                className={`h-full rounded-full transition-all ${
                                                  modulePercent === 100 ? 'bg-green-400' :
                                                  modulePercent >= 50  ? 'bg-[#7A1E1E]' : 'bg-slate-300'
                                                }`}
                                                style={{ width: `${modulePercent}%` }}
                                              />
                                            </div>
                                            {modulePercent === 100 && (
                                              <p className="text-[10px] text-green-600 font-semibold mt-1">All modules complete ✓</p>
                                            )}
                                          </>
                                        ) : (
                                          <p className="text-sm text-slate-500">Accomplishment is only shown for today's session.</p>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            </div>

            {/* Recent Evaluations */}
            <Card className="border-[1.6px] border-[#e0e0e0] shadow-md">
              <CardHeader>
                <CardTitle>Recent Evaluations</CardTitle>
                <CardDescription>Latest trainee evaluation results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[420px] overflow-y-auto">
                  <div className="space-y-3">
                    {evaluations.length > 0 ? (
                      evaluations.slice().reverse().map((evaluation) => {
                        const isExpanded = expandedEvaluations.has(evaluation.id);
                        return (
                          <div key={evaluation.id} className="border border-[#e0e0e0] rounded-lg overflow-hidden hover:border-[#7A1E1E] transition-colors">
                            {/* Summary Row - Clickable */}
                            <div
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleEvaluationExpanded(evaluation.id)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium truncate">
                                    {evaluation.traineeName || evaluation?.trainee?.user?.name || evaluation?.trainee_name || 'Unknown Trainee'}
                                  </p>
                                  {isExpanded && <ChevronDown className="w-4 h-4 text-[#6c757d] shrink-0" />}
                                  {!isExpanded && <ChevronRight className="w-4 h-4 text-[#6c757d] shrink-0" />}
                                </div>
                                <p className="text-sm text-[#6c757d]">
                                  {(() => {
                                    const raw = evaluation?.date ?? evaluation?.evaluation_date;
                                    if (!raw) return 'No Date Available';
                                    const d = raw instanceof Date ? raw : new Date(raw);
                                    return isNaN(d.getTime()) ? 'No Date Available' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                  })()}
                                </p>
                              </div>
                              <div className="text-right ml-4 shrink-0">
                                <div className={`text-lg font-medium ${getScoreColor(evaluation.rating ?? 0)}`}>
                                  {evaluation.rating ?? '—'}/100
                                </div>
                                <div className="text-xs text-[#6c757d] mt-1 capitalize">
                                  {evaluation.adjectivalRating || evaluation.recommendation || 'Rated'}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="border-t border-[#e0e0e0] bg-gray-50 p-4 space-y-4">
                                {/* Overall Rating Card */}
                                <div className="bg-white p-3 rounded-lg border border-[#e0e0e0]">
                                  <p className="text-xs font-medium text-[#6c757d] mb-2">Overall Rating</p>
                                  <p className="text-2xl font-bold text-[#7A1E1E]">{evaluation.overallRating}/5.00</p>
                                </div>

                                {/* Section Scores */}
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-white p-3 rounded-lg border border-[#e0e0e0]">
                                    <p className="text-xs font-medium text-[#6c757d] mb-1">Section A</p>
                                    <div className="space-y-1">
                                      {evaluation.sectionA && Object.entries(evaluation.sectionA).map(([key, value]) => (
                                        <div key={key} className="text-xs text-[#1a1a1a]">
                                          <span className="text-[#6c757d]">{String(value)}</span>
                                        </div>
                                      ))}
                                      <p className="text-sm font-bold text-[#7A1E1E] mt-2">Total: {evaluation.sectionA ? Object.values(evaluation.sectionA).reduce((a: number, b: any) => a + b, 0) : 0}</p>
                                    </div>
                                  </div>
                                  <div className="bg-white p-3 rounded-lg border border-[#e0e0e0]">
                                    <p className="text-xs font-medium text-[#6c757d] mb-1">Section B</p>
                                    <div className="space-y-1">
                                      {evaluation.sectionB && Object.entries(evaluation.sectionB).map(([key, value]) => (
                                        <div key={key} className="text-xs text-[#1a1a1a]">
                                          <span className="text-[#6c757d]">{String(value)}</span>
                                        </div>
                                      ))}
                                      <p className="text-sm font-bold text-[#7A1E1E] mt-2">Total: {evaluation.sectionB ? Object.values(evaluation.sectionB).reduce((a: number, b: any) => a + b, 0) : 0}</p>
                                    </div>
                                  </div>
                                  <div className="bg-white p-3 rounded-lg border border-[#e0e0e0]">
                                    <p className="text-xs font-medium text-[#6c757d] mb-1">Section C</p>
                                    <div className="space-y-1">
                                      {evaluation.sectionC && Object.entries(evaluation.sectionC).map(([key, value]) => (
                                        <div key={key} className="text-xs text-[#1a1a1a]">
                                          <span className="text-[#6c757d]">{String(value)}</span>
                                        </div>
                                      ))}
                                      <p className="text-sm font-bold text-[#7A1E1E] mt-2">Total: {evaluation.sectionC ? Object.values(evaluation.sectionC).reduce((a: number, b: any) => a + b, 0) : 0}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Strengths and Improvements */}
                                {(evaluation.strengths || evaluation.improvements) && (
                                  <div className="space-y-2">
                                    {evaluation.strengths && (
                                      <div className="bg-white p-3 rounded-lg border border-[#e0e0e0]">
                                        <p className="text-xs font-medium text-[#16a34a] mb-1">Strengths</p>
                                        <p className="text-sm text-[#1a1a1a]">{evaluation.strengths}</p>
                                      </div>
                                    )}
                                    {evaluation.improvements && (
                                      <div className="bg-white p-3 rounded-lg border border-[#e0e0e0]">
                                        <p className="text-xs font-medium text-[#2563eb] mb-1">Areas for Improvement</p>
                                        <p className="text-sm text-[#1a1a1a]">{evaluation.improvements}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Scholarship & Recommendation */}
                                <div className="grid grid-cols-2 gap-2">
                                  {evaluation.scholarshipPercentage !== undefined && (
                                    <div className="bg-white p-3 rounded-lg border border-[#e0e0e0]">
                                      <p className="text-xs font-medium text-[#6c757d] mb-1">Scholarship</p>
                                      <p className="text-lg font-bold text-[#7A1E1E]">{evaluation.scholarshipPercentage}%</p>
                                    </div>
                                  )}
                                  {evaluation.recommendForRenewal !== undefined && (
                                    <div className="bg-white p-3 rounded-lg border border-[#e0e0e0]">
                                      <p className="text-xs font-medium text-[#6c757d] mb-1">Renewal</p>
                                      <Badge className={evaluation.recommendForRenewal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                        {evaluation.recommendForRenewal ? 'Recommended' : 'Not Recommended'}
                                      </Badge>
                                    </div>
                                  )}
                                </div>

                                {/* Evaluator Info */}
                                {(evaluation.ratedBy || evaluation.ratedDate) && (
                                  <div className="text-xs text-[#6c757d] space-y-1">
                                    {evaluation.ratedBy && <p><span className="font-medium">Evaluated by:</span> {evaluation.ratedBy}</p>}
                                    {evaluation.ratedDate && <p><span className="font-medium">Date:</span> {evaluation.ratedDate}</p>}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-[#6c757d] py-8">
                        No evaluations yet
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
  );
}
