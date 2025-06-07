export // Mock data for development/demo
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