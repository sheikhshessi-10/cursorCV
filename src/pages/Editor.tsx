import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Save, Eye, ArrowLeft, Plus, CheckCircle, Upload } from "lucide-react";
import { AIAssistant } from "@/components/AIAssistant";
// import mammoth from "mammoth";

const Editor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isImported = searchParams.get("import") === "true";
  
  const [cvContent, setCvContent] = useState("");
  const [aiFields, setAiFields] = useState([
    { name: 'jobLink', value: '' },
    { name: 'linkedin', value: '' },
    { name: 'github', value: '' },
    { name: 'jobTitle', value: '' },
    { name: 'website', value: '' },
  ]);
  const [jobDescription, setJobDescription] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [processedCVContent, setProcessedCVContent] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isImported) {
      // Set some sample imported content
      setCvContent(`JOHN DOE
Software Engineer
john.doe@email.com | +1 (555) 123-4567 | New York, NY
linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development. Proven track record of delivering scalable web applications and leading cross-functional teams.

WORK EXPERIENCE
Senior Software Engineer at Tech Corp (2021-Present)
• Led development of microservices architecture serving 1M+ users
• Improved system performance by 40% through optimization
• Mentored junior developers and conducted code reviews

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2017-2021

SKILLS
JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes`);
    }
  }, [isImported]);

  const handleGetSuggestions = async () => {
    const payload = {
      jobLink: aiFields.find(f => f.name === 'jobLink')?.value || "",
      github_url: aiFields.find(f => f.name === 'github')?.value || "",
      job_posting: jobDescription,
      sample_resume: cvContent,
      ATS: "",
      personal_writeup: ""
    };
    try {
      const res = await fetch("https://59791c03d712.ngrok-free.app/suggest-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions ? [data.suggestions].flat() : []);
    } catch (e) {
      setAiSuggestions([{ error: "Failed to fetch suggestions" }]);
    }
  };

  const handleFileImport = async (file: File) => {
    try {
      // Temporarily disabled mammoth functionality for build
      // const arrayBuffer = await file.arrayBuffer();
      // const { value: text } = await mammoth.extractRawText({ arrayBuffer });
      
      // Set the extracted text directly to the text area
      setCvContent("File import temporarily disabled for build. Please paste your CV content manually.");
    } catch (error) {
      console.error('Error processing file:', error);
      setCvContent("Error processing the uploaded file. Please try again.");
    }
  };

  const testBackendConnection = async () => {
    try {
      console.log("🧪 Testing backend connection...");
      const res = await fetch("https://59791c03d712.ngrok-free.app/", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      console.log("✅ Backend connection test successful:", res.status);
    } catch (e) {
      console.error("❌ Backend connection test failed:", e);
    }
  };

  const handleSendCVToBackend = async () => {
    try {
      console.log("🚀 Sending CV to backend...");
      const payload = {
        jobLink: aiFields.find(f => f.name === 'jobLink')?.value || "",
        github_url: aiFields.find(f => f.name === 'github')?.value || "",
        job_posting: jobDescription,
        sample_resume: cvContent,
        ATS: "",
        personal_writeup: ""
      };
      console.log("📤 Payload being sent:", payload);
      
      const res = await fetch("https://59791c03d712.ngrok-free.app/process-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      console.log("📥 Response status:", res.status);
      console.log("📥 Response headers:", res.headers);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("📥 Response data:", data);
      
      if (data.processedCV) {
        setProcessedCVContent(data.processedCV);
        console.log("✅ Successfully set processed CV content");
      } else if (data.suggestions) {
        setProcessedCVContent(data.suggestions);
        console.log("✅ Using suggestions as processed CV content");
      } else {
        console.log("⚠️ No processedCV or suggestions found in response");
        setProcessedCVContent("No processed CV content found in response.");
      }
    } catch (e) {
      console.error("❌ Error sending CV to backend:", e);
      setProcessedCVContent(`Failed to process CV: ${e.message}`);
    }
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
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">CV Editor</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate("/templates")}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Done with my CV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Editor */}
        <div className="flex-1 p-6 pr-80">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isImported ? "Imported CV - Ready to Edit" : "Build Your CV"}
              </h2>
              <p className="text-gray-600">
                Import your CV document and edit the content in the text box below.
              </p>
            </div>

            {/* File Import Section */}
            <Card className="mb-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Import CV Document</h3>
                  <p className="text-gray-600 text-sm">
                    File import temporarily disabled. Please paste your CV content manually below.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={testBackendConnection}
                    variant="outline"
                    className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  >
                    🧪 Test Connection
                  </Button>
                  <input
                    type="file"
                    accept=".docx"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileImport(file);
                      }
                    }}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled
                    title="File import temporarily disabled for build"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CV (Disabled)
                  </Button>
                </div>
              </div>
            </Card>

            {/* CV Content Text Area */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">CV Content</h3>
                <p className="text-gray-600 text-sm mb-2">
                  ⚠️ File import temporarily disabled. Please paste your CV content manually below.
                </p>
                <Textarea
                  value={cvContent}
                  onChange={(e) => setCvContent(e.target.value)}
                  placeholder="Paste your CV content here manually, or type directly..."
                  className="min-h-[500px] text-sm font-mono resize-none mb-4"
                />
                
                {/* Send CV to Backend Button */}
                <div className="text-center">
                  <Button
                    onClick={handleSendCVToBackend}
                    disabled={!cvContent.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Send CV to Backend for Processing
                  </Button>
                </div>
              </div>
            </Card>

            {/* Processed CV Response */}
            {processedCVContent && (
              <Card className="mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Processed CV from Backend</h3>
                  <Textarea
                    value={processedCVContent}
                    onChange={(e) => setProcessedCVContent(e.target.value)}
                    placeholder="Processed CV content will appear here..."
                    className="min-h-[500px] text-sm font-mono resize-none"
                  />
                </div>
              </Card>
            )}

            {/* Done with CV Button */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={() => navigate("/templates")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Done with my CV - Choose Template
              </Button>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <AIAssistant
          selectedSection={null}
          sections={[]}
          aiFields={aiFields}
          setAiFields={setAiFields}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          aiSuggestions={aiSuggestions}
          setAiSuggestions={setAiSuggestions}
          onGetSuggestions={handleGetSuggestions}
          canRequestSuggestions={
            aiFields.find(f => f.name === 'linkedin')?.value &&
            aiFields.find(f => f.name === 'jobTitle')?.value &&
            aiFields.find(f => f.name === 'jobLink')?.value &&
            aiFields.find(f => f.name === 'github')?.value &&
            jobDescription &&
            cvContent.length > 0
          }
        />
      </div>
    </div>
  );
};

export default Editor;
