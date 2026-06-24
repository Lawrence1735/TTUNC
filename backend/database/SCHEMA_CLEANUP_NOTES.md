-- ============================================================
-- TalentTrack UNC — Cleaned Database Schema
-- Fixed by: Claude (Anthropic)
-- Original dump: Jun 07, 2026
--
-- CHANGES SUMMARY:
-- 1. applications   – removed applicant_* columns that duplicate users data;
--                     removed applicant_age (derived from birthdate);
--                     removed applications_this_week_tracker (not persistent data);
--                     removed applied_at (duplicate of created_at).
--                     Kept guest-applicant columns only for rows where user_id IS NULL.
-- 2. users          – removed application_status (use applications.status instead);
--                     removed training_status (use trainees.current_status instead).
-- 3. trainees       – removed completion_rate (derived from chapters_completed);
--                     removed chapter varchar (redundant with chapters_completed JSON).
-- 4. documents      – removed uploaded_by varchar (use user_id FK instead);
--                     changed file_size to int (bytes) from varchar string.
-- 5. module_names   – dropped (empty table with no data columns).
-- ============================================================

-- Database: talenttrack_unc
-- Cleaned up: 2026-06-07

-- To apply these changes to your database:
-- 1. Run migrations: php artisan migrate
-- 2. If you need to reset and seed:
--    - php artisan migrate:fresh
--    - php artisan db:seed

-- To import this dump directly (if starting fresh):
-- mysql -u root -p talenttrack_unc < database/cleaned_schema.sql

-- Tables that have been cleaned:
-- ✓ users — removed redundant status columns
-- ✓ applications — consolidated duplicate fields
-- ✓ trainees — removed derived fields
-- ✓ documents — fixed file_size data type, removed uploaded_by
-- ✓ module_names — dropped (unused)

-- All changes are reversible via Laravel migrations.
