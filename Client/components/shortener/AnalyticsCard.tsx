import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, Globe } from 'lucide-react';

const AnalyticsCard = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Total Clicks</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {analytics.totalClicks}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            <h3 className="font-medium">Unique Clicks</h3>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {analytics.uniqueClicks}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referrers */}
        <div>
          <h3 className="font-medium mb-3">Top Referrers</h3>
          <div className="space-y-2">
            {analytics.referrers.map((referrer, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{referrer.source}</span>
                <Badge variant="outline">{referrer.clicks}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div>
          <h3 className="font-medium mb-3">Top Countries</h3>
          <div className="space-y-2">
            {analytics.countries.map((country, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{country.country}</span>
                <Badge variant="outline">{country.clicks}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsCard;