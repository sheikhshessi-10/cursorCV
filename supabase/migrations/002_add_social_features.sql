-- Add social features for multi-user platform

-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  location VARCHAR(100),
  university VARCHAR(100),
  major VARCHAR(100),
  graduation_year INTEGER,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friend connections table
CREATE TABLE friend_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enhance CVs table for social features
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT true;
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS interview_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS interview_type VARCHAR(50) CHECK (interview_type IN ('phone', 'video', 'onsite', 'technical', 'behavioral', 'final'));
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS interview_status VARCHAR(50) DEFAULT 'scheduled' CHECK (interview_status IN ('scheduled', 'completed', 'cancelled', 'rescheduled'));
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS interview_notes TEXT;

-- Create comments table for applications
CREATE TABLE application_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('friend_request', 'interview_update', 'comment', 'application_status')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- cv_id, comment_id, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity feed table
CREATE TABLE activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('applied', 'interview_scheduled', 'interview_completed', 'accepted', 'rejected')),
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for friend_connections
CREATE POLICY "Users can view their own connections" ON friend_connections
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can manage their own connections" ON friend_connections
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for application_comments
CREATE POLICY "Comments are viewable on public applications" ON application_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = application_comments.cv_id 
      AND cvs.is_public = true
    )
  );

CREATE POLICY "Users can comment on public applications" ON application_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cvs 
      WHERE cvs.id = application_comments.cv_id 
      AND cvs.is_public = true
      AND cvs.allow_comments = true
    )
  );

CREATE POLICY "Users can update their own comments" ON application_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for activity_feed
CREATE POLICY "Public activity is viewable by everyone" ON activity_feed
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = activity_feed.user_id 
      AND user_profiles.is_public = true
    )
  );

CREATE POLICY "Users can insert their own activity" ON activity_feed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_public ON user_profiles(is_public);
CREATE INDEX idx_friend_connections_users ON friend_connections(user_id, friend_id);
CREATE INDEX idx_friend_connections_status ON friend_connections(status);
CREATE INDEX idx_cvs_public ON cvs(is_public);
CREATE INDEX idx_cvs_user_public ON cvs(user_id, is_public);
CREATE INDEX idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- Create triggers for new tables using the existing function
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friend_connections_updated_at BEFORE UPDATE ON friend_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_comments_updated_at BEFORE UPDATE ON application_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
