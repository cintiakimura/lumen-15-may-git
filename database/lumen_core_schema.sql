-- Lumen core schema (PostgreSQL) — Render / production-oriented
-- TIMESTAMPTZ + NOW(); requires gen_random_uuid() (PostgreSQL 13+ or pgcrypto).

-- Users & Roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'teacher', 'learner')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL,
    estimated_minutes INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Blocks
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,           -- video, slides, infographic, podcast, simulation, text
    content JSONB NOT NULL,
    order_index INT NOT NULL
);

-- Course Assignments
CREATE TABLE course_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    student_id UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(course_id, student_id)
);

-- Module Progress & Mastery
CREATE TABLE module_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id),
    student_id UUID REFERENCES users(id),
    mastery_score DECIMAL(5,2) DEFAULT 0.0,   -- 0 to 100
    status VARCHAR(20) DEFAULT 'in_progress',
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, student_id)
);

-- Grok Interactions (for history & debugging)
CREATE TABLE grok_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id),
    student_id UUID REFERENCES users(id),
    interaction_type VARCHAR(50),
    user_response TEXT,
    grok_evaluation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes (recommended; idempotent re-run)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_modules_course_id_order ON modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_content_blocks_module_id_order ON content_blocks(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_assignments_student_id ON course_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_course_id ON course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_student_id ON module_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_module_id ON module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_grok_interactions_module_student_created ON grok_interactions(module_id, student_id, created_at DESC);
