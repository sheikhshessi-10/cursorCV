import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, FileText, Briefcase, LogOut, User, Github, Linkedin, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { ApplicationCard } from '@/components/ApplicationCard';
import { CreateApplicationDialog } from '@/components/CreateApplicationDialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CVRecord {
  id: string;
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
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CVRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interviews: 0,
    accepted: 0
  });

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      // Try to fetch from Supabase first
      if (user && !user.id.includes('demo')) {
        const { data, error } = await supabase
          .from('cvs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const cvData = data || [];
        setCvs(cvData);
        updateStats(cvData);
      } else {
        // For demo users, use local storage as fallback
        const storedCVs = localStorage.getItem('demo-cvs');
        if (storedCVs) {
          const cvData = JSON.parse(storedCVs);
          setCvs(cvData);
          updateStats(cvData);
        }
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
      // Fallback to local storage for demo users
      const storedCVs = localStorage.getItem('demo-cvs');
      if (storedCVs) {
        const cvData = JSON.parse(storedCVs);
        setCvs(cvData);
        updateStats(cvData);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (cvData: CVRecord[]) => {
    setStats({
      total: cvData.length,
      applied: cvData.filter(cv => cv.status === 'applied').length,
      interviews: cvData.filter(cv => cv.status === 'interview').length,
      accepted: cvData.filter(cv => cv.status === 'accepted').length
    });
  };

  const handleCreateApplication = async (data: {
    title: string;
    jobTitle: string;
    company: string;
    jobDescription: string;
    jobLink: string;
  }) => {
    try {
      const newCV: CVRecord = {
        id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: data.title,
        job_title: data.jobTitle,
        company: data.company,
        job_description: data.jobDescription,
        job_link: data.jobLink,
        status: 'draft',
        cv_data: {},
        created_at: new Date().toISOString()
      };

      // Try to save to Supabase first
      if (user && !user.id.includes('demo')) {
        const { error } = await supabase
          .from('cvs')
          .insert({
            title: data.title,
            job_title: data.jobTitle,
            company: data.company,
            job_description: data.jobDescription,
            job_link: data.jobLink,
            status: 'draft',
            cv_data: {}
          });
        if (error) throw error;
      }

      // Always update local state
      const updatedCVs = [newCV, ...cvs];
      setCvs(updatedCVs);
      updateStats(updatedCVs);
      
      // Save to local storage for demo users
      if (user?.id.includes('demo')) {
        localStorage.setItem('demo-cvs', JSON.stringify(updatedCVs));
      }
      
      toast.success('Application created successfully!');
    } catch (error) {
      console.error('Error creating application:', error);
      
      // Fallback: create locally even if Supabase fails
      const newCV: CVRecord = {
        id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: data.title,
        job_title: data.jobTitle,
        company: data.company,
        job_description: data.jobDescription,
        job_link: data.jobLink,
        status: 'draft',
        cv_data: {},
        created_at: new Date().toISOString()
      };
      
      const updatedCVs = [newCV, ...cvs];
      setCvs(updatedCVs);
      updateStats(updatedCVs);
      localStorage.setItem('demo-cvs', JSON.stringify(updatedCVs));
      
      toast.success('Application created successfully! (Saved locally)');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      // Try to delete from Supabase first
      if (user && !user.id.includes('demo')) {
        const { error } = await supabase
          .from('cvs')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      // Always update local state
      const updatedCVs = cvs.filter(cv => cv.id !== id);
      setCvs(updatedCVs);
      updateStats(updatedCVs);
      
      // Save to local storage for demo users
      if (user?.id.includes('demo')) {
        localStorage.setItem('demo-cvs', JSON.stringify(updatedCVs));
      }
      
      toast.success('Application deleted');
    } catch (error) {
      console.error('Error deleting application:', error);
      
      // Fallback: delete locally even if Supabase fails
      const updatedCVs = cvs.filter(cv => cv.id !== id);
      setCvs(updatedCVs);
      updateStats(updatedCVs);
      localStorage.setItem('demo-cvs', JSON.stringify(updatedCVs));
      
      toast.success('Application deleted (from local storage)');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      // Try to update in Supabase first
      if (user && !user.id.includes('demo')) {
        const { error } = await supabase
          .from('cvs')
          .update({ status: newStatus })
          .eq('id', id);

        if (error) throw error;
      }

      // Always update local state
      const updatedCVs = cvs.map(cv => 
        cv.id === id ? { ...cv, status: newStatus as any } : cv
      );
      setCvs(updatedCVs);
      updateStats(updatedCVs);
      
      // Save to local storage for demo users
      if (user?.id.includes('demo')) {
        localStorage.setItem('demo-cvs', JSON.stringify(updatedCVs));
      }
      
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Fallback: update locally even if Supabase fails
      const updatedCVs = cvs.map(cv => 
        cv.id === id ? { ...cv, status: newStatus as any } : cv
      );
      setCvs(updatedCVs);
      updateStats(updatedCVs);
      localStorage.setItem('demo-cvs', JSON.stringify(updatedCVs));
      
      toast.success('Status updated (saved locally)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">AI Resume Builder</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.user_metadata?.name || user?.email || 'User'}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email || 'User'}!
          </h2>
          <p className="text-gray-600">
            Track your job applications and create AI-optimized resumes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Applied</p>
                  <p className="text-2xl font-bold">{stats.applied}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Connections */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Profile Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Linkedin className="h-4 w-4 mr-2" />
                Connect LinkedIn
              </Button>
              <Button variant="outline" className="justify-start">
                <Github className="h-4 w-4 mr-2" />
                Connect GitHub
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Import CV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications Section */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Job Applications</h3>
          <div className="flex space-x-2">
            <CreateApplicationDialog onCreateApplication={handleCreateApplication} />
            <Button variant="outline" onClick={() => navigate('/editor')}>
              <FileText className="h-4 w-4 mr-2" />
              Base CV Editor
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        ) : cvs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">No applications yet</h4>
              <p className="text-gray-600 mb-6">
                Create your first job application to get started
              </p>
              <CreateApplicationDialog onCreateApplication={handleCreateApplication} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {cvs.map((cv) => (
              <ApplicationCard
                key={cv.id}
                cv={cv}
                onDelete={handleDeleteApplication}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
