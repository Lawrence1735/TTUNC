import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, CheckCircle, FileText, Search, Users, ChevronRight, TrendingUp } from './ui/icons';
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
  return (
          <TabsContent value="training" id="tab-panel-training" role="tabpanel" aria-label="Training" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Card 
                className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all"
              >
                <CardContent className="p-2 sm:p-3">
                  <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Active Trainees</p>
                  <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{trainees.length}</p>
                </CardContent>
              </Card>
              
              <Card 
                className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all"
              >
                <CardContent className="p-2 sm:p-3">
                  <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Completion Rate</p>
                  <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{trainingCompletionRate}%</p>
                </CardContent>
              </Card>
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
                          const chapters = traineeChapters[trainee.id!] || {};
                          const completedCount = Object.values(chapters).filter(Boolean).length;
                          const trainingCompletion = Math.round((completedCount / 30) * 100);
                          const instrument = traineeInstruments[trainee.id!] || traineeVoices[trainee.id!] || '—';
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
                              const chapters = traineeChapters[trainee.id!] || {};
                              const completedCount = Object.values(chapters).filter(Boolean).length;
                              const trainingCompletion = Math.round((completedCount / 30) * 100);
                              const instrument = traineeInstruments[trainee.id!] || traineeVoices[trainee.id!] || '—';
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
                  <div className="overflow-x-auto overflow-y-auto max-h-[420px] custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 z-20 bg-white border-r-2 border-[#7A1E1E] w-[140px] py-2">
                            <span className="font-medium">Trainee Name</span>
                          </TableHead>
{trainingAttendance.map((record, idx) => {
                            const dateObj = record?.date ? new Date(record.date) : null;
                            const isToday = dateObj ? dateObj.toDateString() === new Date().toDateString() : false;
                            const isPast = dateObj ? dateObj < new Date() && !isToday : false;
                            
                            return (
                              <TableHead key={idx} className={`text-center min-w-[110px] py-2 ${isToday ? 'bg-blue-50' : isPast ? 'bg-gray-50' : ''}`}>
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className={`font-medium ${isToday ? 'text-[#7A1E1E]' : 'text-[#1a1a1a]'}`}>
{dateObj instanceof Date && !isNaN(dateObj.getTime())
  ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  : '—'}
                                  </span>
                                  <span className="text-[10px] text-[#6c757d] uppercase tracking-wide">
                                    {dateObj instanceof Date && !isNaN(dateObj.getTime())
                                      ? dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                                      : ''}

                                  </span>
                                  <div className="flex items-center gap-1 mt-1.5 bg-white/50 px-1.5 py-0.5 rounded">
                                    <Checkbox
                                      id={`no-practice-${idx}`}
                                      checked={record.noPractice || false}
                                      onCheckedChange={(checked) => {
                                        const updated = [...trainingAttendance];
                                        updated[idx].noPractice = checked as boolean;
                                        setTrainingAttendance(updated);
                                        toast.success(checked ? 'Marked as no-practice day' : 'Marked as practice day');
                                      }}
                                      className="w-3 h-3"
                                    />
                                    <Label htmlFor={`no-practice-${idx}`} className="text-[9px] cursor-pointer text-[#6c757d]">
                                      No Practice
                                    </Label>
                                  </div>
                                </div>
                              </TableHead>
                            );
                          })}
                          <TableHead className="sticky right-0 z-20 bg-white border-l-2 border-[#7A1E1E] text-center w-[85px] py-2">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-medium">Attendance</span>
                              <span className="text-[10px] text-[#6c757d]">Rate</span>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainees.map((trainee) => {
                          const practiceDays = trainingAttendance.filter(record => !record.noPractice);
                          const presentCount = practiceDays.filter(record => record.attendees[trainee.id!] === 'present').length;
                          const totalSessions = practiceDays.length;
                          const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
                          
                          return (
                            <TableRow key={trainee.id}>
                              <TableCell className="sticky left-0 z-10 bg-white border-r-2 border-[#7A1E1E] font-medium py-2">
                                {trainee.name}
                              </TableCell>
                              {trainingAttendance.map((record, dateIdx) => {
                                const currentStatus = record.attendees[trainee.id!] || 'absent';
                                const isNoPractice = record.noPractice;
                                const dateObj = record?.date ? new Date(record.date) : null;
                                const isToday = dateObj && dateObj.toDateString() === new Date().toDateString();
                                const isPast = dateObj && dateObj < new Date() && !isToday;
                                
                                return (
                                  <TableCell 
                                    key={dateIdx} 
                                    className={`text-center p-1.5 ${
                                      isToday ? 'bg-blue-50' : isPast ? 'bg-gray-50' : ''
                                    }`}
                                  >
                                    {isNoPractice ? (
                                      <span className="text-[#6c757d] text-lg">—</span>
                                    ) : (
                                      <div className="flex items-center justify-center">
                                        <Checkbox
                                          checked={currentStatus === 'present'}
                                          onCheckedChange={(checked) => {
                                            const updated = [...trainingAttendance];
                                            updated[dateIdx].attendees[trainee.id!] = checked ? 'present' : 'absent';
                                            setTrainingAttendance(updated);
                                          }}
                                          className="w-5 h-5"
                                        />
                                      </div>
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="sticky right-0 z-10 bg-white border-l-2 border-[#7A1E1E] text-center py-2">
                                <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full font-medium ${
                                  attendanceRate >= 90 ? 'text-green-600 bg-green-50' :
                                  attendanceRate >= 70 ? 'text-yellow-600 bg-yellow-50' :
                                  'text-red-600 bg-red-50'
                                }`}>
                                  {attendanceRate}%
                                </div>
                                <div className="text-[10px] text-[#6c757d] mt-0.5">
                                  {presentCount}/{totalSessions}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
                      evaluations.slice().reverse().map((evaluation) => (
                        <div key={evaluation.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{evaluation.traineeName}</p>
<p className="text-sm text-[#6c757d]">{evaluation?.date ? evaluation.date.toLocaleDateString() : "No Date Available"}</p>
                            {evaluation.notes && (
                              <p className="text-sm text-[#6c757d] mt-1 line-clamp-2">{evaluation.notes}</p>
                            )}
                          </div>
                          <div className="text-right ml-4 shrink-0">
                            <div className={`text-lg font-medium ${getScoreColor(evaluation.rating)}`}>
                              {evaluation.rating}/100
                            </div>
                          </div>
                        </div>
                      ))
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
