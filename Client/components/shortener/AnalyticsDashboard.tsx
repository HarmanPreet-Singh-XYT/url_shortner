import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3 } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';

const AnalyticsDashboard = ({ analytics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analytics Dashboard
        </CardTitle>
        <CardDescription>
          View detailed analytics for your URLs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analytics ? (
          <AnalyticsCard analytics={analytics} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a URL from the Manage tab to view analytics</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default AnalyticsDashboard;