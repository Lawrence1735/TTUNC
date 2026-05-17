-- ============================================================================
-- TalentTrackUNC Database Schema (PostgreSQL / Supabase)
-- Version: 1.0.0
-- Last Updated: January 6, 2026
-- Normalization: 3NF (Third Normal Form)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TALENT_GROUPS: Reference table for talent groups/ensembles
-- ----------------------------------------------------------------------------
CREATE TABLE talent_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL, -- Hex color code (#DC2626)
    description TEXT,
    director_id UUID, -- FK to users table (added after users table creation)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert static talent group data
INSERT INTO talent_groups (name, slug, color, description) VALUES
    ('Marching Band', 'marching-band', '#DC2626', 'Precision, rhythm, and musical excellence'),
    ('Majorettes', 'majorettes', '#9333EA', 'Grace, coordination, and showmanship'),
    ('Glee Club', 'glee-club', '#B8930C', 'Vocal harmony and choral artistry'),
    ('Dance Club', 'dance-club', '#2563EB', 'Movement, expression, and choreography');

-- ----------------------------------------------------------------------------
-- USERS: Central entity for all system users (students, scholars, admins, directors)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'scholar', 'admin', 'director')),
    student_id VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    talent_group_id UUID REFERENCES talent_groups(id) ON DELETE RESTRICT,
    application_status VARCHAR(20) CHECK (application_status IN ('pending', 'approved', 'disapproved', 'qualified', 'not_qualified')),
    year_level VARCHAR(20),
    course VARCHAR(100),
    training_status VARCHAR(20) CHECK (training_status IN ('not_started', 'in_progress', 'completed', 'failed')),
    address TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    assigned_instrument VARCHAR(100),
    assigned_voice VARCHAR(50),
    scholarship_percentage DECIMAL(5,2) CHECK (scholarship_percentage >= 0 AND scholarship_percentage <= 100),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add director_id FK constraint to talent_groups now that users table exists
ALTER TABLE talent_groups 
    ADD CONSTRAINT fk_talent_group_director 
    FOREIGN KEY (director_id) REFERENCES users(id) ON DELETE SET NULL;

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_talent_group_id ON users(talent_group_id);

-- ----------------------------------------------------------------------------
-- APPLICATIONS: Scholarship application submissions
-- ----------------------------------------------------------------------------
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id) ON DELETE RESTRICT,
    experience TEXT,
    motivation TEXT,
    documents TEXT[], -- Array of document URLs/paths
    personal_info JSONB, -- Flexible JSON for talent-specific fields
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disapproved')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for applications
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_talent_group_id ON applications(talent_group_id);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- ----------------------------------------------------------------------------
-- INTERVIEW_SCHEDULES: Interview scheduling for applicants
-- ----------------------------------------------------------------------------
CREATE TABLE interview_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    google_calendar_event_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for interview_schedules
CREATE INDEX idx_interview_application_id ON interview_schedules(application_id);
CREATE INDEX idx_interview_date ON interview_schedules(date);
CREATE INDEX idx_interview_status ON interview_schedules(status);

