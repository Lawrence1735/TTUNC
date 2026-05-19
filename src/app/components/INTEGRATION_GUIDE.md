# TalentTrackUNC Refactoring Integration Guide

This guide explains how to integrate the new refactored components into the TalentTrackUNC application.

## New Components Overview

### 1. EvaluationConfirmationDialog
**Purpose**: Mandatory confirmation step before evaluation submission
**Location**: `EvaluationConfirmationDialog.tsx`
**Usage in EvaluationFormDialog**: Already integrated

```tsx
import { EvaluationConfirmationDialog } from './EvaluationConfirmationDialog';

// Inside your component:
<EvaluationConfirmationDialog
  open={showConfirmation}
  onOpenChange={setShowConfirmation}
  traineeName={selectedTrainee?.name || ''}
  overallRating={calculateOverallRating()}
  adjectivalRating={getAdjectivalRating()}
  scholarshipTier={computedTier}
  onConfirm={handleConfirmSubmit}
  onCancel={() => setShowConfirmation(false)}
/>
```

### 2. AttendanceCalendarChecklist
**Purpose**: Display granular calendar view of training attendance with daily status tagging
**Location**: `AttendanceCalendarChecklist.tsx`
**Usage in TrainingDashboard & MemberProfileDashboard**:

```tsx
import { AttendanceCalendarChecklist } from './AttendanceCalendarChecklist';

<AttendanceCalendarChecklist
  traineeName={user.name}
  attendanceDates={attendanceRecords} // Array of { date, status, notes }
  startDate={summmerIntensiveStart}
  endDate={summmerIntensiveEnd}
/>
```

### 3. ChapterProgressTracker
**Purpose**: Sequential chapter progression with locking system
**Location**: `ChapterProgressTracker.tsx`
**Key Features**:
- Chapters 2+ start as locked
- Only unlock after previous chapter evaluation is passed
- Final Evaluation locks until all chapters passed
- Individual chapter evaluation blocks

```tsx
import { ChapterProgressTracker } from './ChapterProgressTracker';

<ChapterProgressTracker
  traineeId={user.id}
  traineeName={user.name}
  chapters={traineeChapters} // Array of ChapterEvaluation
  onChapterClick={(chapterNum) => { /* navigate or expand */ }}
  onStartEvaluation={(chapterNum) => { /* open evaluation for chapter */ }}
  totalChapters={30}
  isMajorettes={user.talentGroup === 'majorettes'}
  isGleeClub={user.talentGroup === 'glee-club'}
  isDanceClub={user.talentGroup === 'dance-club'}
/>
```

### 4. DirectorMicroTaskUtility
**Purpose**: Allow Directors to assign micro-targets (daily/weekly goals) to trainees
**Location**: `DirectorMicroTaskUtility.tsx`
**Features**:
- Goal text field
- Time-frame toggle (Daily/Weekly)
- Target date
- Track completion status

```tsx
import { DirectorMicroTaskUtility } from './DirectorMicroTaskUtility';

<DirectorMicroTaskUtility
  traineeId={trainee.id}
  traineeName={trainee.name}
  directorId={currentUser.id}
  directorName={currentUser.name}
  microTargets={traineeTargets}
  onAddTarget={(target) => { /* save */ }}
  onUpdateTarget={(target) => { /* update */ }}
  onDeleteTarget={(targetId) => { /* delete */ }}
  onMarkTargetComplete={(targetId) => { /* mark done */ }}
/>
```

### 5. CompactQuickStatsGrid
**Purpose**: Display quick stats in compact square grid format instead of horizontal rectangles
**Location**: `CompactQuickStatsGrid.tsx`
**Features**:
- Responsive grid (2-4 columns)
- Compact square layout
- Maximizes vertical space

```tsx
import { CompactQuickStatsGrid } from './CompactQuickStatsGrid';

const stats = [
  { icon: Users, label: 'Active Trainees', value: 45 },
  { icon: Award, label: 'Completion Rate', value: '78%' },
  { icon: CheckCircle, label: 'Evaluations Done', value: 120 },
  { icon: TrendingUp, label: 'Avg Score', value: '4.2/5' }
];

<CompactQuickStatsGrid stats={stats} columns={4} compact={true} />
```

## Evaluation System Updates

### Changes to EvaluationFormDialog:
1. ✅ **Item 3 Removed** from all sections:
   - Section A: Removed "Reports to practices/rehearsals on time"
   - Section B: Removed "Demonstrates strong work ethic"
   - Section C: Removed "Treats everyone with courtesy and respect"

2. ✅ **Auto-Detection Fields**:
   - Talent Unit: Automatically pulled from logged-in user's talentGroup
   - Rating Period: Auto-detected from current date vs timeline profile
   - Scholarship Tier: Auto-assigned based on final computed score

3. ✅ **Removed Manual Inputs**:
   - Rating Period is now display-only
   - Talent Unit is now display-only
   - Scholarship percentage is auto-computed and display-only

4. ✅ **Mandatory Confirmation Dialog**:
   - Shows evaluation summary before finalization
   - Cannot proceed without confirmation
   - Displays: Scholar name, overall rating, adjectival rating, assigned scholarship

## Type Updates

### New Types in types.ts:

