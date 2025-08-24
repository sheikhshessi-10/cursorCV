
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, ExternalLink, Edit, Trash2, CheckCircle, Clock, XCircle, FileText, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ApplicationCardProps {
  cv: {
    id: string;
    title: string;
    job_title?: string;
    company?: string;
    status: string;
    created_at: string;
    ats_score?: number;
    ai_score?: number;
    job_link?: string;
  };
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
}

export const ApplicationCard = ({ cv, onDelete, onStatusUpdate }: ApplicationCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'interview': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'applied': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'interview': return <Clock className="h-4 w-4" />;
      case 'applied': return <Send className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusButtonVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'interview': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'applied': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'rejected': return 'bg-red-600 hover:bg-red-700 text-white';
      default: return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft': return 'applied';
      case 'applied': return 'interview';
      case 'interview': return 'accepted';
      case 'accepted': return 'accepted';
      case 'rejected': return 'applied';
      default: return 'applied';
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft': return 'Mark as Applied';
      case 'applied': return 'Mark as Interview';
      case 'interview': return 'Mark as Accepted';
      case 'accepted': return 'Already Accepted';
      case 'rejected': return 'Re-apply';
      default: return 'Mark as Applied';
    }
  };

  const canAdvanceStatus = (currentStatus: string) => {
    return currentStatus !== 'accepted';
  };

  const handleStatusAdvance = () => {
    if (canAdvanceStatus(cv.status)) {
      const nextStatus = getNextStatus(cv.status);
      onStatusUpdate(cv.id, nextStatus);
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{cv.title}</h4>
            {cv.job_title && cv.company && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Briefcase className="h-4 w-4 mr-1" />
                {cv.job_title} at {cv.company}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/editor?cv=${cv.id}`)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {cv.job_link && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(cv.job_link, '_blank')}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(cv.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(cv.status)}>
              {getStatusIcon(cv.status)} {cv.status.charAt(0).toUpperCase() + cv.status.slice(1)}
            </Badge>
            {cv.ats_score && (
              <Badge variant="outline">ATS: {cv.ats_score}%</Badge>
            )}
            {cv.ai_score && (
              <Badge variant="outline">AI: {cv.ai_score}%</Badge>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(cv.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Status Management Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Main Status Button */}
          <Button
            onClick={handleStatusAdvance}
            disabled={!canAdvanceStatus(cv.status)}
            className={`${getStatusButtonVariant(cv.status)} flex-1 min-w-[140px]`}
          >
            {getStatusIcon(cv.status)}
            <span className="ml-2">{getNextStatusLabel(cv.status)}</span>
          </Button>

          {/* Quick Status Buttons */}
          {cv.status !== 'applied' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(cv.id, 'applied')}
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              <Send className="h-3 w-3 mr-1" />
              Applied
            </Button>
          )}
          
          {cv.status !== 'interview' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(cv.id, 'interview')}
              className="border-blue-500 text-blue-700 hover:bg-blue-50"
            >
              <Clock className="h-3 w-3 mr-1" />
              Interview
            </Button>
          )}
          
          {cv.status !== 'accepted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(cv.id, 'accepted')}
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Accepted
            </Button>
          )}
          
          {cv.status !== 'rejected' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(cv.id, 'rejected')}
              className="border-red-500 text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
