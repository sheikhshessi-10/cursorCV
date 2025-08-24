
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, X, Edit3 } from "lucide-react";

interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

interface SkillsSectionProps {
  content: {
    categories: SkillCategory[];
  };
  onChange: (content: any) => void;
}

export const SkillsSection = ({ content, onChange }: SkillsSectionProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSkill, setNewSkill] = useState<{ [key: string]: string }>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: SkillCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      skills: []
    };
    
    onChange({
      categories: [...(content.categories || []), newCategory]
    });
    setNewCategoryName("");
  };

  const deleteCategory = (categoryId: string) => {
    const updatedCategories = (content.categories || []).filter(cat => cat.id !== categoryId);
    onChange({ categories: updatedCategories });
  };

  const addSkill = (categoryId: string) => {
    const skillText = newSkill[categoryId];
    if (!skillText || !skillText.trim()) return;

    const updatedCategories = (content.categories || []).map(category =>
      category.id === categoryId
        ? { ...category, skills: [...category.skills, skillText.trim()] }
        : category
    );
    
    onChange({ categories: updatedCategories });
    setNewSkill({ ...newSkill, [categoryId]: "" });
  };

  const removeSkill = (categoryId: string, skillIndex: number) => {
    const updatedCategories = (content.categories || []).map(category =>
      category.id === categoryId
        ? { ...category, skills: category.skills.filter((_, index) => index !== skillIndex) }
        : category
    );
    
    onChange({ categories: updatedCategories });
  };

  const updateCategoryName = (categoryId: string, newName: string) => {
    const updatedCategories = (content.categories || []).map(category =>
      category.id === categoryId ? { ...category, name: newName } : category
    );
    onChange({ categories: updatedCategories });
  };

  return (
    <div className="space-y-4">
      {(content.categories || []).map((category) => (
        <Card key={category.id} className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              {editingCategory === category.id ? (
                <Input
                  value={category.name}
                  onChange={(e) => updateCategoryName(category.id, e.target.value)}
                  onBlur={() => setEditingCategory(null)}
                  onKeyPress={(e) => e.key === "Enter" && setEditingCategory(null)}
                  className="font-semibold"
                  autoFocus
                />
              ) : (
                <h4 className="font-semibold text-gray-900">{category.name}</h4>
              )}
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setEditingCategory(category.id)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  onClick={() => deleteCategory(category.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="relative group pr-8 hover:bg-red-100"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(category.id, index)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill[category.id] || ""}
                onChange={(e) => setNewSkill({ ...newSkill, [category.id]: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && addSkill(category.id)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => addSkill(category.id)}
                disabled={!newSkill[category.id]?.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="border-dashed border-2">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Category name (e.g., Programming Languages)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCategory()}
            />
            <Button onClick={addCategory} disabled={!newCategoryName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
