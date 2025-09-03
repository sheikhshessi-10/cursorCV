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
  Filter
} from 'lucide-react';
import { ApplicationCard } from '@/components/ApplicationCard';
import { CreateApplicationDialog } from '@/components/CreateApplicationDialog';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
    } catch (error: any) {
      toast.error('Error logging out');
    }
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">CV Builder</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
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
                className="hidden md:flex"
              >
                <Users className="h-4 w-4 mr-2" />
                Social
              </Button>
              
              <NotificationsPanel />
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
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
          <div className="space-y-4">
            {applications.map((app) => (
                              <ApplicationCard
                  key={app.id}
                  application={app}
                  onDelete={handleDeleteApplication}
                  onStatusUpdate={handleStatusUpdate}
                />
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
    </div>
  );
};

export default Dashboard;
