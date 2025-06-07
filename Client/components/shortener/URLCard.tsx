import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, Eye, Calendar, BarChart3, Edit, Zap, Trash2, ExternalLink 
} from 'lucide-react';

const URLCard = ({ 
  url, 
  onCopy, 
  onAnalytics, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {url.shortUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
            <Badge variant={url.isActive ? "default" : "secondary"}>
              {url.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 truncate mb-1">
            {url.originalUrl}
          </p>
          {url.description && (
            <p className="text-xs text-gray-500 mb-2">{url.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {url.clicks} clicks
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(url.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(url.shortUrl)}
            title="Copy URL"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAnalytics(url.id)}
            title="View Analytics"
          >
            <BarChart3 className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(url)}
            title="Edit URL"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(url.id, url.isActive)}
            title={url.isActive ? "Deactivate" : "Activate"}
          >
            <Zap className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(url.id)}
            className="text-red-600 hover:text-red-800"
            title="Delete URL"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
export default URLCard;