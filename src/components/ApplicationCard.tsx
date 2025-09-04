
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, ExternalLink, Edit, Trash2, CheckCircle, Clock, XCircle, FileText, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ApplicationCardProps {
  application: {
    id: string;
    title: string;
    company: string;
    position: string;
    status: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    job_description?: string;
    cv_content?: string;
    cv_data?: any;
    is_public?: boolean;
    allow_comments?: boolean;
    interview_date?: string;
    interview_type?: string;
    interview_status?: string;
    interview_notes?: string;
  };
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  isViewOnly?: boolean;
}

export const ApplicationCard = ({ application, onDelete, onStatusUpdate, isViewOnly = false }: ApplicationCardProps) => {
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
    if (canAdvanceStatus(application.status)) {
      const nextStatus = getNextStatus(application.status);
      onStatusUpdate(application.id, nextStatus);
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{application.title}</h4>
            {application.position && application.company && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Briefcase className="h-4 w-4 mr-1" />
                {application.position} at {application.company}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(application.status)}>
                {getStatusIcon(application.status)}
                <span className="ml-1 capitalize">{application.status}</span>
              </Badge>
              <span className="text-xs text-gray-500">
                <Calendar className="h-3 w-3 inline mr-1" />
                {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {!isViewOnly && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/editor?id=${application.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              {application.job_description && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(application.job_description, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(application.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          {isViewOnly && application.job_description && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(application.job_description, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {!isViewOnly && (
          <div className="flex items-center justify-between">
            <Button
              onClick={handleStatusAdvance}
              disabled={!canAdvanceStatus(application.status)}
              className={`${getStatusButtonVariant(application.status)} w-full mr-2`}
            >
              {getNextStatusLabel(application.status)}
            </Button>
            
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(application.id, 'applied')}
                className={application.status === 'applied' ? 'bg-yellow-100 border-yellow-300' : ''}
              >
                <Send className="h-3 w-3 mr-1" />
                Applied
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(application.id, 'interview')}
                className={application.status === 'interview' ? 'bg-blue-100 border-blue-300' : ''}
              >
                <Clock className="h-3 w-3 mr-1" />
                Interview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(application.id, 'accepted')}
                className={application.status === 'accepted' ? 'bg-green-100 border-green-300' : ''}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Accepted
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
