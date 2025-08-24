
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Edit3, Trash2 } from "lucide-react";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";

interface CVSectionProps {
  section: any;
  onUpdate: (id: string, content: any) => void;
  onDelete: (id: string) => void;
  onSelect: () => void;
  isSelected: boolean;
  dragHandleProps: any;
}

export const CVSection = ({ 
  section, 
  onUpdate, 
  onDelete, 
  onSelect, 
  isSelected,
  dragHandleProps 
}: CVSectionProps) => {
  const handleContentChange = (content: any) => {
    onUpdate(section.id, content);
  };

  const renderSectionContent = () => {
    switch (section.type) {
      case "personal":
        return (
          <PersonalInfoSection
            content={section.content}
            onChange={handleContentChange}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            content={section.content}
            onChange={handleContentChange}
          />
        );
      case "education":
        return (
          <EducationSection
            content={section.content}
            onChange={handleContentChange}
          />
        );
      case "skills":
        return (
          <SkillsSection
            content={section.content}
            onChange={handleContentChange}
          />
        );
      case "summary":
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Write a compelling professional summary..."
              value={section.content.text || ""}
              onChange={(e) => handleContentChange({ text: e.target.value })}
              className="min-h-[120px]"
            />
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Add your content here..."
              value={section.content.text || ""}
              onChange={(e) => handleContentChange({ text: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        );
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 cursor-pointer ${
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            {section.type !== "personal" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(section.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderSectionContent()}
      </CardContent>
    </Card>
  );
};
