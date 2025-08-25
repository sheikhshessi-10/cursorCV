import { useAuth } from "@/contexts/AuthContext";
import { AuthForms } from "@/components/AuthForms";
import { ConnectionTest } from "@/components/ConnectionTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building, Users, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user.user_metadata?.name || user.email || 'User'}! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Ready to continue building your career? Let's get started!
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/social">
                <Button size="lg" variant="outline">
                  <Users className="mr-2 h-5 w-5" />
                  Social Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Building className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Build CVs</h3>
                <p className="text-gray-600">Create professional resumes with AI assistance</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Connect</h3>
                <p className="text-gray-600">Network with other job seekers</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-gray-600">Monitor your application journey</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Auth Forms */}
          <div>
            <AuthForms />
          </div>
          
          {/* Connection Test */}
          <div className="flex items-center justify-center">
            <ConnectionTest />
          </div>
        </div>
      </div>
    </div>
  );
}
