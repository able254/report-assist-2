-- Create an ENUM type for user roles to ensure data consistency
CREATE TYPE user_role AS ENUM ('CITIZEN', 'TRIAGE_OFFICER', 'ASSIGNED_OFFICER');

-- Create an ENUM type for report status
CREATE TYPE report_status AS ENUM ('PENDING', 'ASSIGNED', 'CLOSED');

-- Users Table: Stores information about all system users
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL, -- For login
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    badge_id VARCHAR(50), -- UNIQUE for officers, NULL for citizens
    contact_info VARCHAR(255), -- For citizens
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_badge_id UNIQUE (badge_id)
);

-- Reports Table: Stores the core information for each submitted report
CREATE TABLE Reports (
    report_id SERIAL PRIMARY KEY,
    citizen_id INT NOT NULL,
    case_number VARCHAR(20) UNIQUE, -- Format: OB-YYYY-XXXXX
    status report_status NOT NULL DEFAULT 'PENDING',
    chat_transcript TEXT NOT NULL,
    triage_officer_id INT,
    assigned_officer_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES Users(user_id),
    FOREIGN KEY (triage_officer_id) REFERENCES Users(user_id),
    FOREIGN KEY (assigned_officer_id) REFERENCES Users(user_id)
);

-- Evidence Table: Stores metadata about uploaded files related to a report
CREATE TABLE Evidence (
    evidence_id SERIAL PRIMARY KEY,
    report_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- e.g., 'image/jpeg', 'video/mp4'
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES Reports(report_id) ON DELETE CASCADE
);

-- Create indexes for faster lookups on foreign keys and frequently queried columns
CREATE INDEX idx_reports_status ON Reports(status);
CREATE INDEX idx_reports_assigned_officer ON Reports(assigned_officer_id);
CREATE INDEX idx_users_role ON Users(role);
