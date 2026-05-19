import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, LockOpen, CheckCircle, AlertCircle, BookOpen } from './ui/icons';
import type { ChapterEvaluation } from './types';

interface ChapterProgressTrackerProps {
  traineeId: string;
  traineeName: string;
  chapters: ChapterEvaluation[];
  onChapterClick: (chapterNumber: number) => void;
  onStartEvaluation: (chapterNumber: number) => void;
  totalChapters?: number;
  isMajorettes?: boolean;
  isGleeClub?: boolean;
  isDanceClub?: boolean;
}

export function ChapterProgressTracker({
  traineeId,
  traineeName,
  chapters,
  onChapterClick,
  onStartEvaluation,
  totalChapters = 30,
  isMajorettes = false,
  isGleeClub = false,
  isDanceClub = false
}: ChapterProgressTrackerProps) {
  // Calculate chapter status based on completion and evaluation
  const chapterStatuses = useMemo(() => {
    const statuses: Record<number, ChapterEvaluation> = {};
    
    for (let i = 1; i <= totalChapters; i++) {
      const chapter = chapters.find(c => c.chapterNumber === i);
      
      if (!chapter) {
        // Initialize default status
        if (i === 1) {
          // First chapter is always unlocked
          statuses[i] = {
            chapterNumber: i,
            chapterName: `${isMajorettes || isGleeClub || isDanceClub ? 'Routine' : 'Chapter'} ${i}`,
            status: 'unlocked',
            lessons: [],
            methods: []
          };
        } else {
          // Subsequent chapters are locked until previous is passed
          const prevChapter = chapters.find(c => c.chapterNumber === i - 1);
          statuses[i] = {
            chapterNumber: i,
            chapterName: `${isMajorettes || isGleeClub || isDanceClub ? 'Routine' : 'Chapter'} ${i}`,
            status: prevChapter?.status === 'passed' ? 'unlocked' : 'locked',
            lessons: [],
            methods: []
          };
        }
      } else {
        statuses[i] = chapter;
      }
    }
    
    return statuses;
  }, [chapters, totalChapters, isMajorettes, isGleeClub, isDanceClub]);

  // Statistics
  const stats = useMemo(() => {
    const values = Object.values(chapterStatuses);
    const completed = values.filter(c => c.status === 'passed').length;
    const locked = values.filter(c => c.status === 'locked').length;
    const inProgress = values.filter(c => c.status === 'unlocked' || c.status === 'completed').length;
    
    return {
      completed,
      locked,
      inProgress,
      completionRate: Math.round((completed / totalChapters) * 100)
    };
  }, [chapterStatuses, totalChapters]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-[#6c757d]" />;
      case 'unlocked':
        return <LockOpen className="w-5 h-5 text-blue-600" />;
      case 'completed':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 border-green-300 text-green-900 hover:bg-green-200';
      case 'locked':
        return 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed opacity-60';
      case 'unlocked':
        return 'bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200 cursor-pointer';
      case 'completed':
        return 'bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'passed':
        return 'Passed';
      case 'locked':
        return 'Locked';
      case 'unlocked':
        return 'Ready';
      case 'completed':
        return 'In Progress';
      default:
        return 'Unmarked';
    }
  };

  // Check if final evaluation can be unlocked
  const canAccessFinalEvaluation = stats.completed === totalChapters;

  return (
    <div className="space-y-6">
      {/* Header Card with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#7A1E1E]" />
            {isMajorettes || isGleeClub || isDanceClub ? 'Routine' : 'Chapter'} Progress Tracker
          </CardTitle>
          <CardDescription>
            Sequential progression for {traineeName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-medium">Passed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-700 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-700 font-medium">Locked</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.locked}</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">Completion %</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.completionRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Requirements Alert */}
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          <strong>Sequential Progression:</strong> Each {isMajorettes || isGleeClub || isDanceClub ? 'routine' : 'chapter'} must be completed and evaluation must be passed before unlocking the next one.
        </AlertDescription>
      </Alert>

      {/* Chapters Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isMajorettes || isGleeClub || isDanceClub ? 'Training Routines' : 'Training Chapters'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map(chapterNum => {
              const chapterStatus = chapterStatuses[chapterNum];
              const isLocked = chapterStatus.status === 'locked';

              return (
                <button
                  key={chapterNum}
                  onClick={() => {
                    if (!isLocked) {
                      onChapterClick(chapterNum);
                    }
                  }}
                  disabled={isLocked}
                  className={`
                    p-4 border-2 rounded-lg transition-all
                    flex flex-col items-center justify-center gap-2
                    ${getStatusColor(chapterStatus.status)}
                  `}
                  title={`${chapterStatus.chapterName} - ${getStatusLabel(chapterStatus.status)}`}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(chapterStatus.status)}
                    <span className="font-bold text-lg">{chapterNum}</span>
                  </div>
                  <span className="text-xs font-medium">
                    {getStatusLabel(chapterStatus.status)}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chapter Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Individual Chapter Evaluations</CardTitle>
          <CardDescription>
            Complete evaluation for each chapter to progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map(chapterNum => {
              const chapterStatus = chapterStatuses[chapterNum];
              const isLocked = chapterStatus.status === 'locked';
              const isCompleted = chapterStatus.status === 'passed';

              return (
                <div
                  key={chapterNum}
                  className={`
                    p-3 border rounded-lg flex items-center justify-between
                    ${isCompleted
                      ? 'bg-green-50 border-green-200'
                      : isLocked
                        ? 'bg-gray-50 border-gray-200 opacity-50'
                        : 'bg-blue-50 border-blue-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getStatusIcon(chapterStatus.status)}
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{chapterStatus.chapterName}</p>
                      {chapterStatus.evaluationScore !== undefined && (
                        <p className="text-xs text-[#6c757d]">
                          Score: {chapterStatus.evaluationScore}/100
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onStartEvaluation(chapterNum)}
                    disabled={isLocked}
                    variant={isCompleted ? 'outline' : 'default'}
                    className={isCompleted ? '' : 'bg-[#7A1E1E] hover:bg-[#6A1919]'}
                  >
                    {isCompleted ? 'View' : 'Evaluate'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Final Evaluation Access */}
      <Card
        className={`
          border-2
          ${canAccessFinalEvaluation
            ? 'border-[#7A1E1E] bg-gradient-to-br from-[#7A1E1E]/5 to-transparent'
            : 'border-gray-300 opacity-60'
          }
        `}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {canAccessFinalEvaluation ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-500" />}
            Final Evaluation – Scholar Gateway
          </CardTitle>
          <CardDescription>
            {canAccessFinalEvaluation
              ? `${traineeName} has completed all chapters and is eligible for final evaluation`
              : `Complete all ${totalChapters} chapters to unlock final evaluation`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-[#6c757d]">
            Progress: {stats.completed}/{totalChapters} chapters passed
          </div>
          <Button
            onClick={() => onStartEvaluation(0)} // 0 indicates final evaluation
            disabled={!canAccessFinalEvaluation}
            className="bg-[#7A1E1E] hover:bg-[#6A1919]"
          >
            {canAccessFinalEvaluation ? 'Start Final Evaluation' : 'Locked'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
