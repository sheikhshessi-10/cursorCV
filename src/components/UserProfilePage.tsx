import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, GraduationCap, BookOpen, Calendar, CheckCircle, XCircle, Clock, User, UserPlus, UserCheck, UserX, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  university: string;
  major: string;
  graduation_year: number;
  created_at: string;
}

interface Application {
  id: string;
  user_id: string;
  position: string;
  company: string;
  status: 'pending' | 'accepted' | 'rejected' | 'interviewing';
  cv_content: string;
  created_at: string;
  updated_at: string;
}

interface FriendConnection {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [friendConnection, setFriendConnection] = useState<FriendConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [addingApplication, setAddingApplication] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserApplications();
      if (currentUser?.id && userId !== currentUser.id) {
        fetchFriendConnection();
      }
    }
  }, [userId, currentUser?.id]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendConnection = async () => {
    if (!currentUser?.id || !userId) return;
    
    try {
      // Check both directions: sent and received requests
      const { data, error } = await supabase
        .from('friend_connections')
        .select('*')
        .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`);

      if (error) {
        console.error('Error fetching friend connections:', error);
        return;
      }

      // Find the connection that involves both users
      const connection = data?.find(conn => 
        (conn.user_id === currentUser.id && conn.friend_id === userId) ||
        (conn.user_id === userId && conn.friend_id === currentUser.id)
      );
      
      setFriendConnection(connection || null);
    } catch (error) {
      console.error('Error fetching friend connection:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!currentUser?.id || !userId || friendActionLoading) return;
    
    setFriendActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('friend_connections')
        .insert({
          user_id: currentUser.id,
          friend_id: userId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending friend request:', error);
        return;
      }

      setFriendConnection(data);
      
      // Create notification for the friend
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'friend_request',
          title: 'New Friend Request',
          message: `${userProfile?.display_name || 'Someone'} sent you a friend request`,
          related_id: data.id
        });
        
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const acceptFriendRequest = async () => {
    if (!friendConnection || friendActionLoading) return;
    
    setFriendActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('friend_connections')
        .update({ status: 'accepted' })
        .eq('id', friendConnection.id)
        .select()
        .single();

      if (error) {
        console.error('Error accepting friend request:', error);
        return;
      }

      setFriendConnection(data);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const rejectFriendRequest = async () => {
    if (!friendConnection || friendActionLoading) return;
    
    setFriendActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('friend_connections')
        .update({ status: 'rejected' })
        .eq('id', friendConnection.id)
        .select()
        .single();

      if (error) {
        console.error('Error rejecting friend request:', error);
        return;
      }

      setFriendConnection(data);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const removeFriend = async () => {
    if (!friendConnection || friendActionLoading) return;
    
    setFriendActionLoading(true);
    try {
      const { error } = await supabase
        .from('friend_connections')
        .delete()
        .eq('id', friendConnection.id);

      if (error) {
        console.error('Error removing friend:', error);
        return;
      }

      setFriendConnection(null);
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleQuickAdd = async (application: Application, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening the modal when clicking the button
    
    if (!currentUser) {
      toast.error('You must be logged in to add applications');
      return;
    }

    setAddingApplication(application.id);
    
    try {
      // Create a new application for the current user based on the selected application
      const newApplication = {
        id: crypto.randomUUID(),
        title: application.title || `${application.position || 'Position'} at ${application.company || 'Company'}` || 'New Application',
        company: application.company || '',
        position: application.position || '',
        status: 'copied', // Mark as copied when quick adding from another user
        job_description: application.job_description || '',
        cv_content: application.cv_content || '',
        cv_data: application.cv_data || {},
        is_public: true,
        allow_comments: true,
        interview_date: null, // Don't copy interview details
        interview_type: null,
        interview_status: null,
        interview_notes: null,
        application_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: currentUser.id
      };

      console.log('Creating application:', newApplication);

      const { data, error } = await supabase
        .from('applications')
        .insert([newApplication])
        .select()
        .single();

      if (error) {
        console.error('Error adding application:', error);
        toast.error(`Failed to add application: ${error.message}`);
      } else {
        console.log('Application created successfully:', data);
        toast.success('Application added to your dashboard!');
      }
    } catch (error) {
      console.error('Error adding application:', error);
      toast.error('Failed to add application');
    } finally {
      setAddingApplication(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'interviewing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'interviewing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Interviewing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Pending</Badge>;
    }
  };

  const renderFriendActionButton = () => {
    if (!currentUser?.id || !userId || currentUser.id === userId) {
      return null; // Don't show friend actions for yourself
    }

    if (!friendConnection) {
      return (
        <Button 
          onClick={sendFriendRequest}
          disabled={friendActionLoading}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {friendActionLoading ? 'Sending...' : 'Send Friend Request'}
        </Button>
      );
    }

    const isCurrentUserSender = friendConnection.user_id === currentUser.id;
    const isCurrentUserReceiver = friendConnection.friend_id === currentUser.id;

    switch (friendConnection.status) {
      case 'pending':
        if (isCurrentUserSender) {
          return (
            <Button variant="outline" disabled className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Request Sent
            </Button>
          );
        } else if (isCurrentUserReceiver) {
          return (
            <div className="flex gap-2">
              <Button 
                onClick={acceptFriendRequest}
                disabled={friendActionLoading}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Accept
              </Button>
              <Button 
                variant="outline"
                onClick={rejectFriendRequest}
                disabled={friendActionLoading}
                className="flex items-center gap-2"
              >
                <UserX className="h-4 w-4" />
                Reject
              </Button>
            </div>
          );
        }
        break;
      case 'accepted':
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Friends
            </Button>
            <Button 
              variant="outline"
              onClick={removeFriend}
              disabled={friendActionLoading}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          </div>
        );
      case 'rejected':
        if (isCurrentUserSender) {
          return (
            <Button 
              onClick={sendFriendRequest}
              disabled={friendActionLoading}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Send Request Again
            </Button>
          );
        }
        break;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">This user profile doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">View profile and applications</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* User Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-2xl">
                  {userProfile.display_name?.charAt(0) || userProfile.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {userProfile.display_name || userProfile.username || 'Anonymous User'}
                </h2>
                <p className="text-gray-600">@{userProfile.username || 'no-username'}</p>
              </div>
            </CardTitle>
            {renderFriendActionButton()}
          </div>
        </CardHeader>
        <CardContent>
          {userProfile.bio && (
            <p className="text-gray-700 mb-4">{userProfile.bio}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {userProfile.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{userProfile.location}</span>
              </div>
            )}
            {userProfile.university && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>{userProfile.university}</span>
              </div>
            )}
            {userProfile.major && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{userProfile.major}</span>
              </div>
            )}
            {userProfile.graduation_year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Class of {userProfile.graduation_year}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Applications ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found for this user.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {applications.map((application) => (
                <Card 
                  key={application.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleApplicationClick(application)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {application.position || 'Software Engineer'}
                          </h3>
                          {getStatusIcon(application.status)}
                          {getStatusBadge(application.status)}
                        </div>
                        {application.company && (
                          <p className="text-gray-600 text-sm mb-2">
                            Company: {application.company}
                          </p>
                        )}
                        {application.cv_content && (
                          <p className="text-gray-700 text-sm line-clamp-2">
                            {application.cv_content.substring(0, 150)}...
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                          {application.updated_at !== application.created_at && (
                            <span>Updated: {new Date(application.updated_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Add Button */}
                      {currentUser && currentUser.id !== userId && (
                        <div className="ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleQuickAdd(application, e)}
                            disabled={addingApplication === application.id}
                            className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4" />
                            {addingApplication === application.id ? 'Adding...' : 'Quick Add'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Application Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApplicationModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-lg font-semibold">{selectedApplication.position || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-lg">{selectedApplication.company || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedApplication.status)}
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Application Date</label>
                  <p className="text-sm">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Job Description */}
              {selectedApplication.job_description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Job Description</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.job_description}</p>
                  </div>
                </div>
              )}

              {/* CV Content */}
              {selectedApplication.cv_content && (
                <div>
                  <label className="text-sm font-medium text-gray-500">CV Content</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.cv_content}</p>
                  </div>
                </div>
              )}

              {/* Interview Details */}
              {(selectedApplication.interview_date || selectedApplication.interview_type || selectedApplication.interview_status) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Interview Details</label>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedApplication.interview_date && (
                      <div>
                        <label className="text-xs text-gray-500">Interview Date</label>
                        <p className="text-sm">{new Date(selectedApplication.interview_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedApplication.interview_type && (
                      <div>
                        <label className="text-xs text-gray-500">Interview Type</label>
                        <p className="text-sm">{selectedApplication.interview_type}</p>
                      </div>
                    )}
                    {selectedApplication.interview_status && (
                      <div>
                        <label className="text-xs text-gray-500">Interview Status</label>
                        <p className="text-sm">{selectedApplication.interview_status}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interview Notes */}
              {selectedApplication.interview_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Interview Notes</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.interview_notes}</p>
                  </div>
                </div>
              )}

              {/* Application Date */}
              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Created: {new Date(selectedApplication.created_at).toLocaleString()}</p>
                {selectedApplication.updated_at !== selectedApplication.created_at && (
                  <p>Last Updated: {new Date(selectedApplication.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
