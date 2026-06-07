import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DashboardHeader } from './DashboardHeader';
import { Calendar, AlertCircle, FileText, BarChart3 } from './ui/icons';
import { api } from '../services/api';
import type { User, TrainingRecord, Evaluation } from '../App';
import { getChapterRubric } from './chapterRubrics';

interface TraineeProgressDashboardProps {
  user: User;
  onLogout: () => void;
  trainingRecord: TrainingRecord | null;
  evaluations: Evaluation[];
  unreadNotifications?: number;
  onNotificationsClick?: () => void;
  onNavigateToSettings?: (tab?: 'account' | 'security' | 'administration' | 'logout') => void;
}

const getGroupTerminology = (talentGroup: string) => {
  switch (talentGroup) {
    case 'marching-band':
      return { moduleName: 'Module', sessionName: 'Training Session' };
    case 'majorettes':
      return { moduleName: 'Routine', sessionName: 'Practice Session' };
    case 'glee-club':
      return { moduleName: 'Routine', sessionName: 'Vocal Session' };
    case 'dance-club':
      return { moduleName: 'Routine', sessionName: 'Dance Session' };
    default:
      return { moduleName: 'Module', sessionName: 'Training Session' };
  }
};

const getEvaluationRatingColor = (rating: number) => {
  if (rating >= 4) return '#10b981';
  if (rating >= 3) return '#f59e0b';
  return '#ef4444';
};

