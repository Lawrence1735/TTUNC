# TalentTrackUNC — Backend API

Laravel 11 REST API for the Director, Recruitment & Training Management Dashboard.

## Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | Laravel 11 (PHP 8.3)                |
| Database     | PostgreSQL 15+                      |
| Auth         | Laravel Sanctum (token-based)       |
| Code style   | PSR-12 via Laravel Pint             |
| Testing      | PestPHP                             |

---

## Quick Start

```bash
# 1. Install dependencies
composer install

# 2. Copy environment file and configure your DB credentials
cp .env.example .env
php artisan key:generate

# 3. Create the PostgreSQL database
createdb talenttrack_unc

# 4. Run migrations
php artisan migrate

# 5. Seed with fixture data (mirrors the React mock datasets)
php artisan db:seed

# 6. Start the development server
php artisan serve
```

---

## API Base URL

```
http://localhost:8000/api/v1
```

---

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header.

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "carl.fausto@unc.edu.ph",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "<sanctum-token>",
  "user": { "id": 3, "name": "Carl Ariel Fausto", "role": "director", ... }
}
```

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

---

## Endpoint Reference

### Dashboard

| Method | Path                        | Role            | Description                                      |
|--------|-----------------------------|-----------------|--------------------------------------------------|
| GET    | `/dashboard/summary`        | director, admin | Composite metrics payload for the 70/30 UI view  |

**Response shape:**
```json
{
  "data": {
    "pending_applications_count": 2,
    "scheduled_interviews_count": 1,
    "applications_this_week_count": 3,
    "active_trainees_count": 12,
    "avg_completion_rate": 67.4,
    "pipeline_items": [...],
    "calendar_events": [...],
    "weekly_growth": [{ "date": "2024-11-10", "count": 2 }, ...]
  }
}
```

---

### Recruitment

| Method | Path                                              | Role            | Description                          |
|--------|---------------------------------------------------|-----------------|--------------------------------------|
| GET    | `/recruitment/applications`                       | director, admin | Paginated application list           |
| POST   | `/applications`                                   | public          | Submit a new scholarship application |
| GET    | `/recruitment/applications/{id}`                  | director, admin | Single application detail            |
| POST   | `/recruitment/applications/{id}/schedule-interview` | director, admin | Schedule interview → status transition |
| POST   | `/recruitment/applications/{id}/approve`          | director, admin | Approve → provision user + trainee   |
| POST   | `/recruitment/applications/{id}/reject`           | director, admin | Reject with reason + feedback        |

#### Schedule Interview Body
```json
{
  "scheduled_at": "2024-11-15T10:00:00",
  "venue": "Music Building Room 201",
  "notes": "Bring portfolio"
}
```

#### Reject Body
```json
{
  "denial_reason": "Did not meet talent requirements",
  "denial_feedback": "The applicant's audition did not demonstrate sufficient proficiency."
}
```

---

### Training

| Method | Path                                          | Role                    | Description                              |
|--------|-----------------------------------------------|-------------------------|------------------------------------------|
| GET    | `/training/trainees`                          | director, admin         | Paginated trainee roster                 |
| GET    | `/training/trainees/{id}`                     | director, admin, trainee| Single trainee with attendance + evals   |
| GET    | `/training/trainees/{id}/stats`               | director, admin, trainee| Historical performance aggregations      |
| GET    | `/training/attendance`                        | director, admin         | Attendance matrix (filterable by date)   |
| POST   | `/training/attendance/batch`                  | director, admin         | Batch upsert attendance for a session    |
| PATCH  | `/training/attendance/{id}/toggle-no-practice`| director, admin         | Toggle no-practice flag                  |
| GET    | `/training/evaluations`                       | director, admin         | Paginated evaluations list               |
| POST   | `/training/evaluations`                       | director, admin         | Create evaluation                        |
| GET    | `/training/evaluations/{id}`                  | director, admin, trainee| Single evaluation detail                 |
| PATCH  | `/training/evaluations/{id}`                  | director, admin         | Update draft evaluation                  |

#### Batch Attendance Body
```json
{
  "session_date": "2024-11-15",
  "no_practice": false,
  "records": [
    { "trainee_id": 1, "status": "present" },
    { "trainee_id": 2, "status": "absent"  },
    { "trainee_id": 3, "status": "present" }
  ]
}
```

#### Create Evaluation Body
```json
{
  "trainee_id": 1,
  "rating": 88,
  "evaluation_date": "2024-11-20",
  "status": "submitted",
  "recommendation": "continue",
  "semester": "1st Semester",
  "academic_year": "2024-2025",
  "notes": "Consistent improvement across all metrics.",
  "section_a": {
    "reports_on_time": 5,
    "reports_regularly": 4,
    "practices_on_time": 5,
    "practices_regularly": 4,
    "no_unnecessary_absence": 5,
    "mastery_tasks": 4,
    "maintains_cleanliness": 5
  },
  "section_b": {
    "improvement_interest": 4,
    "performance_interest": 5,
    "work_ethic": 4,
    "initiative": 4,
    "efficiency": 4
  },
  "section_c": {
    "teamwork": 5,
    "tact": 4,
    "courtesy": 5,
    "disposition": 4
  }
}
```

---

## Database Schema

```
users
  id, name, email, student_id, password, role, talent_group,
  phone, year_level, course, department, address,
  emergency_contact, emergency_phone,
  application_status, training_status, scholarship_percentage,
  assigned_instrument, assigned_voice,
  email_verified_at, remember_token, timestamps, soft_deletes

applications
  id, user_id (nullable FK), talent_group, status,
  applications_this_week_tracker,
  applicant_name, applicant_email, applicant_student_id, ...
  chapters, instruments, voices, vocal_range, primary_dance_genre,
  experience, motivation, documents (json), portfolio_url,
  denial_reason, denial_feedback, approval_notes,
  applied_at, timestamps, soft_deletes

interviews
  id, application_id (unique FK), reviewer_id (FK),
  scheduled_at, venue, notes,
  outcome, outcome_notes, completed_at,
  timestamps

trainees
  id, user_id (unique FK), completion_rate (cached),
  current_status, chapter, instrument, voice,
  total_expected_sessions, date_joined,
  timestamps, soft_deletes

attendance_records
  id, trainee_id (FK), session_date, no_practice, status, notes,
  UNIQUE(trainee_id, session_date),
  timestamps

evaluations
  id, trainee_id (FK), evaluator_id (FK),
  rating (1-100), section_a (json), section_b (json), section_c (json),
  notes, strengths, improvements,
  recommendation, status, semester, academic_year,
  adjectival_rating, recommend_for_renewal,
  evaluation_date, timestamps, soft_deletes
```

---

## Seeded Credentials

| Role     | Email                          | Password   |
|----------|--------------------------------|------------|
| Admin    | admin@unc.edu.ph               | password   |
| Director | carl.fausto@unc.edu.ph         | password   |
| Director | c.villanueva@unc.edu.ph        | password   |
| Scholar  | scholar@unc.edu.ph             | password   |
| Trainee  | training@unc.edu.ph            | password   |
