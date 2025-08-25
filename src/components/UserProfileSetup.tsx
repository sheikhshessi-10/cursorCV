import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/types/social";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';

interface UserProfileSetupProps {
  onComplete: () => void;
}

export const UserProfileSetup = ({ onComplete }: UserProfileSetupProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    username: '',
    display_name: '',
    bio: '',
    location: '',
    university: '',
    major: '',
    graduation_year: undefined,
    linkedin_url: '',
    github_url: '',
    website_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Pre-fill with available user data
      setProfile(prev => ({
        ...prev,
        display_name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        username: user.user_metadata?.name?.toLowerCase().replace(/\s+/g, '') || user.email?.split('@')[0] || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          ...profile,
          graduation_year: profile.graduation_year || null
        });

      if (error) throw error;

      toast.success('Profile created successfully!');
      onComplete();
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-2xl">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-gray-600">
            Set up your public profile so other job seekers can discover and connect with you
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  placeholder="johndoe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={profile.display_name}
                  onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  placeholder="New York, NY"
                />
              </div>
              <div>
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={profile.university}
                  onChange={(e) => setProfile({...profile, university: e.target.value})}
                  placeholder="University of Technology"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  value={profile.major}
                  onChange={(e) => setProfile({...profile, major: e.target.value})}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="graduation_year">Graduation Year</Label>
                <Input
                  id="graduation_year"
                  type="number"
                  value={profile.graduation_year || ''}
                  onChange={(e) => setProfile({...profile, graduation_year: parseInt(e.target.value) || undefined})}
                  placeholder="2025"
                  min="2020"
                  max="2030"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div>
                <Label htmlFor="github_url">GitHub</Label>
                <Input
                  id="github_url"
                  value={profile.github_url}
                  onChange={(e) => setProfile({...profile, github_url: e.target.value})}
                  placeholder="github.com/johndoe"
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  value={profile.website_url}
                  onChange={(e) => setProfile({...profile, website_url: e.target.value})}
                  placeholder="johndoe.com"
                />
              </div>
            </div>

            <div className="text-center pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating Profile...' : 'Complete Profile Setup'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
