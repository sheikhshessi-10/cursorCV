-- 🚀 Migration Script: Convert cvs table to applications table
-- Run this AFTER running the main setup_database.sql

-- Step 1: Create the new applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200),
    position VARCHAR(200),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'interviewing', 'accepted', 'rejected')),
    job_description TEXT,
    cv_content TEXT,
    cv_data JSONB,
    is_public BOOLEAN DEFAULT true,
    allow_comments BOOLEAN DEFAULT true,
    interview_date DATE,
    interview_type VARCHAR(100),
    interview_status VARCHAR(100),
    interview_notes TEXT,
    application_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Migrate data from cvs to applications (if cvs table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cvs') THEN
        -- Copy data from cvs to applications
        INSERT INTO applications (
            id, user_id, title, company, position, status, 
            job_description, cv_content, cv_data, is_public, 
            allow_comments, interview_date, interview_type, 
            interview_status, interview_notes, created_at, updated_at
        )
        SELECT 
            id, user_id, title, company, position, 
            CASE 
                WHEN status = 'draft' THEN 'pending'
                ELSE status
            END as status,
            job_description, cv_content, cv_data, 
            COALESCE(is_public, false), allow_comments, 
            interview_date, interview_type, interview_status, 
            interview_notes, created_at, updated_at
        FROM cvs
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Migrated % rows from cvs to applications', (SELECT COUNT(*) FROM cvs);
    ELSE
        RAISE NOTICE 'cvs table does not exist, skipping migration';
    END IF;
END $$;

-- Step 3: Create indexes for applications table
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_is_public ON applications(is_public);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);
CREATE INDEX IF NOT EXISTS idx_applications_position ON applications(position);

-- Step 4: Create updated_at trigger for applications
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Enable RLS on applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for applications
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public applications" ON applications;
CREATE POLICY "Users can view public applications" ON applications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own applications" ON applications;
CREATE POLICY "Users can insert their own applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
CREATE POLICY "Users can update their own applications" ON applications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own applications" ON applications;
CREATE POLICY "Users can delete their own applications" ON applications
    FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Update application_comments table to reference applications
ALTER TABLE application_comments 
    DROP CONSTRAINT IF EXISTS application_comments_cv_id_fkey;

ALTER TABLE application_comments 
    ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE CASCADE;

-- Step 8: Create missing user profiles for existing users
SELECT create_missing_user_profiles();

-- Step 9: Success message
SELECT '🎉 Migration completed successfully! Your database now uses the applications table.' as message;
