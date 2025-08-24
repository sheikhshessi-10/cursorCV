import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileText, 
  Upload, 
  Brain, 
  Zap, 
  Target,
  CheckCircle,
  Users,
  TrendingUp
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AI Resume Builder</span>
          </div>
          <Button onClick={() => navigate('/dashboard')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            🚀 AI-Powered Resume Creation
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Create Perfect Resumes<br />
            <span className="text-blue-600">Tailored for Every Job</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Build intelligent resumes that adapt to each job application. Our AI assistant helps you optimize content, 
            improve ATS scores, and track your applications all in one place.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Building Now
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>AI-Powered Writing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get intelligent suggestions to improve your resume content and make it more compelling for recruiters.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Job-Specific Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Paste any job description and get personalized recommendations to tailor your resume perfectly.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Application Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Keep track of all your job applications, interview status, and follow-ups in one organized dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Upload className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Easy Import</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Import your existing resume or connect LinkedIn/GitHub to automatically populate your profile.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Professional Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Choose from 20+ ATS-friendly templates designed by recruitment experts.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle>Instant Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Export your resume as PDF or DOCX with perfect formatting guaranteed every time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals who've improved their job search with AI-powered resumes.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Get Started Free
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
