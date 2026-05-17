-- ============================================================================
-- TalentTrackUNC - SQL Queries
-- Production Database Queries for PostgreSQL/Supabase
-- ============================================================================

-- ============================================================================
-- 1. CREATE DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TALENT_GROUPS
CREATE TABLE talent_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    description TEXT,
    director_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'scholar', 'admin', 'director')),
    student_id VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    talent_group_id UUID REFERENCES talent_groups(id),
    application_status VARCHAR(20),
    year_level VARCHAR(20),
    course VARCHAR(100),
    training_status VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    assigned_instrument VARCHAR(100),
    assigned_voice VARCHAR(50),
    scholarship_percentage DECIMAL(5,2),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- APPLICATIONS
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id),
    experience TEXT,
    motivation TEXT,
    documents TEXT[],
    personal_info JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- TRAINING_RECORDS
CREATE TABLE training_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id),
    overall_progress DECIMAL(5,2) DEFAULT 0,
    evaluation VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- PRACTICE_SESSIONS
CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_record_id UUID NOT NULL REFERENCES training_records(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    attended BOOLEAN DEFAULT FALSE,
    duration INTEGER,
    activities TEXT[],
    techniques TEXT[],
    chapters_completed INTEGER DEFAULT 0,
    total_chapters INTEGER DEFAULT 0,
    performance_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- EVALUATIONS
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scholar_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES users(id),
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id),
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    evaluation_date DATE NOT NULL,
    skill_demonstration INTEGER,
    rehearsal_attendance INTEGER,
    event_participation INTEGER,
    teamwork INTEGER,
    leadership INTEGER,
    strengths TEXT,
    areas_for_improvement TEXT,
    overall_rating DECIMAL(3,2),
    recommendation VARCHAR(20),
    additional_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    related_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- INVENTORY_ITEMS
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id),
    item_name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    condition VARCHAR(20) NOT NULL,
    assigned_date DATE,
    borrowed_date DATE,
    return_date DATE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SCHOLARSHIP_RENEWALS
CREATE TABLE scholarship_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    gpa DECIMAL(3,2) NOT NULL,
    documents TEXT[],
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewer_id UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- BENEFITS
CREATE TABLE benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2),
    description TEXT NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    attachment VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ANNOUNCEMENTS
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    published_at TIMESTAMP DEFAULT NOW(),
    priority VARCHAR(20) NOT NULL,
    target_audience VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ENGAGEMENT_REQUESTS
CREATE TABLE engagement_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id),
    event_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    attachment VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ATTENDANCE_RECORDS
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagement_requests(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    no_practice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ATTENDANCE_ENTRIES
CREATE TABLE attendance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_record_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status BOOLEAN NOT NULL,
    timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- INTERVIEW_SCHEDULES
CREATE TABLE interview_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    google_calendar_event_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- USER_BENEFITS (Junction)
CREATE TABLE user_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    benefit_id UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, benefit_id)
);

