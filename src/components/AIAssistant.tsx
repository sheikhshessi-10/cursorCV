import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Briefcase, MessageSquare, X, Link, Linkedin, Github, Globe } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestion?: {
    before: string;
    after: string;
    applied: boolean;
  };
}

interface AIAssistantProps {
  selectedSection: string | null;
  sections: any[];
  aiFields: { name: string; value: string }[];
  setAiFields: (fields: { name: string; value: string }[]) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  aiSuggestions: any[];
  setAiSuggestions: (sugs: any[]) => void;
  onGetSuggestions: () => void;
  canRequestSuggestions: boolean;
}

export const AIAssistant = ({ selectedSection, sections, aiFields, setAiFields, jobDescription, setJobDescription, aiSuggestions, setAiSuggestions, onGetSuggestions, canRequestSuggestions }: AIAssistantProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hi! I'm your AI CV assistant. I can help you improve your resume content, tailor it to job descriptions, and provide professional suggestions. What would you like to work on?",
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(message, selectedSection, sections, jobDescription);
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userMessage: string, selectedSection: string | null, sections: any[], jobDesc: string): Message => {
    const responses = [
      {
        content: "I can help you improve that section! Here's a more professional version:",
        suggestion: {
          before: "Worked on various projects and tasks",
          after: "Led cross-functional projects delivering 25% improvement in operational efficiency while managing stakeholder relationships across 5 departments",
          applied: false
        }
      },
      {
        content: "Based on the job description you provided, I recommend emphasizing these key skills in your experience section. Here's how to make your current experience more relevant:",
        suggestion: {
          before: "Managed team and projects",
          after: "Spearheaded agile development teams of 8+ engineers, delivering 15+ features on schedule while maintaining 99.9% system uptime for enterprise clients",
          applied: false
        }
      },
      {
        content: "Your summary could be more impactful. Let me suggest a version that better highlights your achievements:",
        suggestion: {
          before: "Experienced professional with good skills",
          after: "Results-driven software architect with 8+ years of experience building scalable systems that serve 2M+ users. Proven track record of reducing infrastructure costs by 40% while improving performance metrics.",
          applied: false
        }
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: `ai-${Date.now()}`,
      type: "assistant",
      content: randomResponse.content,
      timestamp: new Date(),
      suggestion: randomResponse.suggestion
    };
  };

  const applySuggestion = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId && msg.suggestion 
        ? { ...msg, suggestion: { ...msg.suggestion, applied: true } }
        : msg
    ));
  };

  const quickPrompts = [
    "Make this sound more professional",
    "Rewrite for a tech job",
    "Add quantifiable achievements",
    "Improve for ATS systems",
    "Make it more concise"
  ];

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const handleIconClick = (idx: number) => {
    setExpandedIdx(idx);
  };
  const handleFieldChange = (idx: number, val: string) => {
    const updated = aiFields.map((f, i) => i === idx ? { ...f, value: val } : f);
    setAiFields(updated);
  };
  const handleFieldBlur = () => {
    setExpandedIdx(null);
  };

  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);

  if (!isExpanded) {
    return (
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20">
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg z-10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {/* Icon Row */}
        <div className="flex space-x-2 mb-4">
          {aiFields.map((field, idx) => {
            const Icon = [Link, Linkedin, Github, Briefcase, Globe][idx];
            return (
              <div key={field.name} className="relative">
                <button
                  className={`rounded-full p-2 shadow transition-colors duration-200 border border-gray-200 focus:outline-none ${field.value ? 'bg-green-500 text-white border-green-600 shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600'}`}
                  onClick={() => handleIconClick(idx)}
                  type="button"
                  tabIndex={0}
                >
                  <Icon className="h-5 w-5" />
                </button>
                {expandedIdx === idx && (
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => handleFieldChange(idx, e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder={field.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 p-2 rounded shadow border border-gray-200 bg-white text-sm z-20 focus:outline-none"
                    autoFocus
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* Job Description Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex items-center">
            <Briefcase className="h-3 w-3 mr-1" />
            Job Description (Optional)
          </label>
          <Textarea
            placeholder="Paste job description to get tailored suggestions..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="text-xs h-20 resize-none"
          />
        </div>
      </div>

      {/* Selected Section Indicator */}
      {selectedSection && (
        <div className="p-2 bg-blue-50 border-b">
          <Badge variant="secondary" className="text-xs">
            Editing: {sections.find(s => s.id === selectedSection)?.title}
          </Badge>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg p-3 ${
              msg.type === "user" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-900"
            }`}>
              <p className="text-sm">{msg.content}</p>
              
              {msg.suggestion && (
                <div className="mt-3 p-2 bg-white rounded border text-gray-900">
                  <div className="text-xs font-medium mb-2">Suggestion:</div>
                  <div className="space-y-2">
                    <div className="p-2 bg-red-50 rounded text-xs">
                      <div className="font-medium text-red-800 mb-1">Before:</div>
                      <div className="text-red-700">{msg.suggestion.before}</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-xs">
                      <div className="font-medium text-green-800 mb-1">After:</div>
                      <div className="text-green-700">{msg.suggestion.after}</div>
                    </div>
                    {!msg.suggestion.applied && (
                      <Button
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={() => applySuggestion(msg.id)}
                      >
                        Apply Suggestion
                      </Button>
                    )}
                    {msg.suggestion.applied && (
                      <div className="text-center text-xs text-green-600 font-medium">
                        ✓ Applied
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {/* AI Suggestions as expandable boxes */}
        {aiSuggestions && aiSuggestions.length > 0 && aiSuggestions.map((sug, idx) => (
          <div key={idx} className="flex justify-start">
            <div className="max-w-[85%] w-full">
              <div className={`rounded-lg p-3 mb-2 bg-green-50 border border-green-200 shadow cursor-pointer transition-all duration-200 ${expandedSuggestion === idx ? 'max-h-none' : 'max-h-24 overflow-hidden'}`}
                onClick={() => setExpandedSuggestion(expandedSuggestion === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-700">AI Suggestion</span>
                  <span className="ml-2 text-xs text-green-600">{expandedSuggestion === idx ? 'Collapse' : 'Expand'}</span>
                </div>
                <div className="mt-2 text-sm text-green-900 whitespace-pre-line">
                  {expandedSuggestion === idx
                    ? (typeof sug === 'string' ? sug : JSON.stringify(sug, null, 2))
                    : (typeof sug === 'string' ? sug.slice(0, 100) + (sug.length > 100 ? '...' : '') : JSON.stringify(sug, null, 2).slice(0, 100) + '...')
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Get AI Suggestions button at the bottom */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={onGetSuggestions}
          disabled={!canRequestSuggestions}
          className={`w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold shadow transition-all duration-200 ${!canRequestSuggestions ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          title={!canRequestSuggestions ? 'Please fill all required fields in the CV editor and sidebar.' : ''}
        >
          Get AI Suggestions
        </button>
      </div>

      {/* Ask AI for help input remains below */}
      <div className="p-4 border-t bg-white">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Ask AI for help..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!message.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
