import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { 
  Search,
  Building,
  Briefcase,
  Clock,
  FileText,
  TrendingUp,
  CheckCircle,
  Copy,
  X,
  Calendar,
  User,
  ArrowLeft,
  Filter,
  Trophy,
  Medal,
  Award,
  Crown
} from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Application {
  id: string;
  title: string;
  company: string;
  position: string;
  status: string;
  job_description: string;
  cv_content: string;
  cv_data: any;
  is_public: boolean;
  allow_comments: boolean;
  interview_date: string | null;
  interview_type: string | null;
  interview_status: string | null;
  interview_notes: string | null;
  application_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_profiles?: {
    username: string;
    display_name: string;
  };
}

interface LeaderboardUser {
  user_id: string;
  username: string;
  display_name: string;
  application_count: number;
  rank: number;
}

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [addingApplication, setAddingApplication] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    fetchAllApplications();
    fetchLeaderboard();
  }, []);

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      
      // Fetch all public applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        toast.error('Failed to load applications');
        return;
      }

      // Fetch user profiles for all unique user IDs
      const userIds = [...new Set(applicationsData?.map(app => app.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, username, display_name')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        toast.error('Failed to load user profiles');
        return;
      }

      // Combine applications with user profiles
      const data = applicationsData?.map(app => ({
        ...app,
        user_profiles: profilesData?.find(profile => profile.user_id === app.user_id) || {
          username: 'Unknown User',
          display_name: 'Unknown User'
        }
      })) || [];

      console.log('Fetched applications:', data);
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Get application counts per user
      const { data: applicationCounts, error: countError } = await supabase
        .from('applications')
        .select('user_id')
        .eq('is_public', true);

      if (countError) {
        console.error('Error fetching application counts:', countError);
        return;
      }

      // Count applications per user
      const userCounts: { [key: string]: number } = {};
      applicationCounts?.forEach(app => {
        userCounts[app.user_id] = (userCounts[app.user_id] || 0) + 1;
      });

      // Get user profiles for users with applications
      const userIds = Object.keys(userCounts);
      if (userIds.length === 0) return;

      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, username, display_name')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching user profiles for leaderboard:', profilesError);
        return;
      }

      // Create leaderboard data
      const leaderboardData: LeaderboardUser[] = profiles?.map((profile, index) => ({
        user_id: profile.user_id,
        username: profile.username,
        display_name: profile.display_name,
        application_count: userCounts[profile.user_id],
        rank: index + 1
      })).sort((a, b) => b.application_count - a.application_count) || [];

      // Update ranks after sorting
      const rankedLeaderboard = leaderboardData.map((user, index) => ({
        ...user,
        rank: index + 1
      }));

      setLeaderboard(rankedLeaderboard.slice(0, 10)); // Top 10 users
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleQuickAdd = async (application: Application, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!user) {
      toast.error('You must be logged in to add applications');
      return;
    }

    setAddingApplication(application.id);
    
    try {
      const newApplication = {
        id: crypto.randomUUID(),
        title: application.title || `${application.position || 'Position'} at ${application.company || 'Company'}` || 'New Application',
        company: application.company || '',
        position: application.position || '',
        status: 'copied',
        job_description: application.job_description || '',
        cv_content: application.cv_content || '',
        cv_data: application.cv_data || {},
        is_public: true,
        allow_comments: true,
        interview_date: null,
        interview_type: null,
        interview_status: null,
        interview_notes: null,
        application_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      };

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

  const handleStatusBadgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user_profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user_profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EX</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent">
                  Explore Applications
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Side - Applications */}
          <div className="flex-1">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by company, position, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('applied')}>
                    Applied
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('interviewing')}>
                    Interviewing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('accepted')}>
                    Accepted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                    Rejected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('copied')}>
                    Copied
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        </div>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No public applications available yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredApplications.map((app) => (
              <Card 
                key={app.id} 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500 hover:border-l-purple-600"
                onClick={() => handleApplicationClick(app)}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-5 w-5 text-purple-600" />
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                          {app.company || 'Company'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-700 font-medium">
                          {app.position || 'Position'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Username Badge */}
                    <Badge 
                      className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors"
                    >
                      <User className="h-3 w-3 mr-1" />
                      @{app.user_profiles?.username || 'unknown'}
                    </Badge>
                  </div>

                  {/* Content Preview */}
                  {app.job_description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {app.job_description.substring(0, 120)}...
                    </p>
                  )}

                  {/* Quick Add Button */}
                  <div className="mb-4">
                    <Button
                      onClick={(e) => handleQuickAdd(app, e)}
                      disabled={addingApplication === app.id}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      {addingApplication === app.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Quick Add to My Dashboard
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-purple-600 font-medium group-hover:text-purple-700">
                      View Details →
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </div>

          {/* Right Side - Leaderboard */}
          <div className="w-80 hidden lg:block">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-lg font-bold text-gray-900">Top Applicants</h2>
                </div>
                
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((user, index) => (
                      <div 
                        key={user.user_id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' :
                          index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
                          index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200' :
                          'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {/* Rank Icon */}
                        <div className="flex-shrink-0">
                          {index === 0 ? (
                            <Crown className="h-6 w-6 text-yellow-500" />
                          ) : index === 1 ? (
                            <Medal className="h-6 w-6 text-gray-500" />
                          ) : index === 2 ? (
                            <Award className="h-6 w-6 text-orange-500" />
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">{user.rank}</span>
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-semibold text-sm">
                                {user.display_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.display_name || user.username}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Application Count */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {user.application_count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.application_count === 1 ? 'application' : 'applications'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Leaderboard Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Ranked by number of applications
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="text-xl font-semibold text-gray-900">{selectedApplication.company || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Position</label>
                    <p className="text-xl font-semibold text-gray-900">{selectedApplication.position || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge 
                      className={`${
                        selectedApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        selectedApplication.status === 'applied' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        selectedApplication.status === 'interviewing' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        selectedApplication.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                        selectedApplication.status === 'copied' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {selectedApplication.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {selectedApplication.status === 'applied' && <FileText className="h-3 w-3 mr-1" />}
                      {selectedApplication.status === 'interviewing' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {selectedApplication.status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {selectedApplication.status === 'copied' && <Copy className="h-3 w-3 mr-1" />}
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Applied by</label>
                    <p className="text-sm text-gray-700">
                      {selectedApplication.user_profiles?.display_name || selectedApplication.user_profiles?.username || 'Unknown User'}
                    </p>
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setShowApplicationModal(false);
                      handleQuickAdd(selectedApplication, new MouseEvent('click') as any);
                    }}
                    className="flex-1"
                    disabled={addingApplication === selectedApplication.id}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {addingApplication === selectedApplication.id ? 'Adding...' : 'Quick Add to My Dashboard'}
                  </Button>
                </div>

                {/* Timestamps */}
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
      </main>
    </div>
  );
};

export default Explore;
