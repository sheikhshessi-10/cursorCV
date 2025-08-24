
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Trash2, Edit3 } from "lucide-react";

interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ExperienceSectionProps {
  content: {
    items: ExperienceItem[];
  };
  onChange: (content: any) => void;
}

export const ExperienceSection = ({ content, onChange }: ExperienceSectionProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addItem = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      description: ""
    };
    
    onChange({
      items: [...(content.items || []), newItem]
    });
    setEditingId(newItem.id);
  };

  const updateItem = (id: string, field: string, value: string) => {
    const updatedItems = (content.items || []).map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ items: updatedItems });
  };

  const deleteItem = (id: string) => {
    const updatedItems = (content.items || []).filter(item => item.id !== id);
    onChange({ items: updatedItems });
  };

  return (
    <div className="space-y-4">
      {(content.items || []).map((item) => (
        <Card key={item.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                {item.position || "New Position"} {item.company && `at ${item.company}`}
              </h4>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {editingId === item.id ? (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Position Title</Label>
                  <Input
                    value={item.position}
                    onChange={(e) => updateItem(item.id, "position", e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={item.company}
                    onChange={(e) => updateItem(item.id, "company", e.target.value)}
                    placeholder="Tech Corp"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={item.location}
                    onChange={(e) => updateItem(item.id, "location", e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={item.startDate}
                      onChange={(e) => updateItem(item.id, "startDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={item.endDate}
                      onChange={(e) => updateItem(item.id, "endDate", e.target.value)}
                      placeholder="Present"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  placeholder="Describe your key responsibilities and achievements..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="text-sm text-gray-600 mb-2">
                {item.location} • {item.startDate} - {item.endDate || "Present"}
              </div>
              {item.description && (
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              )}
            </CardContent>
          )}
        </Card>
      ))}
      
      <Button
        variant="outline"
        onClick={addItem}
        className="w-full border-dashed border-2 h-12"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Work Experience
      </Button>
    </div>
  );
};
