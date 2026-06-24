# Backend API Updates Required

## Fields Removed — Update Your Queries

### 1. Remove Queries for Deleted Fields

```php
// ❌ REMOVE THESE — No longer exist in database:
$user->training_status;        // Use: $user->trainee->current_status
$user->application_status;     // Use: $user->application->status
$trainee->completion_rate;     // DERIVE from chapters_completed
$trainee->chapter;             // READ from chapters_completed JSON
```

### 2. Completion Rate — Now Derived

Since `trainees.completion_rate` is removed, calculate it in your API:

```php
// In Trainee model:
public function getCompletionRateAttribute(): int
{
    $chapters = json_decode($this->chapters_completed ?? '{}', true);
    $completed = count(array_filter($chapters));
    return (int) (($completed / 30) * 100);
}

// Usage in controller:
$completion_rate = $trainee->completion_rate;  // Automatically derived
```

Or in query:

```php
// In controller:
$trainees = Trainee::with('user')
    ->get()
    ->map(function($trainee) {
        $trainee->completion_rate = count(array_filter(
            json_decode($trainee->chapters_completed ?? '{}', true)
        )) / 30 * 100;
        return $trainee;
    });
```

### 3. Current Status — Use Trainee Instead of User

```php
// ❌ OLD:
$status = $user->training_status;

// ✓ NEW:
$status = $user->trainee->current_status ?? 'inactive';

// In query:
$activeTrainees = User::whereHas('trainee', function($q) {
    $q->whereIn('current_status', ['active', 'in_progress', 'in-training']);
})->get();
```

### 4. Application Status

```php
// ❌ OLD:
$appStatus = $user->application_status;

// ✓ NEW:
$appStatus = $user->application->status ?? 'pending';

// In query:
$approvedApplicants = User::whereHas('application', function($q) {
    $q->where('status', 'approved');
})->get();
```

### 5. File Size — Now Integer (Bytes)

```php
// ❌ OLD:
$document->file_size = "2.5 MB";  // String

// ✓ NEW:
$document->file_size = 2621440;   // Integer (bytes)

// Helper to display:
public function getFormattedSizeAttribute(): string
{
    $bytes = $this->file_size ?? 0;
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= (1 << (10 * $pow));
    return round($bytes, 2) . ' ' . $units[$pow];
}

// Usage:
echo $document->formatted_size;  // "2.5 MB"
```

---

## API Response Updates

### DirectorTrainingTab — Response Example

```php
// trainingClient.ts should expect:
{
  trainees: [
    {
      id: 26,
      name: "John Lawrence Olegario",
      student_id: "23-85362",
      instrument: "Clarinet",
      voice: null,
      date_joined: "2026-06-04",
      // completion_rate is NOW DERIVED, not in response
      // But you can calculate it:
      chapters_completed: { "1": false, "2": false, ... },
      current_status: "active"  // NOT from users table anymore
    }
  ]
}
```

### Update Frontend Calculation

In [DirectorTrainingTab.tsx](../../src/app/components/DirectorTrainingTab.tsx#L97):

```tsx
// ✓ This already does the right thing:
const getTraineeCompletion = (trainee: any): number => {
  const chapterData = traineeChapters[trainee.id!];
  if (chapterData !== undefined) {
    return Math.round((Object.values(chapterData).filter(Boolean).length / 30) * 100);
  }
  return Number(trainee?.completionRate ?? 0);
};

// ✓ Current status is already being read correctly:
const statusOf = (t: any) => String(t?.currentStatus ?? t?.trainingStatus ?? t?._rawTrainee?.current_status ?? '').toLowerCase();
```

No frontend changes needed if you're already deriving completion_rate!

---

## Database Queries to Update

### Get Active Trainees with Completion Rate

```php
// In TrainingController or TraineeService:
$trainees = Trainee::where('current_status', 'active')
    ->with('user')
    ->get()
    ->map(function($trainee) {
        $chapters = json_decode($trainee->chapters_completed ?? '{}', true);
        $completed = count(array_filter($chapters));
        $trainee->completion_percentage = ($completed / 30) * 100;
        return $trainee;
    });

return response()->json([
    'trainees' => $trainees,
    'completion_rate' => $trainees->avg('completion_percentage')
]);
```

### Get Application Status via Trainee's Related User

```php
// If you need both application and training status in one query:
$user = User::with(['application', 'trainee'])
    ->find($userId);

return [
    'application_status' => $user->application?->status ?? 'none',
    'training_status' => $user->trainee?->current_status ?? 'inactive',
    'completion_rate' => /* derived from chapters_completed */
];
```

---

## Model Relationships (Verify These Are Defined)

```php
// In User model:
public function application()
{
    return $this->hasOne(Application::class);
}

public function trainee()
{
    return $this->hasOne(Trainee::class);
}

// In Trainee model:
public function user()
{
    return $this->belongsTo(User::class);
}
```

---

## Migration Rollback (If Needed)

If something breaks and you need to revert:

```bash
php artisan migrate:rollback --step=5
```

This will undo the five cleanup migrations and restore the old schema.

---

## Summary Checklist

- [ ] Run `php artisan migrate`
- [ ] Remove queries for: `user->training_status`, `user->application_status`, `trainee->completion_rate`, `trainee->chapter`
- [ ] Add accessor for `trainee->completion_rate` (derived from JSON)
- [ ] Update API responses to include derived fields
- [ ] Update file size handling (integer bytes)
- [ ] Test thoroughly in development
- [ ] Deploy to production

