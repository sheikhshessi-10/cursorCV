import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Users, 
  MessageCircle, 
  Heart, 
  TrendingUp,
  Calendar,
  MapPin,
  GraduationCap,
  Building,
  Clock
} from 'lucide-react';
import { UserProfile, EnhancedCV, ApplicationComment } from '@/types/social';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FriendsSection } from './FriendsSection';

export const SocialDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [publicApplications, setPublicApplications] = useState<EnhancedCV[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPublicApplications();
      fetchActivityFeed();
    }
  }, [user]);

  const fetchPublicApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cvs')
        .select(`
          *,
          user_profiles!user_id(*)
        `)
        .eq('is_public', true)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPublicApplications(data || []);
    } catch (error) {
      console.error('Error fetching public applications:', error);
    }
  };

  const fetchActivityFeed = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user_profiles!user_id(*)
        `)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      setActivityFeed(data || []);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    }
  };

  const searchApplications = async () => {
    if (!searchQuery.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cvs')
        .select(`
          *,
          user_profiles!user_id(*)
        `)
        .eq('is_public', true)
        .neq('user_id', user.id)
        .or(`company.ilike.%${searchQuery}%,position.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublicApplications(data || []);
    } catch (error) {
      console.error('Error searching applications:', error);
      toast.error('Failed to search applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'applied':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return '✅';
      case 'pending':
      case 'applied':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Dashboard</h1>
          <p className="text-gray-600">Connect with friends and see their internship progress</p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Public Feed</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          {/* Public Applications Feed */}
          <TabsContent value="feed" className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search by company or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchApplications()}
                  />
                  <Button onClick={searchApplications} disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Applications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={application.user_profiles?.avatar_url} />
                          <AvatarFallback>
                            {application.user_profiles?.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {application.user_profiles?.display_name}
                          </h4>
                          <p className="text-sm text-gray-600">@{application.user_profiles?.username}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)} {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900">{application.position}</h5>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          {application.company}
                        </p>
                      </div>
                      
                      {application.interview_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Interview: {new Date(application.interview_date).toLocaleDateString()}
                        </div>
                      )}

                      {application.interview_status && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {application.interview_status}
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Heart className="h-4 w-4 mr-2" />
                          Support
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {publicApplications.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No public applications found</p>
                  <p className="text-sm text-gray-400">Applications will appear here when users make them public</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Friends Section */}
          <TabsContent value="friends">
            <FriendsSection />
          </TabsContent>

          {/* Activity Feed */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityFeed.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                    <p className="text-sm">Activity will appear here as users interact</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityFeed.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user_profiles?.avatar_url} />
                          <AvatarFallback>
                            {activity.user_profiles?.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user_profiles?.display_name}</span>
                            {' '}{activity.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">0</div>
                  <p className="text-sm text-gray-600">Active job seekers</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <p className="text-sm text-gray-600">Public applications</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">0</div>
                  <p className="text-sm text-gray-600">Scheduled interviews</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