export function TraineeProgressDashboard({
  user,
  onLogout,
  trainingRecord: _trainingRecord,
  evaluations: _evaluations,
  unreadNotifications,
  onNotificationsClick,
  onNavigateToSettings
}: TraineeProgressDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainee, setTrainee] = useState<any | null>(null);
  const [attendanceRows, setAttendanceRows] = useState<any[]>([]);
  const [evaluationRows, setEvaluationRows] = useState<any[]>([]);
  const [backendStats, setBackendStats] = useState<any | null>(null);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number | null>(null);


  useEffect(() => {
    let isMounted = true;

    const loadTrainingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load trainee profile + trainee-scoped records in parallel.
        // For trainee/student/scholar roles, backend already filters by authenticated user.
        const [traineesRes, attendanceRes, evaluationsRes] = await Promise.all([
          api.get('/training/trainees'),
          api.get('/training/attendance'),
          api.get('/training/evaluations'),
        ]);

        const traineesData = Array.isArray(traineesRes.data?.data)
          ? traineesRes.data.data
          : Array.isArray(traineesRes.data)
            ? traineesRes.data
            : [];

        const currentTrainee = traineesData.find(
          (row: any) => String(row?.user_id ?? row?.user?.id) === String(user.id)
        );

        if (!currentTrainee) {
          throw new Error('No trainee training profile found for this account yet.');
        }

        if (!isMounted) return;

        setTrainee(currentTrainee);
        setAttendanceRows(Array.isArray(attendanceRes.data?.data) ? attendanceRes.data.data : []);
        setEvaluationRows(Array.isArray(evaluationsRes.data?.data) ? evaluationsRes.data.data : []);
        setBackendStats(null);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load trainee training data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTrainingData();

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const terminology = getGroupTerminology(user.talentGroup || '');

  const extractChapterNumberFromEvaluation = (evalRow: any): number | null => {
    const candidates = [evalRow?.notes, evalRow?.strengths, evalRow?.improvements]
      .filter((value) => typeof value === 'string') as string[];

    for (const text of candidates) {
      const match = text.match(/chapter\s+(\d+)/i);
      if (match) {
        const parsed = Number(match[1]);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
    }

    return null;
  };

  const evaluatedChapterNumbers = useMemo(() => {
    const chapters = new Set<number>();
    evaluationRows.forEach((evalRow) => {
      const chapterNum = extractChapterNumberFromEvaluation(evalRow);
      if (chapterNum) chapters.add(chapterNum);
    });
    return chapters;
  }, [evaluationRows]);

  const chapterRows = useMemo(() => {
    const totalChapters = Number(trainee?.total_expected_sessions || 30);
    const raw = trainee?.chapters_completed;

    const isChapterComplete = (chapterNumber: number): boolean => {
      if (!raw) return false;
      if (Array.isArray(raw)) return Boolean(raw[chapterNumber - 1]);
      if (typeof raw === 'object') {
        return Boolean(raw[String(chapterNumber)] ?? raw[chapterNumber]);
      }
      return false;
    };

    return Array.from({ length: totalChapters }, (_, idx) => {
      const chapterNumber = idx + 1;
      const completedByChapterMap = isChapterComplete(chapterNumber);
      const completedByEvaluation = evaluatedChapterNumbers.has(chapterNumber);
      return {
        chapterNumber,
        methodLabel: `${terminology.moduleName} ${chapterNumber}`,
        completed: completedByChapterMap || completedByEvaluation,
      };
    });
  }, [trainee, terminology.moduleName, evaluatedChapterNumbers]);

  const selectedChapterEvaluations = useMemo(() => {
    if (!selectedChapterNumber) return [];
    return evaluationRows.filter((evalRow) => extractChapterNumberFromEvaluation(evalRow) === selectedChapterNumber);
  }, [evaluationRows, selectedChapterNumber]);

  const selectedChapterRubric = useMemo(() => {
    if (!selectedChapterNumber) return null;
    return getChapterRubric(user.talentGroup || '', selectedChapterNumber);
  }, [selectedChapterNumber, user.talentGroup]);

  const selectedChapterLatestEvaluation = useMemo(() => {
    if (selectedChapterEvaluations.length === 0) return null;
    return selectedChapterEvaluations[0];
  }, [selectedChapterEvaluations]);

  const selectedChapterCriteriaScores = useMemo(() => {
    const source = String(selectedChapterLatestEvaluation?.notes || '');
    if (!source) return {} as Record<string, number>;

    const criteriaMatch = source.match(/criteria:\s*(.+)$/i);
    if (!criteriaMatch) return {} as Record<string, number>;

    const parsed: Record<string, number> = {};
    criteriaMatch[1].split(',').forEach((part) => {
      const [rawKey, rawValue] = part.split(':').map((s) => String(s || '').trim());
      if (!rawKey || !rawValue) return;
      const val = Number(rawValue);
      if (!Number.isFinite(val)) return;
      parsed[rawKey.toLowerCase()] = val;
    });

    return parsed;
  }, [selectedChapterLatestEvaluation]);

  const stats = useMemo(() => {
    const validAttendance = attendanceRows.filter((r) => !r.no_practice);
    const totalSessions = validAttendance.length;
    const attendedSessions = validAttendance.filter((r) => r.status === 'present').length;
    const attendanceRate = totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : Number(backendStats?.attendance_rate ?? 0);

    const chapterCompletionRate = chapterRows.length > 0
      ? Math.round((chapterRows.filter((c) => c.completed).length / chapterRows.length) * 100)
      : 0;

    const backendCompletionRaw = Number(trainee?.completion_rate ?? backendStats?.completion_rate ?? 0);
    const backendCompletion = Number.isFinite(backendCompletionRaw) ? backendCompletionRaw : 0;
    const overallProgress = Math.max(backendCompletion, chapterCompletionRate);

    const avgEvalRating = evaluationRows.length > 0
      ? (evaluationRows.reduce((sum: number, e: any) => sum + Number(e.rating || 0), 0) / evaluationRows.length)
      : 0;

    return { totalSessions, attendedSessions, attendanceRate, overallProgress, avgEvalRating };
  }, [attendanceRows, backendStats, chapterRows, evaluationRows, trainee]);

  const assignedInstrument =
    trainee?.instrument
    ?? trainee?.assigned_instrument
    ?? user.assignedInstrument
    ?? (user as any)?.assigned_instrument
    ?? '';

  const assignedVoice =
    trainee?.voice
    ?? trainee?.assigned_voice
    ?? user.assignedVoice
    ?? (user as any)?.assigned_voice
    ?? '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7A1E1E] border-t-transparent rounded-full animate-spin [animation-duration:700ms] mx-auto mb-4"></div>
          <p className="text-[#6C757D]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        user={user}
        onLogout={onLogout}
        dashboardTitle="Trainee Dashboard"
        unreadNotifications={unreadNotifications}
        onNotificationsClick={onNotificationsClick}
        onNavigateToSettings={onNavigateToSettings}
        hideStudentId={true}
      />

      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] py-6 space-y-6">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <MetricCard
            label="Sessions Attended"
            value={stats.attendedSessions}
            subtext={`of ${stats.totalSessions} total`}
          />
          <MetricCard
            label="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            subtext="Overall participation"
          />
          <MetricCard
            label="Progress"
            value={`${stats.overallProgress}%`}
            subtext="Chapter completion"
          />
          <MetricCard
            label="Avg. Rating (/100)"
            value={stats.avgEvalRating > 0 ? stats.avgEvalRating.toFixed(1) : '—'}
            subtext="Director evaluation"
          />
        </div>

        {/* Assignment Card */}
        {user.talentGroup && (
          <Card className="border-[#e3e7ee] shadow-sm bg-gradient-to-br from-[#F9EAEA] to-white">
            <CardHeader>
              <CardTitle className="text-[#7A1E1E] flex items-center">
                <div className="w-5 h-5 mr-2 rounded-full bg-[#7A1E1E] text-white flex items-center justify-center text-xs">★</div>
                Your Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.talentGroup === 'marching-band' && (
                  <div>
                    <p className="text-sm text-[#6c757d] mb-1">Assigned Instrument</p>
                    <p className="text-lg font-semibold text-[#7A1E1E]">
                      {assignedInstrument || 'Not assigned yet'}
                    </p>
                  </div>
                )}
                {user.talentGroup === 'glee-club' && (
                  <div>
                    <p className="text-sm text-[#6c757d] mb-1">Assigned Voice Part</p>
                    <p className="text-lg font-semibold text-[#7A1E1E]">
                      {assignedVoice || 'Not assigned yet'}
                    </p>
                  </div>
                )}
                {user.talentGroup === 'majorettes' && (
                  <div>
                    <p className="text-sm text-[#6c757d] mb-1">Assigned Equipment</p>
                    <p className="text-lg font-semibold text-[#7A1E1E]">
                      {assignedInstrument || 'Not assigned yet'}
                    </p>
                  </div>
                )}
                {user.talentGroup === 'dance-club' && (
                  <div>
                    <p className="text-sm text-[#6c757d] mb-1">Dance Methods</p>
                    <p className="text-lg font-semibold text-[#7A1E1E] mb-3">All Methods</p>
                    <div className="flex flex-wrap gap-2">
                      {['Contemporary', 'Hip-Hop', 'Ballet', 'Jazz', 'Street Jazz'].map((method) => (
                        <span key={method} className="inline-block px-3 py-1 bg-[#7A1E1E] text-white text-xs rounded-full">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            {/* Chapter/Method Progress Table */}
            <Card className="border-[#e3e7ee] shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-[#7A1E1E]">
                  <FileText className="w-5 h-5 mr-2" />
                  Method / Chapter Progress
                </CardTitle>
                <CardDescription>Tap a module number to view evaluations and comments for that module.</CardDescription>
              </CardHeader>
              <CardContent>
                {chapterRows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#f8fafc]">
                          <TableHead>{terminology.moduleName}</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chapterRows.map((chapter) => (
                          <TableRow
                            key={chapter.chapterNumber}
                            className={`cursor-pointer hover:bg-[#f8fafc] ${selectedChapterNumber === chapter.chapterNumber ? 'bg-[#7A1E1E]/5' : ''}`}
                            onClick={() => setSelectedChapterNumber(chapter.chapterNumber)}
                          >
                            <TableCell className="text-sm">
                              {chapter.methodLabel}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={chapter.completed
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-slate-100 text-slate-600'
                                }
                              >
                                {chapter.completed ? 'Completed' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-[#6c757d]">
                              {chapter.completed ? 'Completed in chapter records or evaluation' : 'Not yet completed'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-[#6c757d]">No chapter progress records yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

            {/* Attendance Table */}
          <div className="space-y-6">
            <Card className="border-[#e3e7ee] shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-[#7A1E1E]">
                  <Calendar className="w-5 h-5 mr-2" />
                  Attendance Record
                </CardTitle>
                <CardDescription>Your {terminology.sessionName} attendance history</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceRows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#f8fafc]">
                          <TableHead>Date</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Session Type</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRows.map((row) => {
                          const rawDate = row.session_date || row.date;
                          const parsedDate = rawDate ? new Date(rawDate) : null;
                          return (
                            <TableRow key={row.id} className="hover:bg-[#f8fafc]">
                              <TableCell className="text-sm">
                                {parsedDate && !Number.isNaN(parsedDate.getTime())
                                  ? parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                <Badge className={row.status === 'present' ? 'bg-green-100 text-green-800' : row.status === 'excused' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-800'}>
                                  {String(row.status || 'absent').replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-[#6c757d]">{row.no_practice ? 'No Practice' : 'Practice Day'}</TableCell>
                              <TableCell className="text-sm text-[#6c757d]">{row.notes || '—'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-[#6c757d]">No attendance records yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog
          open={selectedChapterNumber !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedChapterNumber(null);
          }}
        >
          <DialogContent className="sm:max-w-[860px] max-h-[85vh] overflow-y-auto border-[#e3e7ee]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-[#7A1E1E]">
                <BarChart3 className="w-5 h-5 mr-2" />
                {selectedChapterNumber ? `${terminology.moduleName} ${selectedChapterNumber} Criteria & Evaluation` : 'Module Criteria & Evaluation'}
              </DialogTitle>
              <DialogDescription>Rubric criteria, scores, and comments from director chapter evaluation.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedChapterRubric && (
                <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#f8fafc]">
                        <TableHead className="text-xs">Criteria</TableHead>
                        <TableHead className="text-xs w-[100px]">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedChapterRubric.criteria.map((criterion) => {
                        const score = selectedChapterCriteriaScores[String(criterion.key).toLowerCase()];
                        return (
                          <TableRow key={criterion.key}>
                            <TableCell className="text-sm">{criterion.label}</TableCell>
                            <TableCell className="text-sm font-semibold">{Number.isFinite(score) ? score : '—'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {selectedChapterEvaluations.length > 0 ? (
                selectedChapterEvaluations.map((evalRow, idx) => (
                  <div key={idx} className="p-3 border border-[#e0e0e0] rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-[#0f172a]">
                        {evalRow?.trainee?.user?.name || user.name}
                      </span>
                      <Badge
                        style={{
                          backgroundColor: getEvaluationRatingColor(Number(evalRow.rating || 0) / 20),
                          color: 'white'
                        }}
                        className="text-xs"
                      >
                        {Number(evalRow.rating || 0)}/100
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6c757d] mb-2">
                      {evalRow.evaluation_date ? new Date(evalRow.evaluation_date).toLocaleDateString() : 'Date N/A'}
                    </p>
                    <div className="text-xs bg-blue-50 border-l-2 border-blue-400 p-2 rounded text-[#1e40af]">
                      <strong>Recommendation:</strong> <span className="capitalize">{evalRow.recommendation || 'pending'}</span>
                    </div>
                    {evalRow.strengths && (
                      <div className="text-xs mt-2 p-2 bg-green-50 rounded text-[#15803d]">
                        <strong>Strengths:</strong> {evalRow.strengths}
                      </div>
                    )}
                    {evalRow.improvements && (
                      <div className="text-xs mt-2 p-2 bg-amber-50 rounded text-[#92400e]">
                        <strong>Areas for Improvement:</strong> {evalRow.improvements}
                      </div>
                    )}
                    {evalRow.notes && (
                      <div className="text-xs mt-2 p-2 bg-amber-50 rounded text-[#92400e]">
                        <strong>Comments:</strong> {evalRow.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-[#6c757d]">No evaluation/comments yet for this module.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext: string;
}

function MetricCard({ label, value, subtext }: MetricCardProps) {
  return (
    <Card className="border border-[#E5EAF2] bg-white rounded-xl shadow-none">
      <CardContent className="py-3.5 px-4">
        <div>
          <div>
            <p className="text-[12px] font-medium text-[#64748B] mb-0.5">{label}</p>
            <p className="text-[20px] leading-none font-semibold text-[#0F172A]">
              {value}
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-1">{subtext}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