-- ----------------------------------------------------------------------------
-- TRAINING_RECORDS: Training progress tracking for scholars
-- ----------------------------------------------------------------------------
CREATE TABLE training_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id) ON DELETE RESTRICT,
    overall_progress DECIMAL(5,2) DEFAULT 0.0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
    evaluation VARCHAR(20) CHECK (evaluation IN ('qualified', 'not_qualified', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for training_records
CREATE INDEX idx_training_user_id ON training_records(user_id);
CREATE INDEX idx_training_talent_group_id ON training_records(talent_group_id);
CREATE INDEX idx_training_evaluation ON training_records(evaluation);

-- ----------------------------------------------------------------------------
-- PRACTICE_SESSIONS: Individual practice session records
-- ----------------------------------------------------------------------------
CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_record_id UUID NOT NULL REFERENCES training_records(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    attended BOOLEAN NOT NULL DEFAULT FALSE,
    duration INTEGER, -- Duration in minutes
    activities TEXT[], -- Array of activity descriptions
    techniques TEXT[], -- Array of techniques practiced
    chapters_completed INTEGER DEFAULT 0,
    total_chapters INTEGER DEFAULT 0,
    performance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for practice_sessions
CREATE INDEX idx_practice_training_id ON practice_sessions(training_record_id);
CREATE INDEX idx_practice_date ON practice_sessions(date DESC);

-- ----------------------------------------------------------------------------
-- EVALUATIONS: Performance evaluations by directors
-- ----------------------------------------------------------------------------
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scholar_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id) ON DELETE RESTRICT,
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    evaluation_date DATE NOT NULL,
    -- Performance metrics (1-5 scale)
    skill_demonstration INTEGER CHECK (skill_demonstration >= 1 AND skill_demonstration <= 5),
    rehearsal_attendance INTEGER CHECK (rehearsal_attendance >= 1 AND rehearsal_attendance <= 5),
    event_participation INTEGER CHECK (event_participation >= 1 AND event_participation <= 5),
    teamwork INTEGER CHECK (teamwork >= 1 AND teamwork <= 5),
    leadership INTEGER CHECK (leadership >= 1 AND leadership <= 5),
    -- Qualitative feedback
    strengths TEXT,
    areas_for_improvement TEXT,
    overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    recommendation VARCHAR(20) CHECK (recommendation IN ('continue', 'probation', 'discontinue')),
    additional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for evaluations
CREATE INDEX idx_evaluations_scholar_id ON evaluations(scholar_id);
CREATE INDEX idx_evaluations_evaluator_id ON evaluations(evaluator_id);
CREATE INDEX idx_evaluations_semester ON evaluations(semester, academic_year);
CREATE INDEX idx_evaluations_date ON evaluations(evaluation_date DESC);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS: User notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('interview', 'acceptance', 'evaluation', 'general', 'application', 'engagement', 'inventory', 'attendance', 'document', 'instrument', 'endorsement', 'request')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(500),
    related_id UUID, -- ID of related entity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ----------------------------------------------------------------------------
-- INVENTORY_ITEMS: Uniform, instrument, and accessory tracking
-- ----------------------------------------------------------------------------
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id) ON DELETE RESTRICT,
    item_name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('uniform', 'instrument', 'accessory')),
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')),
    assigned_date DATE,
    borrowed_date DATE,
    return_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('borrowed', 'returned', 'lost', 'damaged', 'assigned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for inventory_items
CREATE INDEX idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_status ON inventory_items(status);
CREATE INDEX idx_inventory_talent_group_id ON inventory_items(talent_group_id);
CREATE INDEX idx_inventory_type ON inventory_items(type);

-- ----------------------------------------------------------------------------
-- SCHOLARSHIP_RENEWALS: Scholarship renewal requests
-- ----------------------------------------------------------------------------
CREATE TABLE scholarship_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    gpa DECIMAL(3,2) NOT NULL CHECK (gpa >= 0.0 AND gpa <= 4.0),
    documents TEXT[], -- Array of document URLs/paths
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for scholarship_renewals
CREATE INDEX idx_renewals_user_id ON scholarship_renewals(user_id);
CREATE INDEX idx_renewals_status ON scholarship_renewals(status);
CREATE INDEX idx_renewals_year ON scholarship_renewals(year, semester);
CREATE INDEX idx_renewals_submitted_at ON scholarship_renewals(submitted_at DESC);

-- ----------------------------------------------------------------------------
-- BENEFITS: Scholarship benefits (stipends, allowances, privileges)
-- ----------------------------------------------------------------------------
CREATE TABLE benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('stipend', 'allowance', 'privilege', 'discount')),
    amount DECIMAL(10,2), -- Optional monetary amount
    description TEXT NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'semester', 'annual', 'one-time')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for benefits
CREATE INDEX idx_benefits_status ON benefits(status);
CREATE INDEX idx_benefits_type ON benefits(type);

-- ----------------------------------------------------------------------------
-- EVENTS: Events, performances, rehearsals, competitions
-- ----------------------------------------------------------------------------
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('performance', 'rehearsal', 'workshop', 'competition')),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    attachment VARCHAR(500), -- URL to formality document
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX idx_events_date ON events(date DESC);
CREATE INDEX idx_events_type ON events(type);

-- ----------------------------------------------------------------------------
-- ANNOUNCEMENTS: Public announcements
-- ----------------------------------------------------------------------------
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    target_audience VARCHAR(20) NOT NULL CHECK (target_audience IN ('all', 'students', 'scholars')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for announcements
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC);
CREATE INDEX idx_announcements_priority ON announcements(priority);

