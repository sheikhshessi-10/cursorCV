import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  FileText, 
  Briefcase, 
  LogOut,
  User,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Search,
  Copy,
  Filter,
  X,
  Calendar,
  MapPin,
  Building
} from 'lucide-react';
import { ApplicationCard } from '@/components/ApplicationCard';
import { CreateApplicationDialog } from '@/components/CreateApplicationDialog';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Application {
  id: string;
  title: string;
  company: string;
  position: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  job_description?: string;
  cv_content?: string;
  cv_data?: any;
  is_public?: boolean;
  allow_comments?: boolean;
  interview_date?: string;
  interview_type?: string;
  interview_status?: string;
  interview_notes?: string;
  application_date?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      if (user.id.includes('demo')) {
        // Demo mode - use local storage
        const storedApplications = localStorage.getItem('demoApplications');
        if (storedApplications) {
          setApplications(JSON.parse(storedApplications));
        }
      } else {
        // Real user - fetch from Supabase
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching applications:', error);
          toast.error('Failed to fetch applications');
        } else {
          setApplications(data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (applicationData: any) => {
    if (!user) return;

    try {
      const newApplication = {
        id: crypto.randomUUID(),
        title: applicationData.title || 'Untitled Application',
                  company: applicationData.company || '',
          position: applicationData.position || '',
          status: 'pending',
          job_description: applicationData.jobDescription || '',
        cv_content: applicationData.cvContent || '',
        cv_data: applicationData.cvData || {},
        is_public: false, // Default to private, user can make public later
        allow_comments: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      };

      if (user.id.includes('demo')) {
        // Demo mode - save to local storage
        const updatedApplications = [newApplication, ...applications];
        setApplications(updatedApplications);
        localStorage.setItem('demoApplications', JSON.stringify(updatedApplications));
        toast.success('Application created successfully! (Saved locally)');
      } else {
        // Real user - save to Supabase
        const { data, error } = await supabase
          .from('applications')
          .insert([newApplication])
          .select()
          .single();

        if (error) {
          console.error('Error creating application:', error);
          toast.error('Failed to create application');
        } else {
          setApplications([data, ...applications]);
          toast.success('Application created successfully! (Saved to database)');
        }
      }

      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating application:', error);
      toast.error('Failed to create application');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!user) return;

    try {
      if (user.id.includes('demo')) {
        // Demo mode - remove from local storage
        const updatedApplications = applications.filter(app => app.id !== id);
        setApplications(updatedApplications);
        localStorage.setItem('demoApplications', JSON.stringify(updatedApplications));
        toast.success('Application deleted successfully!');
      } else {
        // Real user - delete from Supabase
        const { error } = await supabase
          .from('applications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting application:', error);
          toast.error('Failed to delete application');
        } else {
          setApplications(applications.filter(app => app.id !== id));
          toast.success('Application deleted successfully!');
        }
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!user) return;

    try {
      if (user.id.includes('demo')) {
        // Demo mode - update local storage
        const updatedApplications = applications.map(app => 
          app.id === id ? { ...app, status: newStatus, updated_at: new Date().toISOString() } : app
        );
        setApplications(updatedApplications);
        localStorage.setItem('demoApplications', JSON.stringify(updatedApplications));
        toast.success('Status updated successfully!');
      } else {
        // Real user - update in Supabase
        const { error } = await supabase
          .from('applications')
          .update({ 
            status: newStatus, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating status:', error);
          toast.error('Failed to update status');
        } else {
                  setApplications(applications.map(app =>
          app.id === id ? { ...app, status: newStatus, updated_at: new Date().toISOString() } : app
        ));
          toast.success('Status updated successfully!');
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      navigate('/'); // Navigate back to login page
    } catch (error: any) {
      toast.error('Error logging out');
    }
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await handleStatusUpdate(applicationId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleStatusBadgeClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when clicking status badge
  };

  const getStatusCount = (status: string) => {
    return applications.filter(app => app.status === status).length;
  };

  const handleAccessCodeSubmit = () => {
    if (accessCode.toLowerCase() === 'shessi fam') {
      toast.success('Access granted! Welcome to AI Resume!');
      setShowPremiumDialog(false);
      setShowCodeInput(false);
      setAccessCode('');
      navigate('/editor');
    } else {
      toast.error('Invalid access code. Please try again.');
      setAccessCode('');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CV</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Smart CV Builder
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <span>Welcome back,</span>
                <span className="font-medium text-gray-900">
                  {user?.user_metadata?.name || user?.email || 'User'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/social'}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <Users className="h-4 w-4" />
                Social
              </Button>
              
              <NotificationsPanel />
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="rounded-full w-10 h-10 p-0 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email || 'User'}!
          </h1>
          <p className="text-xl text-gray-600">
            Track your job applications and create AI-optimized resumes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Applied</p>
                  <p className="text-2xl font-bold">{getStatusCount('applied')}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold">{getStatusCount('interview')}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold">{getStatusCount('accepted')}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Connections */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button variant="outline">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.91v5.679H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Connect LinkedIn
              </Button>
              <Button variant="outline">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Connect GitHub
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Import CV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Applications Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Job Applications</h2>
          <div className="flex space-x-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
            <Button variant="outline" onClick={() => setShowPremiumDialog(true)}>
              <FileText className="h-4 w-4 mr-2" />
              AI Resume
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your job search by creating your first application</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => (
              <Card 
                key={app.id} 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
                onClick={() => handleApplicationClick(app)}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
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
                    
                    {/* Status Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge 
                          className={`cursor-pointer hover:opacity-80 transition-opacity ${
                                                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200' :
                        app.status === 'applied' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' :
                        app.status === 'interviewing' ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' :
                        app.status === 'copied' ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200' :
                        'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                          }`}
                          onClick={handleStatusBadgeClick}
                        >
                          {app.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {app.status === 'applied' && <FileText className="h-3 w-3 mr-1" />}
                          {app.status === 'interviewing' && <TrendingUp className="h-3 w-3 mr-1" />}
                          {app.status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {app.status === 'copied' && <Copy className="h-3 w-3 mr-1" />}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(app.id, 'pending')}
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span>Pending</span>
                          {app.status === 'pending' && <CheckCircle className="h-4 w-4 ml-auto text-green-600" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(app.id, 'applied')}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>Applied</span>
                          {app.status === 'applied' && <CheckCircle className="h-4 w-4 ml-auto text-green-600" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(app.id, 'interviewing')}
                          className="flex items-center gap-2"
                        >
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span>Interviewing</span>
                          {app.status === 'interviewing' && <CheckCircle className="h-4 w-4 ml-auto text-green-600" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(app.id, 'accepted')}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Accepted</span>
                          {app.status === 'accepted' && <CheckCircle className="h-4 w-4 ml-auto text-green-600" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(app.id, 'rejected')}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4 text-red-600" />
                          <span>Rejected</span>
                          {app.status === 'rejected' && <CheckCircle className="h-4 w-4 ml-auto text-green-600" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(app.id, 'copied')}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4 text-orange-600" />
                          <span>Copied</span>
                          {app.status === 'copied' && <CheckCircle className="h-4 w-4 ml-auto text-green-600" />}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Content Preview */}
                  {app.job_description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {app.job_description.substring(0, 120)}...
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-blue-600 font-medium group-hover:text-blue-700">
                      View Details →
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Application Dialog */}
      {showCreateDialog && (
        <CreateApplicationDialog
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateApplication}
        />
      )}

      {/* Premium Feature Dialog */}
      <AlertDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Premium Feature</AlertDialogTitle>
            <AlertDialogDescription>
              This is a premium feature where agents work on your CV to make it accustomed to a specific job based on in-depth research.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {!showCodeInput ? (
            <div className="py-4">
              <Button 
                onClick={() => setShowCodeInput(true)}
                className="w-full"
              >
                Enter Access Code
              </Button>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter your access code"
                  onKeyPress={(e) => e.key === 'Enter' && handleAccessCodeSubmit()}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleAccessCodeSubmit}
                  className="flex-1"
                >
                  Submit
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCodeInput(false)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPremiumDialog(false);
              setShowCodeInput(false);
              setAccessCode('');
            }}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  <label className="text-sm font-medium text-gray-500">Application Date</label>
                  <p className="text-sm text-gray-700">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowApplicationModal(false);
                    navigate(`/editor?id=${selectedApplication.id}`);
                  }}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Application
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApplicationModal(false);
                    handleDeleteApplication(selectedApplication.id);
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Delete
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
    </div>
  );
};

export default Dashboard;
