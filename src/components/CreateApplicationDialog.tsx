
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateApplicationDialogProps {
  onCreateApplication: (data: {
    title: string;
    jobTitle: string;
    company: string;
    jobDescription: string;
    jobLink: string;
  }) => void;
}

export const CreateApplicationDialog = ({ onCreateApplication }: CreateApplicationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    jobTitle: '',
    company: '',
    jobDescription: '',
    jobLink: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.jobTitle && formData.company) {
      onCreateApplication(formData);
      setFormData({
        title: '',
        jobTitle: '',
        company: '',
        jobDescription: '',
        jobLink: ''
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </DialogTrigger>
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
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
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
            <Label htmlFor="jobLink">Job Link (Optional)</Label>
            <Input
              id="jobLink"
              type="url"
              value={formData.jobLink}
              onChange={(e) => setFormData({...formData, jobLink: e.target.value})}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="jobDescription">Job Description (Optional)</Label>
            <Textarea
              id="jobDescription"
              value={formData.jobDescription}
              onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
              placeholder="Paste the job description here for AI analysis..."
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Application</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
