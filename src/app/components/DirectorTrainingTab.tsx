import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, CheckCircle, FileText, Search, ChevronRight, ChevronDown, TrendingUp } from './ui/icons';
import { toast } from 'sonner';

interface DirectorTrainingTabProps {
  trainees: any[];
  trainingCompletionRate: number;
  traineeSearchTerm: string;
  setTraineeSearchTerm: (v: string) => void;
  traineeStatuses: Record<string, string>;
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
  evaluations: any[];
  getScoreColor: (score: number) => string;
}

export function DirectorTrainingTab({
  trainees,
  trainingCompletionRate,
  traineeSearchTerm,
  setTraineeSearchTerm,
  traineeStatuses,
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
  evaluations,
  getScoreColor,
}: DirectorTrainingTabProps) {
  // State for expandable evaluation details
  const [expandedEvaluations, setExpandedEvaluations] = useState<Set<string>>(new Set());
  
  // State for weekly attendance view
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const toggleEvaluationExpanded = (evaluationId: string) => {
    const newSet = new Set(expandedEvaluations);
    if (newSet.has(evaluationId)) {
      newSet.delete(evaluationId);
    } else {
      newSet.add(evaluationId);
    }
    setExpandedEvaluations(newSet);
  };

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
  return (
          <TabsContent value="training" id="tab-panel-training" role="tabpanel" aria-label="Training" className="space-y-6">
            {/* Quick Stats - Compact inline design matching DirectorRecruitment */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "55%", maxWidth: "500px" }}>
              {[
                { label: "Active Trainees", val: trainees.length },
                { label: "Completion Rate", val: `${trainingCompletionRate}%` }
              ].map(({ label, val }) => (
                <div key={label} style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box" }}>
                  <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 2, margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: val === 0 || val === "0%" ? "#CBD5E1" : "#0F172A", lineHeight: 1, margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>

            {/* Trainee Management Table */}
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6c757d]" />
                    <Input
                      type="text"
                      placeholder="Search by trainee name..."
                      value={traineeSearchTerm}
                      onChange={(e) => setTraineeSearchTerm(e.target.value)}
                      className="px-[35px] py-[12px]"
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
                          
                          const trainingCompletion = trainee.completionRate !== undefined 
                            ? trainee.completionRate 
                            : (() => {
                                const chapters = traineeChapters[trainee.id!] || {};
                                const completedCount = Object.values(chapters).filter(Boolean).length;
                                return Math.round((completedCount / 30) * 100);
                              })();
                          
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
                                  <span className={`text-xs font-medium ${trainingCompletion >= 90 ? 'text-green-600' : trainingCompletion >= 75 ? 'text-[#7A1E1E]' : trainingCompletion >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
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
                              // IMPORTANT: Use backend data directly when available
                              const trainingCompletion = trainee.completionRate !== undefined 
                                ? trainee.completionRate 
                                : (() => {
                                    const chapters = traineeChapters[trainee.id!] || {};
                                    const completedCount = Object.values(chapters).filter(Boolean).length;
                                    return Math.round((completedCount / 30) * 100);
                                  })();
                              
                              const instrument = trainee.instrument || trainee.assignedInstrument || traineeInstruments[trainee.id!] || traineeVoices[trainee.id!] || '—';
                              
                              const dateJoined = trainee.dateJoined
                                ? new Date(trainee.dateJoined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—';
                              
                              return (
                                <TableRow key={trainee.id} className="hover:bg-gray-50">
                                  <TableCell className="font-medium cursor-pointer text-[#7A1E1E] hover:underline"
                                    onClick={() => { setSelectedTrainee(trainee); setShowTraineeDialog(true); }}>
                                    {trainee.name}
                                  </TableCell>
                                  <TableCell className="text-[#6c757d]">{instrument}</TableCell>
                                  <TableCell className="text-[#6c757d]">{dateJoined}</TableCell>
                                  <TableCell>
                                    <span className={`font-medium ${trainingCompletion >= 90 ? 'text-green-600' : trainingCompletion >= 75 ? 'text-[#7A1E1E]' : trainingCompletion >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
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

            {/* Training Attendance */}
            <Card className="border-[1.6px] border-[#e0e0e0] shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle>Training Attendance</CardTitle>
                    <CardDescription>Check the box to mark present. Leave unchecked for absent. Toggle "No Practice" for non-training days.</CardDescription>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        if (trainees.length === 0) {
                          toast.error('No trainees available for attendance tracking');
                          return;
                        }
                        setShowAddDateDialog(true);
                      }}
                      className="bg-[#7A1E1E] hover:bg-[#6A1919]"
                      size="sm"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">{trainingAttendance.length === 0 ? 'Generate Dates' : 'Manage Dates'}</span>
                      <span className="sm:hidden">{trainingAttendance.length === 0 ? 'Generate' : 'Manage'}</span>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#7A1E1E] hover:bg-[#6A1919] text-white"
                      onClick={() => setShowSummaryReportDialog(true)}
                      disabled={trainingAttendance.length === 0}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Summary Report</span>
                      <span className="sm:hidden">Report</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {trainingAttendance.length === 0 ? (
                  <div className="text-center py-8 px-6">
                    <Calendar className="w-12 h-12 mx-auto text-[#6c757d] mb-3" />
                    <h3 className="font-medium text-[#7A1E1E] mb-1">No Attendance Matrix Generated</h3>
                    <p className="text-sm text-[#6c757d]">Click "Generate Dates" to create training dates and start tracking attendance</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Week Selector */}
                    <div className="flex items-center justify-between gap-4 px-2">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setSelectedWeekStart(new Date(selectedWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000))}
                        className="border-[#7A1E1E] text-[#7A1E1E] px-4 py-2"
                      >
                        ← Previous Week
                      </Button>
                      <div className="text-base font-semibold text-[#1a1a1a] bg-gray-50 px-4 py-2 rounded-lg">
                        {selectedWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(selectedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setSelectedWeekStart(new Date(selectedWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000))}
                        className="border-[#7A1E1E] text-[#7A1E1E] px-4 py-2"
                      >
                        Next Week →
                      </Button>
                    </div>

                    {/* Week Days Header */}
                    <div className="grid grid-cols-8 gap-4 px-2 py-4 bg-gray-50 rounded-lg">
                      <div className="col-span-1 py-2"></div>
                      {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                        const date = new Date(selectedWeekStart.getTime() + dayOffset * 24 * 60 * 60 * 1000);
                        return (
                          <div key={dayOffset} className="text-center py-2">
                            <p className="text-xs font-medium text-[#6c757d]">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                            <p className="text-base font-bold text-[#1a1a1a] mt-1">
                              {date.getDate()}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Trainees Attendance */}
                    <div className="space-y-5 max-h-[500px] overflow-y-auto px-4">
                      {trainees.map((trainee) => {
                        const practiceDays = trainingAttendance.filter(record => !record.noPractice);
                        const presentCount = practiceDays.filter(record => record.attendees[trainee.id!] === 'present').length;
                        const totalSessions = practiceDays.length;
                        const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
                        
                        return (
                          <div key={trainee.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            {/* Trainee Header */}
                            <div className="flex items-center justify-between mb-5 pb-4">
                              <p className="font-medium text-[#1a1a1a]">{trainee.name}</p>
                              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                                attendanceRate >= 90 ? 'bg-green-50 text-green-700' :
                                attendanceRate >= 70 ? 'bg-yellow-50 text-yellow-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {attendanceRate}% ({presentCount}/{totalSessions})
                              </div>
                            </div>

                            {/* Weekly Attendance Toggles */}
                            <div className="grid grid-cols-8 gap-4">
                              <div></div>
                              {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                                const date = new Date(selectedWeekStart.getTime() + dayOffset * 24 * 60 * 60 * 1000);
                                const attendanceRecord = trainingAttendance.find(r => 
                                  new Date(r.date).toDateString() === date.toDateString()
                                );
                                const isNoPractice = attendanceRecord?.noPractice || false;
                                const currentStatus = attendanceRecord?.attendees[trainee.id!] || 'absent';
                                
                                return (
                                  <div key={dayOffset} className="flex flex-col gap-2">
                                    {isNoPractice ? (
                                      <div className="h-9 flex items-center justify-center text-[#6c757d] text-sm">—</div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            if (attendanceRecord) {
                                              const updated = [...trainingAttendance];
                                              const idx = updated.indexOf(attendanceRecord);
                                              updated[idx].attendees[trainee.id!] = 'present';
                                              setTrainingAttendance(updated);
                                            }
                                          }}
                                          className={`flex-1 px-2.5 py-2 rounded text-xs font-medium transition-all ${
                                            currentStatus === 'present'
                                              ? 'bg-green-500 text-white'
                                              : 'bg-gray-100 text-[#6c757d] hover:bg-green-100'
                                          }`}
                                          title="Present"
                                        >
                                          ✓
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (attendanceRecord) {
                                              const updated = [...trainingAttendance];
                                              const idx = updated.indexOf(attendanceRecord);
                                              updated[idx].attendees[trainee.id!] = 'absent';
                                              setTrainingAttendance(updated);
                                            }
                                          }}
                                          className={`flex-1 px-2.5 py-2 rounded text-xs font-medium transition-all ${
                                            currentStatus === 'absent'
                                              ? 'bg-red-500 text-white'
                                              : 'bg-gray-100 text-[#6c757d] hover:bg-red-100'
                                          }`}
                                          title="Absent"
                                        >
                                          ✗
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (attendanceRecord) {
                                              const updated = [...trainingAttendance];
                                              const idx = updated.indexOf(attendanceRecord);
                                              updated[idx].attendees[trainee.id!] = 'excused';
                                              setTrainingAttendance(updated);
                                            }
                                          }}
                                          className={`flex-1 px-2.5 py-2 rounded text-xs font-medium transition-all ${
                                            currentStatus === 'excused'
                                              ? 'bg-yellow-500 text-white'
                                              : 'bg-gray-100 text-[#6c757d] hover:bg-yellow-100'
                                          }`}
                                          title="Excused"
                                        >
                                          ~
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
                                  <p className="font-medium truncate">{evaluation.traineeName}</p>
                                  {isExpanded && <ChevronDown className="w-4 h-4 text-[#6c757d] shrink-0" />}
                                  {!isExpanded && <ChevronRight className="w-4 h-4 text-[#6c757d] shrink-0" />}
                                </div>
                                <p className="text-sm text-[#6c757d]">{evaluation?.date ? evaluation.date.toLocaleDateString() : "No Date Available"}</p>
                              </div>
                              <div className="text-right ml-4 shrink-0">
                                <div className={`text-lg font-medium ${getScoreColor(evaluation.rating)}`}>
                                  {evaluation.rating}/100
                                </div>
                                <div className="text-xs text-[#6c757d] mt-1">
                                  {evaluation.adjectivalRating || 'Rated'}
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
