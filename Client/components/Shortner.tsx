'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Link, Copy, Eye, Calendar, TrendingUp, Settings, 
  QrCode, Share2, Trash2, Edit, ExternalLink,
  BarChart3, Clock, Globe, Zap
} from 'lucide-react';

// Configuration
const USE_BACKEND = process.env.USE_BACKEND === "TRUE" ? true : false;
const API_BASE = process.env.BACKEND_URL;

// Mock data for development/demo
const mockData = {
  urls: [
    {
      id: '1',
      shortUrl: 'https://short.ly/abc123',
      originalUrl: 'https://example.com/very-long-url-that-needs-shortening',
      customAlias: 'my-link',
      clicks: 42,
      createdAt: '2024-01-15T10:30:00Z',
      isActive: true,
      description: 'My portfolio website'
    },
    {
      id: '2',
      shortUrl: 'https://short.ly/xyz789',
      originalUrl: 'https://github.com/user/awesome-project',
      customAlias: null,
      clicks: 128,
      createdAt: '2024-01-10T14:20:00Z',
      isActive: true,
      description: null
    },
    {
      id: '3',
      shortUrl: 'https://short.ly/demo456',
      originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      customAlias: 'rick-roll',
      clicks: 256,
      createdAt: '2024-01-08T09:15:00Z',
      isActive: true,
      description: 'Never gonna give you up'
    }
  ],
  analytics: {
    totalClicks: 42,
    uniqueClicks: 35,
    clicksByDate: [
      { date: '2024-01-20', clicks: 5 },
      { date: '2024-01-21', clicks: 8 },
      { date: '2024-01-22', clicks: 12 },
      { date: '2024-01-23', clicks: 17 },
      { date: '2024-01-24', clicks: 22 },
      { date: '2024-01-25', clicks: 28 },
      { date: '2024-01-26', clicks: 35 }
    ],
    referrers: [
      { source: 'Direct', clicks: 20 },
      { source: 'Twitter', clicks: 15 },
      { source: 'LinkedIn', clicks: 7 },
      { source: 'Facebook', clicks: 5 }
    ],
    countries: [
      { country: 'United States', clicks: 25 },
      { country: 'United Kingdom', clicks: 10 },
      { country: 'Canada', clicks: 7 },
      { country: 'Germany', clicks: 5 }
    ]
  }
};

