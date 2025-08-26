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
  Clock,
  UserPlus,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const SocialDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access Social features</h2>
          <p className="text-gray-600">You need to be logged in to view and interact with other users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Social Dashboard</h1>
              <div className="text-sm text-gray-600">
                Connect with friends and track internship progress together
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the Social Hub, {user?.user_metadata?.name || user?.email || 'User'}!
          </h2>
          <p className="text-xl text-gray-600">
            Connect with friends, share your internship journey, and get inspired by others
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for users, companies, or positions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={() => toast.info('Search feature coming soon!')}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Public Feed</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          {/* Public Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Public Applications Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon!</h3>
                  <p className="text-gray-600 mb-4">
                    Public applications feed will be available once the database is set up
                  </p>
                  <Button variant="outline" onClick={() => toast.info('Database setup required')}>
                    Setup Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Friends & Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search Users */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search for users to connect with..."
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={() => toast.info('Friend search coming soon!')}>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  
                  {/* Current Friends */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Your Friends</h4>
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600">No friends yet. Start connecting!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Feed</h3>
                  <p className="text-gray-600 mb-4">
                    Track your friends' internship progress and achievements
                  </p>
                  <Button variant="outline" onClick={() => toast.info('Activity tracking coming soon!')}>
                    Enable Tracking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Social Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Friends</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Interactions</div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-600">Stats will populate as you connect with friends</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.info('Profile setup coming soon!')}>
                  <UserPlus className="h-6 w-6 mb-2" />
                  <span>Setup Profile</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.info('Friend suggestions coming soon!')}>
                  <Users className="h-6 w-6 mb-2" />
                  <span>Find Friends</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.info('Sharing coming soon!')}>
                  <MessageCircle className="h-6 w-6 mb-2" />
                  <span>Share Progress</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
