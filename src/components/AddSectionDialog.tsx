
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderOpen, 
  Languages, 
  Heart, 
  Award, 
  Trophy,
  BookOpen,
  Star,
  Plus
} from "lucide-react";

interface AddSectionDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string, title: string) => void;
}

const availableSections = [
  {
    type: "experience",
    title: "Work Experience",
    icon: Briefcase,
    description: "Professional work history and achievements"
  },
  {
    type: "education",
    title: "Education & Training",
    icon: GraduationCap,
    description: "Academic qualifications and certifications"
  },
  {
    type: "skills",
    title: "Skills",
    icon: Wrench,
    description: "Technical and soft skills"
  },
  {
    type: "projects",
    title: "Projects",
    icon: FolderOpen,
    description: "Personal and professional projects"
  },
  {
    type: "languages",
    title: "Language Skills",
    icon: Languages,
    description: "Language proficiencies and certifications"
  },
  {
    type: "volunteering",
    title: "Volunteering",
    icon: Heart,
    description: "Volunteer work and community involvement"
  },
  {
    type: "publications",
    title: "Publications",
    icon: BookOpen,
    description: "Research papers, articles, and publications"
  },
  {
    type: "honors",
    title: "Honors & Awards",
    icon: Award,
    description: "Recognition and achievements"
  },
  {
    type: "hobbies",
    title: "Hobbies & Interests",
    icon: Star,
    description: "Personal interests and activities"
  },
  {
    type: "recommendations",
    title: "Recommendations",
    icon: Trophy,
    description: "Professional references and testimonials"
  },
  {
    type: "other",
    title: "Other",
    icon: Plus,
    description: "Custom section for additional information"
  }
];

export const AddSectionDialog = ({ open, onClose, onAdd }: AddSectionDialogProps) => {
  const handleAddSection = (type: string, title: string) => {
    onAdd(type, title);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Section</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {availableSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card 
                key={section.type}
                className="hover:shadow-md transition-all duration-200 cursor-pointer group border-2 hover:border-blue-200"
                onClick={() => handleAddSection(section.type, section.title)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
