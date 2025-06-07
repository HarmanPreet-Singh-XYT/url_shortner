import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';

const URLResult = ({ result, onCopy }) => {
  if (!result) return null;

  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="font-semibold text-green-900 mb-2">URL Shortened Successfully!</h3>
      <div className="flex items-center gap-2 mb-2">
        <Input
          value={result.shortUrl}
          readOnly
          className="bg-white"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopy(result.shortUrl)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-green-700">
        Original: {result.originalUrl}
      </p>
    </div>
  );
};
export default URLResult;