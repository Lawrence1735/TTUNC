/**
 * IMPLEMENTATION EXAMPLE: TrainingDashboard Integration
 * 
 * This file shows exactly where and how to integrate the new refactored components
 * into the existing TrainingDashboard component.
 */

import React, { useState } from 'react';
import {
  ChapterProgressTracker,
  AttendanceCalendarChecklist,
  CompactQuickStatsGrid,
  type ChapterEvaluation,
  type AttendanceRecord
} from './index';
import { Trophy, Calendar, Award, TrendingUp, CheckCircle, Clock } from './ui/icons';

// ============================================================================
// EXAMPLE 1: Add Chapter Progress Section to TrainingDashboard
// ============================================================================

export const TrainingDashboardChapterSection = ({
  user,
  traineeChapters,
  onChapterClick,
  onStartEvaluation
}) => {
  return (
    <section className="space-y-6">
      {/* Chapter Progress Tracker - NEW */}
      <ChapterProgressTracker
        traineeId={user.id!}
        traineeName={user.name}
        chapters={traineeChapters}
        onChapterClick={onChapterClick}
        onStartEvaluation={onStartEvaluation}
        totalChapters={30}
        isMajorettes={user.talentGroup === 'majorettes'}
        isGleeClub={user.talentGroup === 'glee-club'}
        isDanceClub={user.talentGroup === 'dance-club'}
      />
    </section>
  );
};

// ============================================================================
// EXAMPLE 2: Add Attendance Calendar Section to TrainingDashboard
// ============================================================================

export const TrainingDashboardAttendanceSection = ({
  user,
  trainingAttendance
}) => {
  // Convert trainingAttendance data to AttendanceRecord format
  const attendanceRecords: AttendanceRecord[] = trainingAttendance
    .filter((record: any) => record.attendees?.[user.id!] && !record.noPractice)
    .map((record: any) => ({
      date: new Date(record.date),
      status: record.attendees[user.id!] || 'absent',
      notes: record.notes
    }));

  // Calculate summer intensive dates (June 1 - August 31)
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 5, 1); // June 1
  const endDate = new Date(currentYear, 7, 31);   // August 31

  return (
    <section className="space-y-6">
      {/* Attendance Calendar - NEW */}
      <AttendanceCalendarChecklist
        traineeName={user.name}
        attendanceDates={attendanceRecords}
        startDate={startDate}
        endDate={endDate}
      />
    </section>
  );
};

// ============================================================================
// EXAMPLE 3: Quick Stats Refactoring from Horizontal to Square Grid
// ============================================================================

export const TrainingDashboardQuickStatsOld = () => {
  return (
    // OLD: Uses grid-cols-2 gap-4 for horizontal rectangles
    <div className="grid grid-cols-2 gap-4">
      {/* Individual QuickStatsCard components */}
    </div>
  );
};

export const TrainingDashboardQuickStatsNew = ({
  trainingRecord,
  totalPractices
}) => {
  // Calculate stats
  const attendedPractices = trainingRecord?.practices.filter(
    (p: any) => p.attended
  ).length || 0;
  const attendanceRate = totalPractices > 0
    ? Math.round((attendedPractices / totalPractices) * 100)
    : 0;

  const latestPractice = trainingRecord?.practices[
    trainingRecord.practices.length - 1
  ];
  const chaptersCompleted = latestPractice?.chaptersCompleted || 0;
  const totalChapters = latestPractice?.totalChapters || 0;

  // Define stats array
  const stats = [
    {
      icon: CheckCircle,
      label: 'Practices Attended',
      value: attendedPractices,
      iconColor: '#7A1E1E'
    },
    {
      icon: Calendar,
      label: 'Attendance Rate',
      value: `${attendanceRate}%`,
      iconColor: '#7A1E1E'
    },
    {
      icon: Award,
      label: 'Chapters Completed',
      value: `${chaptersCompleted}/${totalChapters}`,
      iconColor: '#7A1E1E'
    },
    {
      icon: TrendingUp,
      label: 'Overall Progress',
      value: `${trainingRecord?.overallProgress || 0}%`,
      iconColor: '#7A1E1E'
    }
  ];

  // NEW: Uses CompactQuickStatsGrid for square boxes
  return (
    <CompactQuickStatsGrid
      stats={stats}
      columns={4}
      compact={true}
    />
  );
};

// ============================================================================
// EXAMPLE 4: Complete Integration in TrainingDashboard Component
// ============================================================================

