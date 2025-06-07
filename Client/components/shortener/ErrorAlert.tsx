import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ErrorAlert = ({ error }) => {
  if (!error) return null;

  return (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertDescription className="text-red-800">{error}</AlertDescription>
    </Alert>
  );
};
export default ErrorAlert;