'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams,useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  AlertTriangle, 
  Clock, 
  Shield,
  ChevronRight,
} from 'lucide-react';

// Configuration
const USE_BACKEND = process.env.USE_BACKEND === "TRUE" ? true : false;
const API_BASE = process.env.BACKEND_URL;

// Analytics and redirection service
const redirectService = {
  // Get original URL and track analytics
  getUrlAndTrack: async (shortId, trackingData) => {
    if (USE_BACKEND) {
      const response = await fetch(`${API_BASE}/redirect/${shortId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('URL_NOT_FOUND');
        } else if (response.status === 410) {
          throw new Error('URL_INACTIVE');
        }
        throw new Error('SERVER_ERROR');
      }
      
      return await response.json();
    } else {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate different scenarios based on ID for testing
      if (shortId === 'notfound') {
        throw new Error('URL_NOT_FOUND');
      }
      if (shortId === 'inactive') {
        throw new Error('URL_INACTIVE');
      }
      
      return {
        originalUrl: 'https://example.com/very-long-url-that-needs-shortening',
        title: 'Example Website',
        description: 'A sample website for demonstration',
        isActive: true,
        requiresWarning: false // Set to true for potentially unsafe URLs
      };
    }
  }
};

// Utility functions
const getClientIP = async () => {
  try {
    // In production, you might want to use a service like ipify
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return null;
  }
};

const COOKIE_LIMIT = 170; // Be conservative (browser may allow ~180–300)
const COOKIE_EXPIRES_YEARS = 1;

function getCookiesMap() {
  const cookies = document.cookie.split('; ').filter(Boolean);
  const cookieMap = new Map();

  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    cookieMap.set(decodeURIComponent(key), decodeURIComponent(value));
  }

  return cookieMap;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

function markUniqueClickWithEviction(shortId) {
  const cookies = getCookiesMap();

  if (cookies.has(shortId)) {
    return false; // Not unique
  }

  if (cookies.size >= COOKIE_LIMIT) {
    // Evict least recently used (oldest timestamp)
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, value] of cookies) {
      const time = Date.parse(value);
      if (!isNaN(time) && time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      deleteCookie(oldestKey);
    }
  }

  // Set new cookie
  const now = new Date();
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + COOKIE_EXPIRES_YEARS);

  document.cookie = `${encodeURIComponent(shortId)}=${now.toISOString()}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

  return true; // Unique click
}


const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    deviceType = 'mobile';
  }
  
  return {
    userAgent: ua,
    deviceType,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

const page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [urlData, setUrlData] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const shortId = useParams<{ id:string }>();

  useEffect(() => {
    if (shortId) {
      handleRedirect();
    }
  }, [shortId]);

  useEffect(() => {
    let timer;
    if (showWarning && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showWarning && countdown === 0) {
      proceedToRedirect();
    }
    return () => clearTimeout(timer);
  }, [countdown, showWarning]);

  const collectTrackingData = async () => {
    const isUnique = markUniqueClickWithEviction(shortId.id);
    const deviceInfo = getDeviceInfo();
    const clientIP = await getClientIP();
    
    return {
      isUnique,
      ipAddress: clientIP,
      referrer: document.referrer || null,
      utm: {
        source: searchParams.get('utm_source'),
        medium: searchParams.get('utm_medium'),
        campaign: searchParams.get('utm_campaign'),
        term: searchParams.get('utm_term'),
        content: searchParams.get('utm_content')
      },
      device: deviceInfo,
      timestamp: new Date().toISOString(),
      // Additional context
      pageTitle: document.title,
      currentUrl: window.location.href
    };
  };

  const handleRedirect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Collect tracking data
      const trackingData = await collectTrackingData();

      // Get original URL and send analytics
      const response = await redirectService.getUrlAndTrack(shortId.id, trackingData);
      
      setUrlData(response);

      // Check if URL requires warning (e.g., external domain, potentially unsafe)
      if (response.requiresWarning) {
        setShowWarning(true);
        setCountdown(5);
      } else {
        // Immediate redirect for safe URLs
        setTimeout(() => {
          proceedToRedirect(response.originalUrl);
        }, 500);
      }

    } catch (err) {
      setLoading(false);
      
      switch (err.message) {
        case 'URL_NOT_FOUND':
          setError({
            type: 'not_found',
            title: 'Link Not Found',
            message: 'This short link doesn\'t exist or has been removed.',
            action: 'Go to Homepage'
          });
          break;
        case 'URL_INACTIVE':
          setError({
            type: 'inactive',
            title: 'Link Inactive',
            message: 'This link has been deactivated by its owner.',
            action: 'Go to Homepage'
          });
          break;
        default:
          setError({
            type: 'server_error',
            title: 'Server Error',
            message: 'Something went wrong. Please try again later.',
            action: 'Retry'
          });
      }
    } finally {
      setLoading(false);
    }
  };

  const proceedToRedirect = (url = null) => {
    const targetUrl = url || urlData?.originalUrl;
    if (targetUrl) {
      setRedirecting(true);
      // Add a small delay to show the redirecting state
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 200);
    }
  };

  const handleErrorAction = () => {
    if (error?.type === 'server_error') {
      handleRedirect(); // Retry
    } else {
      router.push('/'); // Go to homepage
    }
  };

  const getDomainFromUrl = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Redirecting...
            </h2>
            <p className="text-gray-600 text-sm">
              Please wait while we redirect you to your destination
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-900">{error.title}</CardTitle>
            <CardDescription className="text-gray-600">
              {error.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleErrorAction}
              className="w-full"
              variant="default"
            >
              {error.action}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <ExternalLink className="h-12 w-12 text-green-600 mx-auto mb-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Redirecting Now...
            </h2>
            <p className="text-gray-600 text-sm">
              Taking you to {getDomainFromUrl(urlData?.originalUrl)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showWarning && urlData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-900">External Link Warning</CardTitle>
            <CardDescription className="text-gray-600">
              You're about to visit an external website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This link will take you to: <strong>{getDomainFromUrl(urlData.originalUrl)}</strong>
              </AlertDescription>
            </Alert>

            {urlData.title && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-1">{urlData.title}</h3>
                {urlData.description && (
                  <p className="text-gray-600 text-sm">{urlData.description}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Redirecting automatically in {countdown} seconds</span>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={() => proceedToRedirect()}
                className="flex-1"
                variant="default"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
export default page