```typescript
// Section evaluation interfaces
interface SectionA { /* 6 fields, item 3 removed */ }
interface SectionB { /* 4 fields, item 3 removed */ }
interface SectionC { /* 3 fields, item 3 removed */ }

// Chapter progression tracking
interface ChapterEvaluation {
  chapterNumber: number;
  chapterName: string;
  evaluationId?: string;
  status: 'locked' | 'unlocked' | 'completed' | 'passed' | 'failed';
  evaluationScore?: number;
  completedDate?: Date;
  lessons: string[];
  methods: string[];
}

// Micro-target tracking
interface MicroTarget {
  id: string;
  traineeId: string;
  createdBy: string;
  goalText: string;
  timeframe: 'daily' | 'weekly';
  targetDate: Date;
  createdDate: Date;
  status: 'active' | 'completed' | 'missed';
  completedDate?: Date;
}

// Granular attendance
interface AttendanceRecord {
  date: Date;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
}
```

## Implementation Steps

### Step 1: Update TrainingDashboard
Add ChapterProgressTracker and AttendanceCalendarChecklist to trainee view:

```tsx
import { ChapterProgressTracker, AttendanceCalendarChecklist } from './components';

// In TrainingDashboard component:
<div className="space-y-6">
  {/* Chapter Progress */}
  <ChapterProgressTracker
    traineeId={user.id}
    traineeName={user.name}
    chapters={traineeChapters}
    onChapterClick={handleChapterClick}
    onStartEvaluation={handleStartEvaluation}
    totalChapters={30}
    isMajorettes={user.talentGroup === 'majorettes'}
  />
  
  {/* Attendance Calendar */}
  <AttendanceCalendarChecklist
    traineeName={user.name}
    attendanceDates={attendanceRecords}
  />
</div>
```

### Step 2: Update DirectorDashboardEnhanced
Add DirectorMicroTaskUtility and CompactQuickStatsGrid:

```tsx
import { DirectorMicroTaskUtility, CompactQuickStatsGrid } from './components';

// Replace horizontal Quick Stats with grid:
<CompactQuickStatsGrid
  stats={[
    { icon: Users, label: 'Active Trainees', value: trainingData.length },
    { icon: Award, label: 'Completion Rate', value: `${completionRate}%` },
    // ... more stats
  ]}
  columns={4}
  compact={true}
/>

// Add micro-task manager for selected trainee:
<DirectorMicroTaskUtility
  traineeId={selectedTrainee.id}
  traineeName={selectedTrainee.name}
  directorId={currentUser.id}
  directorName={currentUser.name}
  microTargets={selectedTraineeMicroTargets}
  onAddTarget={handleAddMicroTarget}
  onUpdateTarget={handleUpdateMicroTarget}
  onDeleteTarget={handleDeleteMicroTarget}
  onMarkTargetComplete={handleMarkComplete}
/>
```

### Step 3: Update MemberProfileDashboard
Remove attendance summary, add application form data and attendance calendar:

```tsx
import { AttendanceCalendarChecklist } from './components';

// Remove old attendance summary section

// Add application form fields:
const displayProfileFromApplication = () => {
  // Pull from user's original application data
  return (
    <>
      <p>Name: {application?.personalInfo.name}</p>
      <p>Student ID: {application?.personalInfo.studentId}</p>
      <p>Email: {application?.personalInfo.email}</p>
      <p>Phone: {application?.personalInfo.phone}</p>
      {/* etc. */}
    </>
  );
};

// Add attendance calendar:
<AttendanceCalendarChecklist
  traineeName={user.name}
  attendanceDates={userAttendanceDates}
/>
```

### Step 4: Make Card Summaries Tappable
Add expandable card functionality:

```tsx
// Example: Make evaluation cards expandable
const [expandedEval, setExpandedEval] = useState<string | null>(null);

evaluations.map(eval => (
  <div
    key={eval.id}
    onClick={() => setExpandedEval(expandedEval === eval.id ? null : eval.id)}
    className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50"
  >
    <div>Summary: {eval.traineeName} - Score: {eval.rating}/100</div>
    {expandedEval === eval.id && (
      <div className="mt-4 pt-4 border-t space-y-2">
        {/* Show detailed scorecard metrics */}
        <p>Section A: {eval.sectionA?.reportsOnTime || '—'}</p>
        <p>Section B: {eval.sectionB?.improvementInterest || '—'}</p>
        {/* etc. */}
      </div>
    )}
  </div>
))
```

## Data Migration Notes

### For Existing Evaluations:
- Update evaluation records to include new ChapterEvaluation references
- Map existing evaluations to chapters they correspond to
- Set chapter statuses based on evaluation results

### For Existing Trainees:
- Initialize micro-targets array (empty initially)
- Create AttendanceRecord entries from existing attendance data
- Set initial chapter status to 'locked' (except chapter 1)

## Testing Checklist

- [ ] Evaluation form missing item 3 from all sections
- [ ] Rating period shows correctly (display-only)
- [ ] Talent unit shows correctly (display-only)
- [ ] Scholarship tier calculates correctly
- [ ] Confirmation dialog appears before submission
- [ ] Chapters 2+ start as locked
- [ ] Chapter unlocks after previous passes
- [ ] Final evaluation locked until all chapters passed
- [ ] Attendance calendar displays correctly with legend
- [ ] Micro-targets can be created and tracked
- [ ] Quick stats display in square grid
- [ ] All card summaries expandable by clicking

## Performance Considerations

1. **ChapterProgressTracker**: Memoize chapter status calculations
2. **AttendanceCalendarChecklist**: Virtualize long date lists if needed
3. **DirectorMicroTaskUtility**: Paginate large target lists
4. **CompactQuickStatsGrid**: Lazy load icon components

## Accessibility Features

All new components include:
- WCAG 2.1 AA compliant contrast ratios
- Proper semantic HTML and ARIA labels
- Keyboard navigation support
- Screen reader friendly descriptions
- Focus management in dialogs
