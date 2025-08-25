// Social features types for multi-user platform

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  university?: string;
  major?: string;
  graduation_year?: number;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface FriendConnection {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface ApplicationComment {
  id: string;
  cv_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  // Extended fields for display
  user_profile?: UserProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  from_user_id?: string;
  type: 'friend_request' | 'interview_update' | 'comment' | 'application_status';
  title: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
  // Extended fields for display
  from_user_profile?: UserProfile;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  action_type: 'applied' | 'interview_scheduled' | 'interview_completed' | 'accepted' | 'rejected';
  cv_id?: string;
  details?: any;
  created_at: string;
  // Extended fields for display
  user_profile?: UserProfile;
  cv?: EnhancedCV;
}

export interface EnhancedCV {
  id: string;
  user_id: string;
  title: string;
  job_title?: string;
  company?: string;
  status: 'draft' | 'applied' | 'interview' | 'accepted' | 'rejected';
  created_at: string;
  ats_score?: number;
  ai_score?: number;
  job_link?: string;
  job_description?: string;
  cv_data?: any;
  // New social fields
  is_public: boolean;
  allow_comments: boolean;
  interview_date?: string;
  interview_type?: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'final';
  interview_status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  interview_notes?: string;
  // Extended fields for display
  user_profile?: UserProfile;
  comments?: ApplicationComment[];
  comment_count?: number;
}

export interface FriendRequest {
  id: string;
  from_user: UserProfile;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface SocialStats {
  total_friends: number;
  pending_requests: number;
  unread_notifications: number;
  public_applications: number;
  interviews_scheduled: number;
  interviews_completed: number;
  accepted_offers: number;
}

export interface SearchFilters {
  university?: string;
  major?: string;
  graduation_year?: number;
  location?: string;
  status?: string;
  company?: string;
  interview_type?: string;
}

export interface PublicApplicationFeed {
  applications: EnhancedCV[];
  total_count: number;
  has_more: boolean;
  filters: SearchFilters;
}