export const IntegratedTrainingDashboardExample = ({
  user,
  trainingRecord,
  trainingAttendance,
  traineeChapters,
  onChapterClick,
  onStartEvaluation
}) => {
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const handleChapterClick = (chapterNumber: number) => {
    setSelectedChapter(chapterNumber);
    // Could expand chapter details or navigate to chapter view
    if (onChapterClick) {
      onChapterClick(chapterNumber);
    }
  };

  const handleStartEvaluation = (chapterNumber: number) => {
    setSelectedChapter(chapterNumber);
    setShowEvaluationDialog(true);
    if (onStartEvaluation) {
      onStartEvaluation(chapterNumber);
    }
  };

  const totalPractices = trainingRecord?.practices.length || 0;

  return (
    <main id="main-content" className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-[#7A1E1E] mb-2">Training Progress</h2>
        <p className="text-muted-foreground">
          Track your training journey and performance evaluation.
        </p>
      </div>

      {/* Training Status Alert */}
      {trainingRecord?.evaluation !== 'pending' && (
        <div className={`mb-6 p-4 border rounded-lg ${
          trainingRecord?.evaluation === 'qualified'
            ? 'border-green-500 bg-green-50'
            : 'border-red-500 bg-red-50'
        }`}>
          <Trophy className="w-4 h-4" />
          <p>
            {trainingRecord?.evaluation === 'qualified'
              ? 'Congratulations! You qualified as a scholar.'
              : 'You did not qualify this semester. Keep practicing!'}
          </p>
        </div>
      )}

      {/* Quick Stats - NEW COMPACT GRID LAYOUT */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <TrainingDashboardQuickStatsNew
          trainingRecord={trainingRecord}
          totalPractices={totalPractices}
        />
      </div>

      {/* Chapter Progress Tracker - NEW */}
      <div className="mb-6">
        <TrainingDashboardChapterSection
          user={user}
          traineeChapters={traineeChapters}
          onChapterClick={handleChapterClick}
          onStartEvaluation={handleStartEvaluation}
        />
      </div>

      {/* Attendance Calendar - NEW */}
      <div className="mb-6">
        <TrainingDashboardAttendanceSection
          user={user}
          trainingAttendance={trainingAttendance}
        />
      </div>

      {/* Evaluation Dialog would go here */}
      {showEvaluationDialog && (
        <div>
          {/* Open EvaluationFormDialog or ChapterEvaluationDialog */}
        </div>
      )}
    </main>
  );
};

// ============================================================================
// EXAMPLE 5: Convert Existing Chapter Data to ChapterEvaluation Format
// ============================================================================

export const convertTraineeChaptersToEvaluations = (
  traineeChapters: Record<string, Record<string, boolean>>,
  traineeId: string,
  existingEvaluations: any[] = []
): ChapterEvaluation[] => {
  const chapters: Record<string, boolean> = traineeChapters[traineeId] || {};

  return Array.from({ length: 30 }, (_, i) => i + 1).map(chapterNum => {
    const isCompleted = chapters[chapterNum] || false;
    const relevantEval = existingEvaluations.find(
      e => e.chapterNumber === chapterNum
    );

    // Determine status based on completion and evaluation
    let status: 'locked' | 'unlocked' | 'completed' | 'passed' | 'failed';

    if (chapterNum === 1) {
      // First chapter always unlocked
      status = isCompleted ? 'completed' : 'unlocked';
    } else {
      // Subsequent chapters locked until previous passed
      const prevChapter = chapters[chapterNum - 1];
      if (!prevChapter) {
        status = 'locked';
      } else if (isCompleted) {
        status = 'completed';
      } else {
        status = 'unlocked';
      }
    }

    // If there's an evaluation for this chapter, use its status
    if (relevantEval) {
      if (relevantEval.rating >= 75) {
        status = 'passed';
      } else if (relevantEval.rating < 60) {
        status = 'failed';
      } else {
        status = 'completed';
      }
    }

    return {
      chapterNumber: chapterNum,
      chapterName: `Chapter ${chapterNum}`,
      evaluationId: relevantEval?.id,
      status,
      evaluationScore: relevantEval?.rating,
      completedDate: relevantEval?.date ? new Date(relevantEval.date) : undefined,
      lessons: [],
      methods: []
    };
  });
};

// ============================================================================
// EXAMPLE 6: Expandable Card Summary Implementation
// ============================================================================

interface ExpandableEvaluationCardProps {
  evaluation: any;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ExpandableEvaluationCard: React.FC<ExpandableEvaluationCardProps> = ({
  evaluation,
  isExpanded,
  onToggle
}) => {
  return (
    <div
      onClick={onToggle}
      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* Summary Section */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{evaluation.traineeName}</h4>
          <p className="text-sm text-gray-600">
            Score: {evaluation.rating}/100
          </p>
        </div>
        <div className="text-lg font-bold text-[#7A1E1E]">
          {evaluation.rating >= 75 ? '✓' : evaluation.rating >= 60 ? '◐' : '✗'}
        </div>
      </div>

      {/* Expanded Detail Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Section A</p>
              <p className="font-semibold">
                {evaluation.sectionA
                  ? Object.values(evaluation.sectionA).reduce((a: number, b: any) => a + b, 0) / 6
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Section B</p>
              <p className="font-semibold">
                {evaluation.sectionB
                  ? Object.values(evaluation.sectionB).reduce((a: number, b: any) => a + b, 0) / 4
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Section C</p>
              <p className="font-semibold">
                {evaluation.sectionC
                  ? Object.values(evaluation.sectionC).reduce((a: number, b: any) => a + b, 0) / 3
                  : '—'}
              </p>
            </div>
          </div>

          {evaluation.strengths && (
            <div>
              <p className="text-sm font-medium text-gray-700">Strengths:</p>
              <p className="text-sm text-gray-600">{evaluation.strengths}</p>
            </div>
          )}

          {evaluation.improvements && (
            <div>
              <p className="text-sm font-medium text-gray-700">Areas for Improvement:</p>
              <p className="text-sm text-gray-600">{evaluation.improvements}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Usage in evaluations list:
export const ExpandableEvaluationsList = ({ evaluations }: { evaluations: any[] }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (evalId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(evalId)) {
      newExpanded.delete(evalId);
    } else {
      newExpanded.add(evalId);
    }
    setExpandedIds(newExpanded);
  };

  return (
    <div className="space-y-2">
      {evaluations.map(eval => (
        <ExpandableEvaluationCard
          key={eval.id}
          evaluation={eval}
          isExpanded={expandedIds.has(eval.id)}
          onToggle={() => toggleExpanded(eval.id)}
        />
      ))}
    </div>
  );
};
