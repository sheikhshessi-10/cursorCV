import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  MessageCircle,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { UserProfile, FriendConnection } from '@/types/social';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const FriendsSection = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<FriendConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendConnection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [user]);

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .eq('is_public', true)
        .neq('user_id', user.id) // Don't show current user
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          *,
          user_profiles!friend_id(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setFriends(data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchPendingRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friend_connections')
        .select(`
          *,
          user_profiles!user_id(*)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friend_connections')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Friend request sent!');
      
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.user_id !== friendId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('friend_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;
      toast.success('Friend request accepted!');
      fetchPendingRequests();
      fetchFriends();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('friend_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      toast.success('Friend request rejected');
      fetchPendingRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject friend request');
    }
  };

  const removeFriend = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('friend_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      toast.success('Friend removed');
      fetchFriends();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove friend');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Friends</h1>
          <p className="text-gray-600">Connect with other job seekers and stay updated on their progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Search & Results */}
          <div className="space-y-6">
            {/* Search Section */}
            <Card>
              <CardHeader>
                <CardTitle>Find Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search by name or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  />
                  <Button onClick={searchUsers} disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.map((userProfile) => (
                      <div key={userProfile.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={userProfile.avatar_url} />
                            <AvatarFallback>
                              {userProfile.display_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {userProfile.display_name}
                            </h4>
                            <p className="text-sm text-gray-600">@{userProfile.username}</p>
                            {userProfile.university && (
                              <p className="text-xs text-gray-500">
                                {userProfile.university} • {userProfile.major}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => sendFriendRequest(userProfile.user_id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Friend Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.user_profiles?.avatar_url} />
                            <AvatarFallback>
                              {request.user_profiles?.display_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {request.user_profiles?.display_name}
                            </h4>
                            <p className="text-sm text-gray-600">@{request.user_profiles?.username}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => acceptFriendRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectFriendRequest(request.id)}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Current Friends */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Your Friends ({friends.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No friends yet</p>
                    <p className="text-sm">Search for users to connect with them</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={friend.user_profiles?.avatar_url} />
                            <AvatarFallback>
                              {friend.user_profiles?.display_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {friend.user_profiles?.display_name}
                            </h4>
                            <p className="text-sm text-gray-600">@{friend.user_profiles?.username}</p>
                            {friend.user_profiles?.location && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {friend.user_profiles.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {/* Navigate to friend's profile */}}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFriend(friend.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