-- ----------------------------------------------------------------------------
-- ENGAGEMENT_REQUESTS: External event engagement requests
-- ----------------------------------------------------------------------------
CREATE TABLE engagement_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    attachment VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for engagement_requests
CREATE INDEX idx_engagement_talent_group_id ON engagement_requests(talent_group_id);
CREATE INDEX idx_engagement_status ON engagement_requests(status);
CREATE INDEX idx_engagement_date ON engagement_requests(date DESC);

-- ----------------------------------------------------------------------------
-- ATTENDANCE_RECORDS: Attendance tracking for engagements/rehearsals
-- ----------------------------------------------------------------------------
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagement_requests(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    no_practice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for attendance_records
CREATE INDEX idx_attendance_engagement_id ON attendance_records(engagement_id);
CREATE INDEX idx_attendance_date ON attendance_records(date DESC);

-- ----------------------------------------------------------------------------
-- ATTENDANCE_ENTRIES: Individual user attendance entries
-- ----------------------------------------------------------------------------
CREATE TABLE attendance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_record_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status BOOLEAN NOT NULL, -- TRUE = present, FALSE = absent
    timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for attendance_entries
CREATE INDEX idx_attendance_entries_record_id ON attendance_entries(attendance_record_id);
CREATE INDEX idx_attendance_entries_user_id ON attendance_entries(user_id);

-- ============================================================================
-- JUNCTION TABLES (Many-to-Many Relationships)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USER_BENEFITS: Associates users with benefits (M:N)
-- ----------------------------------------------------------------------------
CREATE TABLE user_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    benefit_id UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_benefit UNIQUE (user_id, benefit_id)
);

-- Indexes for user_benefits
CREATE INDEX idx_user_benefits_user_id ON user_benefits(user_id);
CREATE INDEX idx_user_benefits_benefit_id ON user_benefits(benefit_id);

-- ----------------------------------------------------------------------------
-- EVENT_TALENT_GROUPS: Associates events with talent groups (M:N)
-- ----------------------------------------------------------------------------
CREATE TABLE event_talent_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_event_talent_group UNIQUE (event_id, talent_group_id)
);

-- Indexes for event_talent_groups
CREATE INDEX idx_event_tg_event_id ON event_talent_groups(event_id);
CREATE INDEX idx_event_tg_talent_id ON event_talent_groups(talent_group_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talent_groups_updated_at BEFORE UPDATE ON talent_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_schedules_updated_at BEFORE UPDATE ON interview_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_records_updated_at BEFORE UPDATE ON training_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholarship_renewals_updated_at BEFORE UPDATE ON scholarship_renewals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benefits_updated_at BEFORE UPDATE ON benefits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagement_requests_updated_at BEFORE UPDATE ON engagement_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Note: Enable RLS and create policies based on your security requirements
-- Example policies are provided below (commented out)

-- Enable RLS on all tables
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
-- etc...

-- Example RLS policy: Users can only view their own applications
-- CREATE POLICY applications_select_own ON applications
--     FOR SELECT
--     USING (auth.uid() = user_id OR auth.jwt() ->> 'role' IN ('admin', 'director'));

-- Example RLS policy: Only admins can insert users
-- CREATE POLICY users_insert_admin ON users
--     FOR INSERT
--     WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- COMMENTS ON TABLES AND COLUMNS
-- ============================================================================

COMMENT ON TABLE users IS 'Central user table for students, scholars, admins, and directors';
COMMENT ON TABLE applications IS 'Scholarship application submissions';
COMMENT ON TABLE training_records IS 'Training progress tracking for scholars';
COMMENT ON TABLE evaluations IS 'Performance evaluations by directors';
COMMENT ON TABLE notifications IS 'User notifications for various events';
COMMENT ON TABLE inventory_items IS 'Tracking of uniforms, instruments, and accessories';
COMMENT ON TABLE scholarship_renewals IS 'Scholarship renewal requests';
COMMENT ON TABLE benefits IS 'Scholarship benefits (stipends, allowances, etc.)';
COMMENT ON TABLE events IS 'Events, performances, rehearsals, competitions';
COMMENT ON TABLE announcements IS 'Public announcements to students and scholars';
COMMENT ON TABLE engagement_requests IS 'External event engagement requests';
COMMENT ON TABLE attendance_records IS 'Attendance tracking for engagements';
COMMENT ON TABLE user_benefits IS 'Junction table associating users with benefits';
COMMENT ON TABLE event_talent_groups IS 'Junction table associating events with talent groups';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
