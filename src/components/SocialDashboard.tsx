import React, { useState, useEffect } from 'react';
import { Search, Users, UserPlus, ArrowLeft, UserCheck, Clock, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

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

interface FriendConnection {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export function SocialDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [friendConnections, setFriendConnections] = useState<FriendConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAllUsers();
      fetchFriendConnections();
    }
  }, [user?.id]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user => 
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setAllUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendConnections = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('friend_connections')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .limit(100); // Add limit to prevent large queries

      if (error) {
        console.error('Error fetching friend connections:', error);
        return;
      }

      setFriendConnections(data || []);
    } catch (error) {
      console.error('Error fetching friend connections:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const handleConnectClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigate(`/user/${userId}`);
  };

  const getFriendStatus = (userId: string) => {
    if (!user?.id || user.id === userId) return null;
    
    const connection = friendConnections.find(conn => 
      (conn.user_id === user.id && conn.friend_id === userId) ||
      (conn.user_id === userId && conn.friend_id === user.id)
    );
    
    return connection?.status || null;
  };

  const renderFriendButton = (userId: string) => {
    if (!user?.id || user.id === userId) return null;
    
    const status = getFriendStatus(userId);
    
    switch (status) {
      case 'accepted':
        return (
          <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Friends
          </Button>
        );
      case 'pending':
        return (
          <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </Button>
        );
      case 'rejected':
        return (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Connect
          </Button>
        );
      default:
        return (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Connect
          </Button>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Hub</h1>
          <p className="text-gray-600 mt-2">Connect with other users and find friends</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by username or display name..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {searchQuery ? `Search Results (${filteredUsers.length})` : `All Users (${allUsers.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? 'No users found matching your search.' : 'No users have created profiles yet.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((userProfile) => (
                <Card 
                  key={userProfile.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleUserClick(userProfile.user_id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {userProfile.display_name?.charAt(0) || userProfile.username?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {userProfile.display_name || userProfile.username || 'Anonymous User'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              @{userProfile.username || 'no-username'}
                            </p>
                          </div>
                        </div>
                        {userProfile.bio && (
                          <p className="text-gray-700 mt-2 text-sm">{userProfile.bio}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                          {userProfile.location && (
                            <span>📍 {userProfile.location}</span>
                          )}
                          {userProfile.university && (
                            <span>🎓 {userProfile.university}</span>
                          )}
                          {userProfile.major && (
                            <span>📚 {userProfile.major}</span>
                          )}
                          {userProfile.graduation_year && (
                            <span>📅 {userProfile.graduation_year}</span>
                          )}
                        </div>
                      </div>
                      {renderFriendButton(userProfile.user_id) || (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => handleConnectClick(e, userProfile.user_id)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
