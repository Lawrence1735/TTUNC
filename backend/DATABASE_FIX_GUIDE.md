# Database Backend Fix — TalentTrack UNC

## Summary of Changes

Your database schema has been cleaned up to remove redundancies and improve data integrity:

| Table | Changes |
|-------|---------|
| **users** | Removed `application_status`, `training_status` |
| **applications** | Removed `applied_at` (duplicate of `created_at`) |
| **trainees** | Removed `completion_rate` (derivable), `chapter` (redundant) |
| **documents** | Changed `file_size` from `varchar` → `int` (bytes), removed `uploaded_by` |
| **module_names** | Dropped entire table (unused) |

## How to Apply Fixes

### Option 1: Apply Migrations (Recommended)
```bash
cd backend
php artisan migrate
```

This will run all pending migrations, including the five cleanup migrations (batch 4):
- `2026_06_07_000001_remove_redundant_fields_from_users`
- `2026_06_07_000002_remove_redundant_fields_from_applications`
- `2026_06_07_000003_remove_redundant_fields_from_trainees`
- `2026_06_07_000004_clean_documents_table`
- `2026_06_07_000005_drop_module_names_table`

### Option 2: Fresh Database + Seed (For Development Only)
```bash
cd backend
php artisan migrate:fresh --seed
```

**⚠️ Warning:** This deletes all data and resets the database!

## Migration Files Created

Five new migration files have been created in `database/migrations/`:

1. **`2026_06_07_000001_remove_redundant_fields_from_users.php`**
   - Removes: `application_status`, `training_status`
   - Reason: Data is already tracked in `applications.status` and `trainees.current_status`

2. **`2026_06_07_000002_remove_redundant_fields_from_applications.php`**
   - Removes: `applied_at`
   - Reason: Duplicate of `created_at`

3. **`2026_06_07_000003_remove_redundant_fields_from_trainees.php`**
   - Removes: `completion_rate`, `chapter`
   - Reason: `completion_rate` is derived from JSON, `chapter` is redundant

4. **`2026_06_07_000004_clean_documents_table.php`**
   - Changes: `file_size` (varchar → unsigned int)
   - Removes: `uploaded_by`
   - Reason: Use `user_id` FK instead; store bytes as integer

5. **`2026_06_07_000005_drop_module_names_table.php`**
   - Removes: entire `module_names` table
   - Reason: Empty table with no actual data

## Data Integrity Notes

### Derived Fields (No Data Loss)
- **`trainees.completion_rate`** is now calculated from `chapters_completed` JSON:
  ```php
  $completed = count(array_filter($chapters_completed));
  $completion_rate = ($completed / 30) * 100;
  ```

- **`trainees.chapter`** is now read from `chapters_completed` JSON keys

### Foreign Keys & Relationships
All foreign key constraints are preserved:
- `applications.user_id` → `users.id`
- `trainees.user_id` → `users.id`
- `documents.user_id` → `users.id`
- All constraints remain intact after cleanup

## Backend Code Updates Needed

### In Your Controllers/Models:

**Old (Remove):**
```php
$user->training_status     // ❌ No longer exists
$user->application_status  // ❌ No longer exists
$trainee->completion_rate  // ❌ No longer exists (now derived)
```

**New (Use):**
```php
$trainee->current_status                           // From trainees.current_status
$application->status                               // From applications.status
$completionRate = count(array_filter($trainee->chapters_completed ?? [])) / 30 * 100;  // Derived
```

### File Size Handling:

**Old (Remove):**
```php
$document->file_size = "2.5 MB";  // ❌ String format
```

**New (Use):**
```php
$document->file_size = filesize($path);  // ✓ Bytes as integer
// To display: format_bytes($document->file_size)
```

## Verification

After running migrations, verify the schema:

```bash
php artisan tinker
```

```php
// Check removed columns don't exist
Schema::hasColumn('users', 'training_status');  // Should be false
Schema::hasColumn('trainees', 'completion_rate');  // Should be false

// Check foreign keys are still there
DB::select("SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME='trainees'");
```

## Rollback

If you need to revert:
```bash
php artisan migrate:rollback --step=5
```

This will undo the five cleanup migrations.

## Next Steps

1. **Run migrations:**
   ```bash
   php artisan migrate
   ```

2. **Update frontend queries** to derive `completion_rate` instead of reading from DB

3. **Test thoroughly** before deploying to production

4. **Update API endpoints** that may return removed fields

---

**Questions?** Check the migration files in `database/migrations/2026_06_07_*.php` for detailed comments.
