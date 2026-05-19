/**
 * IMPLEMENTATION EXAMPLE: DirectorDashboardEnhanced Integration
 * 
 * This file shows exactly where and how to integrate the new refactored components
 * into the DirectorDashboardEnhanced component.
 */

import React, { useState } from 'react';
import {
  DirectorMicroTaskUtility,
  CompactQuickStatsGrid,
  ChapterProgressTracker,
  type MicroTarget
} from './index';
import {
  Users,
  Award,
  CheckCircle,
  TrendingUp,
  Target,
  Calendar,
  Trophy,
  BookOpen
} from './ui/icons';

// ============================================================================
// EXAMPLE 1: Replace Quick Stats with Compact Square Grid Layout
// ============================================================================

/**
 * OLD IMPLEMENTATION: Horizontal layout with long rectangles
 * Uses grid-cols-2 sm:grid-cols-4 with fixed aspect ratio
 */
export const DirectorDashboardQuickStatsOld = ({ trainingData, evaluations }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
      {/* Individual QuickStatsCard components rendered here */}
    </div>
  );
};

/**
 * NEW IMPLEMENTATION: Compact square grid layout
 * Uses CompactQuickStatsGrid component
 */
export const DirectorDashboardQuickStatsNew = ({
  trainingData,
  evaluations,
  trainees
}) => {
  // Calculate statistics
  const activeTrainees = trainees.filter(t => t.trainingStatus === 'in_progress').length;
  const completionRate = trainingData?.length > 0
    ? Math.round(
        (trainingData.filter(r => r.evaluation === 'qualified').length /
          trainingData.length) *
          100
      )
    : 0;
  const evaluationsDone = evaluations?.filter(e => e.status === 'submitted').length || 0;
  const avgScore = evaluations?.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length).toFixed(1)
    : 0;

  const stats = [
    {
      icon: Users,
      label: 'Active Trainees',
      value: activeTrainees,
      iconColor: '#7A1E1E',
      iconBgColor: '#7A1E1E'
    },
    {
      icon: Award,
      label: 'Completion Rate',
      value: `${completionRate}%`,
      iconColor: '#7A1E1E',
      iconBgColor: '#7A1E1E'
    },
    {
      icon: CheckCircle,
      label: 'Evaluations Done',
      value: evaluationsDone,
      iconColor: '#7A1E1E',
      iconBgColor: '#7A1E1E'
    },
    {
      icon: TrendingUp,
      label: 'Average Score',
      value: `${avgScore}/100`,
      iconColor: '#7A1E1E',
      iconBgColor: '#7A1E1E'
    }
  ];

  return (
    <CompactQuickStatsGrid
      stats={stats}
      columns={4}
      compact={true}
    />
  );
};

// ============================================================================
// EXAMPLE 2: Add Micro-Task Manager to Trainee Details Dialog
// ============================================================================

