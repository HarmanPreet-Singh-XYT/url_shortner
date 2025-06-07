import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Link } from 'lucide-react';
import URLCard from './URLCard';

const URLList = ({ 
  urls, 
  onCopy, 
  onAnalytics, 
  onEdit, 
  onToggleStatus, 
  onDelete 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Manage Your URLs
        </CardTitle>
        <CardDescription>
          View, edit, and manage all your shortened URLs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {urls.map((url) => (
            <URLCard
              key={url.id}
              url={url}
              onCopy={onCopy}
              onAnalytics={onAnalytics}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}

          {urls.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No URLs created yet</p>
              <p className="text-sm">Create your first shortened URL to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default URLList;