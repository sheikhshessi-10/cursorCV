import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Sparkles } from "lucide-react";

const templates = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, contemporary design perfect for tech and creative roles",
    preview: "/api/placeholder/300/400",
    color: "blue"
  },
  {
    id: "classic",
    name: "Classic Executive",
    description: "Traditional format ideal for corporate and executive positions",
    preview: "/api/placeholder/300/400",
    color: "gray"
  },
  {
    id: "creative",
    name: "Creative Designer",
    description: "Bold layout with visual elements for creative professionals",
    preview: "/api/placeholder/300/400",
    color: "purple"
  },
  {
    id: "minimalist",
    name: "Minimalist Clean",
    description: "Simple, elegant design that focuses on content",
    preview: "/api/placeholder/300/400",
    color: "green"
  },
  {
    id: "academic",
    name: "Academic Scholar",
    description: "Formal layout designed for academic and research positions",
    preview: "/api/placeholder/300/400",
    color: "indigo"
  }
];

const Templates = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "pdf" | "docx") => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a dummy download
    const element = document.createElement("a");
    element.href = "data:text/plain;charset=utf-8," + encodeURIComponent("CV Export");
    element.download = `my-cv.${format}`;
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setIsExporting(false);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "border-blue-200 hover:border-blue-400 bg-blue-50",
      gray: "border-gray-200 hover:border-gray-400 bg-gray-50",
      purple: "border-purple-200 hover:border-purple-400 bg-purple-50",
      green: "border-green-200 hover:border-green-400 bg-green-50",
      indigo: "border-indigo-200 hover:border-indigo-400 bg-indigo-50",
      orange: "border-orange-200 hover:border-orange-400 bg-orange-50"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/editor")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Editor
              </Button>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Choose Template</h1>
              </div>
            </div>
            {selectedTemplate && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleExport("docx")}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export DOCX
                </Button>
                <Button
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export PDF"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Select Your Perfect Template
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our 5 professionally designed templates. All templates are ATS-friendly and optimized for modern hiring processes.
          </p>
        </div>

        {selectedTemplate && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">
                Template selected: {templates.find(t => t.id === selectedTemplate)?.name}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                selectedTemplate === template.id
                  ? `border-blue-500 shadow-lg ${getColorClasses(template.color)}`
                  : `border-gray-200 hover:border-blue-300`
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-0">
                {/* Template Preview */}
                <div className="aspect-[3/4] bg-gray-100 rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <div className="text-xs text-gray-500">Preview</div>
                    </div>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Selected
                    </div>
                  )}
                </div>
                
                {/* Template Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{template.name}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!selectedTemplate && (
          <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol className="text-blue-800 text-sm space-y-1">
              <li>1. Select a template that matches your industry and style</li>
              <li>2. Preview how your CV content looks in the chosen design</li>
              <li>3. Export as PDF or DOCX format for immediate use</li>
            </ol>
          </div>
        )}
      </main>
    </div>
  );
};

export default Templates;
