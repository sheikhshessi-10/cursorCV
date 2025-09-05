
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateApplicationDialogProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    position: string;
    company: string;
    jobDescription: string;
    jobLink?: string;
    cvContent?: string;
    cvData?: any;
  }) => void;
}

export const CreateApplicationDialog = ({ onClose, onSubmit }: CreateApplicationDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    position: '',
    company: '',
    jobDescription: '',
    jobLink: '',
    cvContent: '',
    cvData: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.position && formData.company) {
      onSubmit(formData);
      setFormData({
        title: '',
        position: '',
        company: '',
        jobDescription: '',
        jobLink: '',
        cvContent: '',
        cvData: {}
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Job Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Application Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Frontend Developer at TechCorp"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Job Title</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Senior Developer"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="TechCorp Inc."
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="jobDescription">Job Description (Optional)</Label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
              placeholder="Paste the job description here..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="jobLink">Job Link (Optional)</Label>
            <Input
              id="jobLink"
              type="url"
              value={formData.jobLink}
              onChange={(e) => setFormData({...formData, jobLink: e.target.value})}
              placeholder="https://company.com/careers/job-posting"
            />
          </div>
          <div>
            <Label htmlFor="cvContent">CV Content (Optional)</Label>
            <Textarea
              id="cvContent"
              value={formData.cvContent}
              onChange={(e) => setFormData({...formData, cvContent: e.target.value})}
              placeholder="Paste your CV content here..."
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Create Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
