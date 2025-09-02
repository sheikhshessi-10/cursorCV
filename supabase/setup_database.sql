-- 🚀 Smart CV Builder - Multi-User Social Platform Database Setup
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    university VARCHAR(100),
    major VARCHAR(100),
    graduation_year INTEGER,
    location VARCHAR(100),
    linkedin_url TEXT,
    github_url TEXT,
    website_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enhanced CVs Table
CREATE TABLE IF NOT EXISTS cvs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200),
    position VARCHAR(200),
    status VARCHAR(50) DEFAULT 'draft',
    job_description TEXT,
    cv_content TEXT,
    cv_data JSONB,
    is_public BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT true,
    interview_date DATE,
    interview_type VARCHAR(100),
    interview_status VARCHAR(100),
    interview_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Friend Connections Table
CREATE TABLE IF NOT EXISTS friend_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 4. Application Comments Table
CREATE TABLE IF NOT EXISTS application_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Activity Feed Table
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_public ON user_profiles(is_public);

CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_status ON cvs(status);
CREATE INDEX IF NOT EXISTS idx_cvs_is_public ON cvs(is_public);
CREATE INDEX IF NOT EXISTS idx_cvs_company ON cvs(company);
CREATE INDEX IF NOT EXISTS idx_cvs_position ON cvs(position);

CREATE INDEX IF NOT EXISTS idx_friend_connections_user_id ON friend_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_connections_friend_id ON friend_connections(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_connections_status ON friend_connections(status);

CREATE INDEX IF NOT EXISTS idx_application_comments_cv_id ON application_comments(cv_id);
CREATE INDEX IF NOT EXISTS idx_application_comments_user_id ON application_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at);

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cvs_updated_at ON cvs;
CREATE TRIGGER update_cvs_updated_at 
    BEFORE UPDATE ON cvs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_friend_connections_updated_at ON friend_connections;
CREATE TRIGGER update_friend_connections_updated_at 
    BEFORE UPDATE ON friend_connections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_application_comments_updated_at ON application_comments;
CREATE TRIGGER update_application_comments_updated_at 
    BEFORE UPDATE ON application_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public profiles" ON user_profiles;
CREATE POLICY "Users can view public profiles" ON user_profiles
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cvs
DROP POLICY IF EXISTS "Users can view their own CVs" ON cvs;
CREATE POLICY "Users can view their own CVs" ON cvs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public CVs" ON cvs;
CREATE POLICY "Users can view public CVs" ON cvs
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert their own CVs" ON cvs;
CREATE POLICY "Users can insert their own CVs" ON cvs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own CVs" ON cvs;
CREATE POLICY "Users can update their own CVs" ON cvs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own CVs" ON cvs;
CREATE POLICY "Users can delete their own CVs" ON cvs
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for friend_connections
DROP POLICY IF EXISTS "Users can view their own connections" ON friend_connections;
CREATE POLICY "Users can view their own connections" ON friend_connections
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can insert friend requests" ON friend_connections;
CREATE POLICY "Users can insert friend requests" ON friend_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own connections" ON friend_connections;
CREATE POLICY "Users can update their own connections" ON friend_connections
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can delete their own connections" ON friend_connections;
CREATE POLICY "Users can delete their own connections" ON friend_connections
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for application_comments
DROP POLICY IF EXISTS "Users can view comments on public CVs" ON application_comments;
CREATE POLICY "Users can view comments on public CVs" ON application_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cvs 
            WHERE cvs.id = application_comments.cv_id 
            AND (cvs.is_public = true OR cvs.user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can insert comments on public CVs" ON application_comments;
CREATE POLICY "Users can insert comments on public CVs" ON application_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cvs 
            WHERE cvs.id = application_comments.cv_id 
            AND cvs.is_public = true
        )
    );

DROP POLICY IF EXISTS "Users can update their own comments" ON application_comments;
CREATE POLICY "Users can update their own comments" ON application_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON application_comments;
CREATE POLICY "Users can delete their own comments" ON application_comments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
CREATE POLICY "Users can insert their own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for activity_feed
DROP POLICY IF EXISTS "Users can view public activity" ON activity_feed;
CREATE POLICY "Users can view public activity" ON activity_feed
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = activity_feed.user_id 
            AND user_profiles.is_public = true
        )
    );

DROP POLICY IF EXISTS "Users can insert their own activity" ON activity_feed;
CREATE POLICY "Users can insert their own activity" ON activity_feed
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, username, display_name, is_public)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to notify friends when someone applies to an internship
CREATE OR REPLACE FUNCTION public.notify_friends_on_application()
RETURNS trigger AS $$
BEGIN
    -- Only notify if this is a new application (INSERT) or status changed to 'accepted'/'rejected'/'interviewing'
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('accepted', 'rejected', 'interviewing')) THEN
        -- Insert notifications for all accepted friends
        INSERT INTO public.notifications (user_id, type, title, message, related_id)
        SELECT 
            fc.user_id,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'friend_application'
                WHEN NEW.status = 'accepted' THEN 'friend_accepted'
                WHEN NEW.status = 'rejected' THEN 'friend_rejected'
                WHEN NEW.status = 'interviewing' THEN 'friend_interviewing'
            END,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'New Application from Friend'
                WHEN NEW.status = 'accepted' THEN 'Friend Got Accepted!'
                WHEN NEW.status = 'rejected' THEN 'Friend Application Update'
                WHEN NEW.status = 'interviewing' THEN 'Friend Got an Interview!'
            END,
            CASE 
                WHEN TG_OP = 'INSERT' THEN up.display_name || ' applied for ' || COALESCE(NEW.position, 'a position') || ' at ' || COALESCE(NEW.company, 'a company')
                WHEN NEW.status = 'accepted' THEN up.display_name || ' got accepted for ' || COALESCE(NEW.position, 'a position') || ' at ' || COALESCE(NEW.company, 'a company') || '! 🎉'
                WHEN NEW.status = 'rejected' THEN up.display_name || ' was rejected for ' || COALESCE(NEW.position, 'a position') || ' at ' || COALESCE(NEW.company, 'a company')
                WHEN NEW.status = 'interviewing' THEN up.display_name || ' got an interview for ' || COALESCE(NEW.position, 'a position') || ' at ' || COALESCE(NEW.company, 'a company') || '! 🎯'
            END,
            NEW.id
        FROM friend_connections fc
        JOIN user_profiles up ON up.user_id = NEW.user_id
        WHERE fc.friend_id = NEW.user_id 
        AND fc.status = 'accepted'
        AND fc.user_id != NEW.user_id; -- Don't notify yourself
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to notify friends on application changes
DROP TRIGGER IF EXISTS notify_friends_on_application_trigger ON cvs;
CREATE TRIGGER notify_friends_on_application_trigger
    AFTER INSERT OR UPDATE ON cvs
    FOR EACH ROW EXECUTE FUNCTION public.notify_friends_on_application();

-- Success message
SELECT '🎉 Database setup completed successfully! Your multi-user social platform is ready!' as message; 