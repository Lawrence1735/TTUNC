-- ============================================================================
-- TalentTrackUNC - CREATE TABLES ONLY
-- Database Schema Creation (PostgreSQL/Supabase)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TRAINING_RECORDS
CREATE TABLE training_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id),
    overall_progress DECIMAL(5,2) DEFAULT 0,
    evaluation VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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

-- USER_BENEFITS (Junction Table)
CREATE TABLE user_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    benefit_id UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, benefit_id)
);

-- EVENT_TALENT_GROUPS (Junction Table)
CREATE TABLE event_talent_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, talent_group_id)
);

-- ============================================================================
-- CREATE INDEXES
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
-- END OF SCHEMA
-- ============================================================================