export const TraineeDetailsWithMicroTasks = ({
  selectedTrainee,
  currentUser,
  microTargets,
  onAddMicroTarget,
  onUpdateMicroTarget,
  onDeleteMicroTarget,
  onMarkTargetComplete
}) => {
  return (
    <div className="space-y-6">
      {/* Existing trainee details sections... */}

      {/* NEW: Micro-Task Manager */}
      <DirectorMicroTaskUtility
        traineeId={selectedTrainee.id}
        traineeName={selectedTrainee.name}
        directorId={currentUser.id}
        directorName={currentUser.name}
        microTargets={microTargets}
        onAddTarget={onAddMicroTarget}
        onUpdateTarget={onUpdateMicroTarget}
        onDeleteTarget={onDeleteMicroTarget}
        onMarkTargetComplete={onMarkTargetComplete}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Add Chapter Tracker to Trainee Performance Dialog
// ============================================================================

export const TraineePerformanceWithChapters = ({
  selectedTraineePerformance,
  traineeChapters,
  onChapterClick,
  onStartEvaluation
}) => {
  const traineeId = selectedTraineePerformance.id!;
  const chapters = traineeChapters[traineeId] || {};

  // Convert existing chapter data to ChapterEvaluation format
  const chapterEvaluations = Array.from({ length: 30 }, (_, i) => i + 1).map(
    chapterNum => ({
      chapterNumber: chapterNum,
      chapterName: `Chapter ${chapterNum}`,
      status: (chapters[chapterNum]
        ? 'completed'
        : chapterNum === 1
          ? 'unlocked'
          : 'locked') as 'locked' | 'unlocked' | 'completed' | 'passed' | 'failed',
      lessons: [],
      methods: []
    })
  );

  return (
    <div className="space-y-6">
      {/* Existing performance details... */}

      {/* NEW: Chapter Progress Tracker */}
      <ChapterProgressTracker
        traineeId={traineeId}
        traineeName={selectedTraineePerformance.name}
        chapters={chapterEvaluations}
        onChapterClick={onChapterClick}
        onStartEvaluation={onStartEvaluation}
        totalChapters={30}
        isMajorettes={selectedTraineePerformance.talentGroup === 'majorettes'}
        isGleeClub={selectedTraineePerformance.talentGroup === 'glee-club'}
        isDanceClub={selectedTraineePerformance.talentGroup === 'dance-club'}
      />
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: State Management for Micro-Targets
// ============================================================================

/**
 * Hook for managing micro-target state in DirectorDashboard
 */
export const useMicroTargetManagement = (initialTargets: MicroTarget[] = []) => {
  const [microTargets, setMicroTargets] = useState<MicroTarget[]>(initialTargets);

  const addMicroTarget = (target: MicroTarget) => {
    setMicroTargets(prev => [...prev, target]);
  };

  const updateMicroTarget = (updatedTarget: MicroTarget) => {
    setMicroTargets(prev =>
      prev.map(t => (t.id === updatedTarget.id ? updatedTarget : t))
    );
  };

  const deleteMicroTarget = (targetId: string) => {
    setMicroTargets(prev => prev.filter(t => t.id !== targetId));
  };

  const markTargetComplete = (targetId: string) => {
    setMicroTargets(prev =>
      prev.map(t =>
        t.id === targetId
          ? { ...t, status: 'completed', completedDate: new Date() }
          : t
      )
    );
  };

  // Group targets by trainee
  const getTraineeTargets = (traineeId: string) =>
    microTargets.filter(t => t.traineeId === traineeId);

  // Get active targets for a trainee
  const getTraineeActiveTargets = (traineeId: string) =>
    microTargets.filter(t => t.traineeId === traineeId && t.status === 'active');

  // Get overdue targets
  const getOverdueTargets = () => {
    const now = new Date().toISOString().split('T')[0];
    return microTargets.filter(
      t => t.status === 'active' && t.targetDate.toISOString().split('T')[0] < now
    );
  };

  return {
    microTargets,
    addMicroTarget,
    updateMicroTarget,
    deleteMicroTarget,
    markTargetComplete,
    getTraineeTargets,
    getTraineeActiveTargets,
    getOverdueTargets
  };
};

// ============================================================================
// EXAMPLE 5: Complete DirectorDashboard Integration
// ============================================================================

export const IntegratedDirectorDashboardExample = ({
  user,
  trainingRecords,
  evaluations,
  trainees,
  inventoryItems
}) => {
  // Micro-target management
  const {
    microTargets,
    addMicroTarget,
    updateMicroTarget,
    deleteMicroTarget,
    markTargetComplete,
    getTraineeTargets
  } = useMicroTargetManagement([]);

  // UI State
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [showTraineeDialog, setShowTraineeDialog] = useState(false);
  const [selectedTraineePerformance, setSelectedTraineePerformance] = useState(null);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);

  const handleTraineeSelect = (trainee) => {
    setSelectedTrainee(trainee);
    setShowTraineeDialog(true);
  };

  const handleStartEvaluation = (chapterNumber) => {
    // Open evaluation dialog
    console.log(`Starting evaluation for chapter ${chapterNumber}`);
  };

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#7A1E1E] mb-2">Director Dashboard</h1>
        <p className="text-gray-600">Manage trainees, evaluations, and progress</p>
      </div>

      {/* Quick Stats - NEW COMPACT GRID */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Overview Statistics</h2>
        <DirectorDashboardQuickStatsNew
          trainingData={trainingRecords}
          evaluations={evaluations}
          trainees={trainees}
        />
      </div>

      {/* Training Completion Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Trainee List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Trainees</h2>
          <div className="space-y-2">
            {trainees.map(trainee => (
              <div
                key={trainee.id}
                onClick={() => handleTraineeSelect(trainee)}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{trainee.name}</h3>
                    <p className="text-sm text-gray-600">{trainee.talentGroup}</p>
                  </div>
                  <Users className="w-5 h-5 text-[#7A1E1E]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Trainee Details */}
        {selectedTrainee && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {selectedTrainee.name} - Micro-Targets
            </h2>
            <DirectorMicroTaskUtility
              traineeId={selectedTrainee.id}
              traineeName={selectedTrainee.name}
              directorId={user.id}
              directorName={user.name}
              microTargets={getTraineeTargets(selectedTrainee.id)}
              onAddTarget={addMicroTarget}
              onUpdateTarget={updateMicroTarget}
              onDeleteTarget={deleteMicroTarget}
              onMarkTargetComplete={markTargetComplete}
            />
          </div>
        )}
      </div>

      {/* Trainee Performance Details Dialog */}
      {showPerformanceDialog && selectedTraineePerformance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
            <TraineePerformanceWithChapters
              selectedTraineePerformance={selectedTraineePerformance}
              traineeChapters={{}}
              onChapterClick={() => {}}
              onStartEvaluation={handleStartEvaluation}
            />
          </div>
        </div>
      )}
    </main>
  );
};

// ============================================================================
// EXAMPLE 6: Data Persistence for Micro-Targets
// ============================================================================

/**
 * Functions to save/load micro-targets from backend or localStorage
 */
export const MicroTargetPersistence = {
  /**
   * Save micro-target to backend
   */
  async saveMicroTarget(target: MicroTarget): Promise<MicroTarget> {
    // API call example
    const response = await fetch('/api/micro-targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(target)
    });
    return response.json();
  },

  /**
   * Load micro-targets for a trainee from backend
   */
  async loadTraineeMicroTargets(traineeId: string): Promise<MicroTarget[]> {
    const response = await fetch(`/api/micro-targets?traineeId=${traineeId}`);
    return response.json();
  },

  /**
   * Update micro-target on backend
   */
  async updateMicroTarget(target: MicroTarget): Promise<MicroTarget> {
    const response = await fetch(`/api/micro-targets/${target.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(target)
    });
    return response.json();
  },

  /**
   * Delete micro-target from backend
   */
  async deleteMicroTarget(targetId: string): Promise<void> {
    await fetch(`/api/micro-targets/${targetId}`, {
      method: 'DELETE'
    });
  }
};

// ============================================================================
// EXAMPLE 7: Integration with Existing Training Tab
// ============================================================================

/**
 * Enhanced DirectorTrainingTab with new components
 */
export const EnhancedDirectorTrainingTab = ({
  trainees,
  trainingCompletionRate,
  evaluations,
  selectedTrainee,
  onSelectTrainee
}) => {
  const {
    microTargets,
    addMicroTarget,
    updateMicroTarget,
    deleteMicroTarget,
    markTargetComplete,
    getTraineeTargets
  } = useMicroTargetManagement([]);

  return (
    <div className="space-y-6">
      {/* Compact Quick Stats - REPLACES HORIZONTAL LAYOUT */}
      <CompactQuickStatsGrid
        stats={[
          {
            icon: Users,
            label: 'Active Trainees',
            value: trainees.length,
            iconColor: '#7A1E1E'
          },
          {
            icon: Award,
            label: 'Completion Rate',
            value: `${trainingCompletionRate}%`,
            iconColor: '#7A1E1E'
          },
          {
            icon: CheckCircle,
            label: 'Evaluations',
            value: evaluations.filter(e => e.status === 'submitted').length,
            iconColor: '#7A1E1E'
          },
          {
            icon: Trophy,
            label: 'Qualified',
            value: trainees.filter(t => t.applicationStatus === 'qualified').length,
            iconColor: '#7A1E1E'
          }
        ]}
        columns={4}
        compact={true}
      />

      {/* Selected Trainee Micro-Tasks */}
      {selectedTrainee && (
        <DirectorMicroTaskUtility
          traineeId={selectedTrainee.id}
          traineeName={selectedTrainee.name}
          directorId="director_1"
          directorName="Director Name"
          microTargets={getTraineeTargets(selectedTrainee.id)}
          onAddTarget={addMicroTarget}
          onUpdateTarget={updateMicroTarget}
          onDeleteTarget={deleteMicroTarget}
          onMarkTargetComplete={markTargetComplete}
        />
      )}

      {/* Selected Trainee Chapter Progress */}
      {selectedTrainee && (
        <ChapterProgressTracker
          traineeId={selectedTrainee.id}
          traineeName={selectedTrainee.name}
          chapters={[]}
          onChapterClick={() => {}}
          onStartEvaluation={() => {}}
          totalChapters={30}
        />
      )}
    </div>
  );
};