-- EVENT_TALENT_GROUPS (Junction)
CREATE TABLE event_talent_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, talent_group_id)
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_talent_group_id ON users(talent_group_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_training_user_id ON training_records(user_id);
CREATE INDEX idx_practice_training_id ON practice_sessions(training_record_id);
CREATE INDEX idx_evaluations_scholar_id ON evaluations(scholar_id);
CREATE INDEX idx_evaluations_evaluator_id ON evaluations(evaluator_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX idx_renewals_user_id ON scholarship_renewals(user_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_attendance_entries_user_id ON attendance_entries(user_id);

-- ============================================================================
-- 3. INSERT INITIAL DATA
-- ============================================================================

-- Insert Talent Groups
INSERT INTO talent_groups (name, slug, color, description) VALUES
    ('Marching Band', 'marching-band', '#DC2626', 'Precision, rhythm, and musical excellence'),
    ('Majorettes', 'majorettes', '#9333EA', 'Grace, coordination, and showmanship'),
    ('Glee Club', 'glee-club', '#B8930C', 'Vocal harmony and choral artistry'),
    ('Dance Club', 'dance-club', '#2563EB', 'Movement, expression, and choreography');

-- ============================================================================
-- 4. COMMON SELECT QUERIES
-- ============================================================================

-- Get all scholars with their talent group
SELECT 
    u.id, u.name, u.email, u.student_id, u.scholarship_percentage,
    tg.name as talent_group, tg.color as talent_group_color
FROM users u
LEFT JOIN talent_groups tg ON u.talent_group_id = tg.id
WHERE u.role = 'scholar';

-- Get pending applications with applicant details
SELECT 
    a.id, a.status, a.applied_at,
    u.name as applicant_name, u.email, u.phone,
    tg.name as talent_group
FROM applications a
JOIN users u ON a.user_id = u.id
JOIN talent_groups tg ON a.talent_group_id = tg.id
WHERE a.status = 'pending'
ORDER BY a.applied_at DESC;

-- Get scholar's training progress
SELECT 
    u.name, u.student_id,
    tr.overall_progress, tr.evaluation,
    COUNT(ps.id) as total_sessions,
    SUM(CASE WHEN ps.attended THEN 1 ELSE 0 END) as attended_sessions
FROM users u
JOIN training_records tr ON tr.user_id = u.id
LEFT JOIN practice_sessions ps ON ps.training_record_id = tr.id
WHERE u.role = 'scholar'
GROUP BY u.id, u.name, u.student_id, tr.overall_progress, tr.evaluation;

-- Get upcoming events for a talent group
SELECT 
    e.id, e.title, e.date, e.time, e.location, e.type,
    ARRAY_AGG(tg.name) as talent_groups
FROM events e
JOIN event_talent_groups etg ON e.id = etg.event_id
JOIN talent_groups tg ON etg.talent_group_id = tg.id
WHERE e.date >= CURRENT_DATE
GROUP BY e.id
ORDER BY e.date, e.time;

-- Get scholar's latest evaluation
SELECT 
    e.id, e.evaluation_date, e.semester, e.academic_year,
    e.overall_rating, e.recommendation,
    e.skill_demonstration, e.rehearsal_attendance, e.event_participation,
    evaluator.name as evaluator_name
FROM evaluations e
JOIN users evaluator ON e.evaluator_id = evaluator.id
WHERE e.scholar_id = 'USER_UUID_HERE'
ORDER BY e.evaluation_date DESC
LIMIT 1;

-- Get unread notifications for user
SELECT id, title, message, type, created_at, action_url
FROM notifications
WHERE user_id = 'USER_UUID_HERE' AND read = FALSE
ORDER BY created_at DESC;

-- Get scholar's inventory items
SELECT 
    i.id, i.item_name, i.type, i.condition, i.status,
    i.assigned_date, i.borrowed_date, i.return_date
FROM inventory_items i
WHERE i.user_id = 'USER_UUID_HERE'
ORDER BY i.assigned_date DESC;

-- Get talent group statistics
SELECT 
    tg.name as talent_group,
    COUNT(DISTINCT u.id) as total_scholars,
    AVG(u.scholarship_percentage) as avg_scholarship,
    COUNT(DISTINCT e.id) as total_evaluations,
    AVG(e.overall_rating) as avg_rating
FROM talent_groups tg
LEFT JOIN users u ON u.talent_group_id = tg.id AND u.role = 'scholar'
LEFT JOIN evaluations e ON e.talent_group_id = tg.id
GROUP BY tg.id, tg.name;

-- Get pending scholarship renewals
SELECT 
    sr.id, sr.semester, sr.year, sr.gpa, sr.status, sr.submitted_at,
    u.name, u.email, u.student_id,
    tg.name as talent_group
FROM scholarship_renewals sr
JOIN users u ON sr.user_id = u.id
LEFT JOIN talent_groups tg ON u.talent_group_id = tg.id
WHERE sr.status = 'pending'
ORDER BY sr.submitted_at DESC;

-- Get attendance for an engagement
SELECT 
    ae.status,
    u.name, u.student_id, u.email
FROM attendance_entries ae
JOIN users u ON ae.user_id = u.id
WHERE ae.attendance_record_id = 'RECORD_UUID_HERE'
ORDER BY u.name;

-- Get scholar's complete profile with all related data
SELECT 
    u.id, u.name, u.email, u.student_id, u.phone,
    u.year_level, u.course, u.scholarship_percentage,
    tg.name as talent_group, tg.color as talent_group_color,
    tr.overall_progress, tr.evaluation as training_status,
    COUNT(DISTINCT e.id) as total_evaluations,
    AVG(e.overall_rating) as avg_rating,
    COUNT(DISTINCT ii.id) as inventory_items_count
FROM users u
LEFT JOIN talent_groups tg ON u.talent_group_id = tg.id
LEFT JOIN training_records tr ON tr.user_id = u.id
LEFT JOIN evaluations e ON e.scholar_id = u.id
LEFT JOIN inventory_items ii ON ii.user_id = u.id
WHERE u.id = 'USER_UUID_HERE'
GROUP BY u.id, tg.name, tg.color, tr.overall_progress, tr.evaluation;

-- ============================================================================
-- 5. COMMON INSERT QUERIES
-- ============================================================================

-- Insert new user (student)
INSERT INTO users (name, email, role, password_hash)
VALUES ('John Doe', 'john.doe@unc.edu.ph', 'student', 'HASHED_PASSWORD');

-- Insert new application
INSERT INTO applications (user_id, talent_group_id, experience, motivation, status)
VALUES (
    'USER_UUID',
    (SELECT id FROM talent_groups WHERE slug = 'marching-band'),
    'I have 5 years of experience...',
    'I want to contribute...',
    'pending'
);

-- Insert notification
INSERT INTO notifications (user_id, title, message, type, read)
VALUES (
    'USER_UUID',
    'Application Received',
    'Your application has been received and is under review.',
    'application',
    FALSE
);

-- Insert training record
INSERT INTO training_records (user_id, talent_group_id, overall_progress, evaluation)
VALUES (
    'USER_UUID',
    (SELECT id FROM talent_groups WHERE slug = 'marching-band'),
    0,
    'pending'
);

-- Insert practice session
INSERT INTO practice_sessions (
    training_record_id, date, attended, duration, 
    activities, chapters_completed, total_chapters
)
VALUES (
    'TRAINING_RECORD_UUID',
    CURRENT_DATE,
    TRUE,
    120,
    ARRAY['Warm-up exercises', 'Formation practice', 'Music rehearsal'],
    2,
    10
);

-- Insert evaluation
INSERT INTO evaluations (
    scholar_id, evaluator_id, talent_group_id,
    semester, academic_year, evaluation_date,
    skill_demonstration, rehearsal_attendance, event_participation,
    teamwork, leadership, overall_rating, recommendation
)
VALUES (
    'SCHOLAR_UUID',
    'DIRECTOR_UUID',
    'TALENT_GROUP_UUID',
    '1st Semester',
    '2025-2026',
    CURRENT_DATE,
    5, 5, 4, 5, 4,
    4.6,
    'continue'
);

-- Insert event
INSERT INTO events (title, description, date, time, location, type, is_required)
VALUES (
    'University Foundation Day',
    'Annual celebration performance',
    '2026-02-15',
    '14:00',
    'UNC Main Auditorium',
    'performance',
    TRUE
);

-- Link event to talent groups
INSERT INTO event_talent_groups (event_id, talent_group_id)
VALUES 
    ('EVENT_UUID', (SELECT id FROM talent_groups WHERE slug = 'marching-band')),
    ('EVENT_UUID', (SELECT id FROM talent_groups WHERE slug = 'majorettes'));

-- Insert inventory item
INSERT INTO inventory_items (
    user_id, talent_group_id, item_name, type, 
    condition, status, assigned_date
)
VALUES (
    'USER_UUID',
    'TALENT_GROUP_UUID',
    'Trumpet - Serial #12345',
    'instrument',
    'good',
    'assigned',
    CURRENT_DATE
);

-- Insert scholarship renewal
INSERT INTO scholarship_renewals (
    user_id, semester, year, gpa, documents, status
)
VALUES (
    'USER_UUID',
    '1st Semester',
    2026,
    3.75,
    ARRAY['grades.pdf', 'clearance.pdf'],
    'pending'
);

-- ============================================================================
-- 6. COMMON UPDATE QUERIES
-- ============================================================================

-- Update application status
UPDATE applications
SET status = 'approved'
WHERE id = 'APPLICATION_UUID';

-- Promote student to scholar
UPDATE users
SET role = 'scholar',
    talent_group_id = 'TALENT_GROUP_UUID',
    application_status = 'approved'
WHERE id = 'USER_UUID';

-- Update training progress
UPDATE training_records
SET overall_progress = 75.5,
    evaluation = 'pending'
WHERE id = 'TRAINING_RECORD_UUID';

-- Mark notification as read
UPDATE notifications
SET read = TRUE
WHERE id = 'NOTIFICATION_UUID';

-- Update inventory item status
UPDATE inventory_items
SET status = 'returned',
    return_date = CURRENT_DATE
WHERE id = 'INVENTORY_ITEM_UUID';

-- Approve scholarship renewal
UPDATE scholarship_renewals
SET status = 'approved',
    reviewed_at = NOW(),
    reviewer_id = 'REVIEWER_UUID',
    review_notes = 'Approved based on excellent performance'
WHERE id = 'RENEWAL_UUID';

-- ============================================================================
-- 7. COMMON DELETE QUERIES
-- ============================================================================

-- Delete notification (CASCADE will handle dependencies)
DELETE FROM notifications
WHERE id = 'NOTIFICATION_UUID';

-- Delete old read notifications
DELETE FROM notifications
WHERE read = TRUE AND created_at < NOW() - INTERVAL '30 days';

-- Remove user from talent group
UPDATE users
SET talent_group_id = NULL
WHERE id = 'USER_UUID';

-- ============================================================================
-- 8. ANALYTICS QUERIES
-- ============================================================================

-- Scholar performance dashboard
SELECT 
    u.name,
    u.student_id,
    tg.name as talent_group,
    COUNT(ps.id) as total_practices,
    SUM(CASE WHEN ps.attended THEN 1 ELSE 0 END) as attended_practices,
    ROUND(SUM(CASE WHEN ps.attended THEN 1 ELSE 0 END)::numeric / COUNT(ps.id) * 100, 2) as attendance_rate,
    AVG(e.overall_rating) as avg_evaluation_rating
FROM users u
JOIN talent_groups tg ON u.talent_group_id = tg.id
LEFT JOIN training_records tr ON tr.user_id = u.id
LEFT JOIN practice_sessions ps ON ps.training_record_id = tr.id
LEFT JOIN evaluations e ON e.scholar_id = u.id
WHERE u.role = 'scholar'
GROUP BY u.id, u.name, u.student_id, tg.name
ORDER BY avg_evaluation_rating DESC;

-- Monthly event participation
SELECT 
    TO_CHAR(e.date, 'YYYY-MM') as month,
    COUNT(e.id) as total_events,
    SUM(CASE WHEN e.type = 'performance' THEN 1 ELSE 0 END) as performances,
    SUM(CASE WHEN e.type = 'rehearsal' THEN 1 ELSE 0 END) as rehearsals
FROM events e
WHERE e.date >= NOW() - INTERVAL '6 months'
GROUP BY TO_CHAR(e.date, 'YYYY-MM')
ORDER BY month DESC;

-- Application conversion rate by talent group
SELECT 
    tg.name as talent_group,
    COUNT(a.id) as total_applications,
    SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN a.status = 'disapproved' THEN 1 ELSE 0 END) as disapproved,
    ROUND(SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END)::numeric / COUNT(a.id) * 100, 2) as approval_rate
FROM talent_groups tg
LEFT JOIN applications a ON a.talent_group_id = tg.id
GROUP BY tg.id, tg.name;

-- ============================================================================
-- END OF QUERIES
-- ============================================================================
