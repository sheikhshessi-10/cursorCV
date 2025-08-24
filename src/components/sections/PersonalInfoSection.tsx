
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoSectionProps {
  content: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  onChange: (content: any) => void;
}

export const PersonalInfoSection = ({ content, onChange }: PersonalInfoSectionProps) => {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...content,
      [field]: value
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={content.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@email.com"
          value={content.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          placeholder="+1 (555) 123-4567"
          value={content.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="New York, NY"
          value={content.location || ""}
          onChange={(e) => handleChange("location", e.target.value)}
        />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="linkedin">LinkedIn Profile</Label>
        <Input
          id="linkedin"
          placeholder="linkedin.com/in/johndoe"
          value={content.linkedin || ""}
          onChange={(e) => handleChange("linkedin", e.target.value)}
        />
      </div>
    </div>
  );
};