// API service with backend toggle
const apiService = {
  // Shorten URL
  shortenUrl: async (data) => {
    if (USE_BACKEND) {
      const response = await fetch(`${API_BASE}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers as needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }
      
      return await response.json();
    } else {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUrl = {
        shortUrl: `https://short.ly/${Math.random().toString(36).substr(2, 6)}`,
        originalUrl: data.originalUrl,
        customAlias: data.customAlias,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        clicks: 0,
        isActive: true,
        description: data.description
      };
      
      // Add to mock data
      mockData.urls.unshift(newUrl);
      return newUrl;
    }
  },

  // Get user's URLs
  getUserUrls: async () => {
    if (USE_BACKEND) {
      const response = await fetch(`${API_BASE}/urls`, {
        headers: {
          // Add authentication headers as needed
          // 'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }
      
      return await response.json();
    } else {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      return [...mockData.urls];
    }
  },

  // Get analytics
  getAnalytics: async (urlId) => {
    if (USE_BACKEND) {
      const response = await fetch(`${API_BASE}/analytics/${urlId}`, {
        headers: {
          // Add authentication headers as needed
          // 'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      var data = await response.json();
      return data;
    } else {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Find the URL in mock data and return analytics with some variation
      const url = mockData.urls.find(u => u.id === urlId);
      if (!url) {
        throw new Error('URL not found');
      }
      
      return {
        ...mockData.analytics,
        totalClicks: url.clicks,
        uniqueClicks: Math.floor(url.clicks * 0.8)
      };
    }
  },

  // Update URL
  updateUrl: async (id, data) => {
    if (USE_BACKEND) {
      const response = await fetch(`${API_BASE}/urls/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers as needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update URL');
      }
      
      return await response.json();
    } else {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update in mock data
      const urlIndex = mockData.urls.findIndex(url => url.id === id);
      if (urlIndex !== -1) {
        mockData.urls[urlIndex] = { ...mockData.urls[urlIndex], ...data };
      }
      
      return { success: true };
    }
  },

  // Delete URL
  deleteUrl: async (id) => {
    if (USE_BACKEND) {
      const response = await fetch(`${API_BASE}/urls/${id}`, {
        method: 'DELETE',
        headers: {
          // Add authentication headers as needed
          // 'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete URL');
      }
      
      return { success: true };
    } else {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove from mock data
      const urlIndex = mockData.urls.findIndex(url => url.id === id);
      if (urlIndex !== -1) {
        mockData.urls.splice(urlIndex, 1);
      }
      
      return { success: true };
    }
  },

  // Toggle URL status
  toggleUrlStatus: async (id, isActive) => {
    if (USE_BACKEND) {
      const response = await fetch(`${API_BASE}/urls/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers as needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle URL status');
      }
      
      return await response.json();
    } else {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update in mock data
      const urlIndex = mockData.urls.findIndex(url => url.id === id);
      if (urlIndex !== -1) {
        mockData.urls[urlIndex].isActive = isActive;
      }
      
      return { success: true };
    }
  }
};

const URLShortenerApp = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [urls, setUrls] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('shorten');

  // Load user URLs on component mount
  useEffect(() => {
    loadUserUrls();
  }, []);

  const loadUserUrls = async () => {
    try {
      const userUrls = await apiService.getUserUrls();
      setUrls(userUrls);
    } catch (err) {
      setError('Failed to load URLs');
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleShortenUrl = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!originalUrl) {
      setError('Please enter a URL to shorten');
      return;
    }

    if (!isValidUrl(originalUrl)) {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.shortenUrl({
        originalUrl,
        customAlias: customAlias || undefined,
        description: description || undefined
      });

      setResult(response);
      setOriginalUrl('');
      setCustomAlias('');
      setDescription('');
      
      // Reload URLs list
      loadUserUrls();
    } catch (err) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadAnalytics = async (urlId) => {
    try {
      const analyticsData = await apiService.getAnalytics(urlId);
      setAnalytics(analyticsData);
      setSelectedUrl(urlId);
    } catch (err) {
      setError('Failed to load analytics');
    }
  };

  const handleDeleteUrl = async (id) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;
    
    try {
      await apiService.deleteUrl(id);
      setUrls(urls.filter(url => url.id !== id));
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  const handleToggleUrlStatus = async (id, currentStatus) => {
    try {
      await apiService.toggleUrlStatus(id, !currentStatus);
      setUrls(urls.map(url => 
        url.id === id ? { ...url, isActive: !currentStatus } : url
      ));
    } catch (err) {
      setError('Failed to toggle URL status');
    }
  };

  const handleEditUrl = (url) => {
    setEditingUrl(url);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUrl = async (updatedData) => {
    try {
      await apiService.updateUrl(editingUrl.id, updatedData);
      setUrls(urls.map(url => 
        url.id === editingUrl.id ? { ...url, ...updatedData } : url
      ));
      setIsEditDialogOpen(false);
      setEditingUrl(null);
    } catch (err) {
      setError('Failed to update URL');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">URL Shortener</h1>
          <p className="text-gray-600">Transform long URLs into short, shareable links</p>
          {!USE_BACKEND && (
            <Badge variant="outline" className="mt-2">
              Demo Mode - Using Mock Data
            </Badge>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shorten">Shorten URL</TabsTrigger>
            <TabsTrigger value="manage">Manage URLs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Shorten URL Tab */}
          <TabsContent value="shorten">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Create Short URL
                </CardTitle>
                <CardDescription>
                  Enter a long URL to create a shortened version
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="originalUrl">Original URL *</Label>
                    <Input
                      id="originalUrl"
                      type="url"
                      placeholder="https://example.com/very-long-url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customAlias">Custom Alias (optional)</Label>
                    <Input
                      id="customAlias"
                      placeholder="my-custom-link"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the link"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button type="button" onClick={handleShortenUrl} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Shortening...
                      </>
                    ) : (
                      'Shorten URL'
                    )}
                  </Button>
                </div>

                {/* Result */}
                {result && (
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
                        onClick={() => copyToClipboard(result.shortUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-green-700">
                      Original: {result.originalUrl}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage URLs Tab */}
          <TabsContent value="manage">
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
                    <div key={url.id} className="p-4 border rounded-lg bg-white shadow-sm">
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
                            onClick={() => copyToClipboard(url.shortUrl)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadAnalytics(url.id)}
                          >
                            <BarChart3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUrl(url)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUrlStatus(url.id, url.isActive)}
                          >
                            <Zap className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUrl(url.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
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

                    {/* Charts would go here - simplified for this example */}
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a URL from the Manage tab to view analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit URL Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit URL</DialogTitle>
              <DialogDescription>
                Update the details of your shortened URL
              </DialogDescription>
            </DialogHeader>
            {editingUrl && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editCustomAlias">Custom Alias</Label>
                  <Input
                    id="editCustomAlias"
                    name="customAlias"
                    defaultValue={editingUrl.customAlias || ''}
                    className="mt-1"
                    onChange={(e) => {
                      setEditingUrl(prev => ({ ...prev, customAlias: e.target.value }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    name="description"
                    defaultValue={editingUrl.description || ''}
                    className="mt-1"
                    onChange={(e) => {
                      setEditingUrl(prev => ({ ...prev, description: e.target.value }));
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => handleUpdateUrl({
                      description: editingUrl.description,
                      customAlias: editingUrl.customAlias
                    })}
                  >
                    Update
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default URLShortenerApp;