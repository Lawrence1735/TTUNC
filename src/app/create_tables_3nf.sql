TABLE event_talent_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, talent_group_id)
);

-- ============================================================================
-- ENGAGEMENT PROCESS TABLES
-- ============================================================================

-- ENGAGEMENT_REQUESTS
CREATE TABLE engagement_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_group_id UUID NOT NULL REFERENCES talent_groups(id),
    event_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    description TEXT,
    requester_name VARCHAR(255),
    requester_organization VARCHAR(255),
    requester_contact VARCHAR(100),
    requester_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ENGAGEMENT_ATTACHMENTS (Decomposed from engagement_requests - 1NF)
CREATE TABLE engagement_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagement_requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ATTENDANCE PROCESS TABLES
-- ============================================================================

-- ATTENDANCE_RECORDS
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES engagement_requests(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    no_practice BOOLEAN DEFAULT FALSE,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ATTENDANCE_ENTRIES
CREATE TABLE attendance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_record_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status BOOLEAN NOT NULL,
    timestamp TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ANNOUNCEMENT PROCESS TABLES
-- ============================================================================

-- ANNOUNCEMENTS
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    published_at TIMESTAMP DEFAULT NOW(),
    priority VARCHAR(20) NOT NULL,
    target_audience VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ANNOUNCEMENT_ATTACHMENTS (Decomposed attachments)
CREATE TABLE announcement_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATION PROCESS TABLES
-- ============================================================================

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATION_APPLICATIONS (Specific notification relations)
CREATE TABLE notification_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(notification_id, application_id)
);

-- NOTIFICATION_EVALUATIONS
CREATE TABLE notification_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(notification_id, evaluation_id)
);

-- NOTIFICATION_EVENTS
CREATE TABLE notification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(notification_id, event_id)
);

-- ============================================================================
-- AUDIT LOG TABLES (Additional process tracking)
-- ============================================================================

-- AUDIT_LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM CONFIGURATION TABLES
-- ============================================================================

-- SYSTEM_SETTINGS
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- EMAIL_TEMPLATES
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_talent_group_id ON users(talent_group_id);
CREATE INDEX idx_users_student_id ON users(student_id);

-- Application process indexes
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_application_documents_application_id ON application_documents(application_id);

-- Training process indexes
CREATE INDEX idx_training_user_id ON training_records(user_id);
CREATE INDEX idx_practice_training_id ON practice_sessions(training_record_id);
CREATE INDEX idx_practice_activities_session_id ON practice_activities(practice_session_id);
CREATE INDEX idx_practice_techniques_session_id ON practice_techniques(practice_session_id);

-- Evaluation process indexes
CREATE INDEX idx_evaluations_scholar_id ON evaluations(scholar_id);
CREATE INDEX idx_evaluations_evaluator_id ON evaluations(evaluator_id);
CREATE INDEX idx_evaluation_strengths_evaluation_id ON evaluation_strengths(evaluation_id);
CREATE INDEX idx_evaluation_improvements_evaluation_id ON evaluation_improvements(evaluation_id);

-- Scholarship process indexes
CREATE INDEX idx_renewals_user_id ON scholarship_renewals(user_id);
CREATE INDEX idx_renewals_status ON scholarship_renewals(status);
CREATE INDEX idx_renewal_documents_renewal_id ON scholarship_renewal_documents(renewal_id);

-- Inventory process indexes
CREATE INDEX idx_inventory_talent_group_id ON inventory_items(talent_group_id);
CREATE INDEX idx_inventory_assignments_item_id ON inventory_assignments(inventory_item_id);
CREATE INDEX idx_inventory_assignments_user_id ON inventory_assignments(user_id);

-- Event process indexes
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_event_attachments_event_id ON event_attachments(event_id);
CREATE INDEX idx_event_talent_groups_event_id ON event_talent_groups(event_id);

-- Engagement process indexes
CREATE INDEX idx_engagement_talent_group_id ON engagement_requests(talent_group_id);
CREATE INDEX idx_engagement_attachments_engagement_id ON engagement_attachments(engagement_id);

-- Attendance process indexes
CREATE INDEX idx_attendance_records_engagement_id ON attendance_records(engagement_id);
CREATE INDEX idx_attendance_entries_record_id ON attendance_entries(attendance_record_id);
CREATE INDEX idx_attendance_entries_user_id ON attendance_entries(user_id);

-- Notification process indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Audit indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- END OF 3NF SCHEMA
-- Total Tables: 44 (All processes fully normalized)
-- ============================================================================
