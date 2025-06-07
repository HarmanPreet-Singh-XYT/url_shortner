'use client'
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Import all components
import Header from './shortener/Header';
import ErrorAlert from './shortener/ErrorAlert';
import URLShortenerForm from './shortener/URLShortenerForm';
import URLResult from './shortener/URLResult';
import URLList from './shortener/URLList';
import EditURLDialog from './shortener/EditURLDialog';
import AnalyticsDashboard from './shortener/AnalyticsDashboard';

import { mockData } from '@/app/data';

// Configuration
const USE_BACKEND = true;
const API_BASE = "http://localhost:3500";

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
      
      var data = await response.json();
      return data;
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
      var data = await response.json();
      return data;
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
      
      var data = await response.json();
      return data;
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
      
      var data = await response.json();
      return data;
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
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [urls, setUrls] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('shorten');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleShortenUrl = async (data) => {
    setError('');
    setResult(null);

    if (!data.originalUrl) {
      setError('Please enter a URL to shorten');
      return;
    }

    if (!isValidUrl(data.originalUrl)) {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.shortenUrl(data);
      setResult(response);
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
      setActiveTab('analytics');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Header useBackend={USE_BACKEND} />
        <ErrorAlert error={error} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shorten">Shorten URL</TabsTrigger>
            <TabsTrigger value="manage">Manage URLs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="shorten">
            <URLShortenerForm onSubmit={handleShortenUrl} isLoading={isLoading} />
            <URLResult result={result} onCopy={copyToClipboard} />
          </TabsContent>

          <TabsContent value="manage">
            <URLList
              urls={urls}
              onCopy={copyToClipboard}
              onAnalytics={loadAnalytics}
              onEdit={handleEditUrl}
              onToggleStatus={handleToggleUrlStatus}
              onDelete={handleDeleteUrl}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard analytics={analytics} />
          </TabsContent>
        </Tabs>

        <EditURLDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          url={editingUrl}
          onUpdate={handleUpdateUrl}
        />
      </div>
    </div>
  );
};

export default URLShortenerApp;