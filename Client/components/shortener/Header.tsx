import React from 'react';
import { Badge } from '@/components/ui/badge';

const Header = ({ useBackend }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">URL Shortener</h1>
      <p className="text-gray-600">Transform long URLs into short, shareable links</p>
      {!useBackend && (
        <Badge variant="outline" className="mt-2">
          Demo Mode - Using Mock Data
        </Badge>
      )}
    </div>
  );
};
export default Header;