import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Video, Upload, Search, Play, Clock } from 'lucide-react';

export const MediaLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockVideos = [
    {
      id: '1',
      title: 'Workplace Safety Introduction',
      description: 'Overview of workplace safety principles',
      duration: '8:45',
      views: 1234,
      status: 'published',
      vimeoId: '123456789'
    },
    {
      id: '2',
      title: 'Fire Safety Procedures',
      description: 'Step-by-step fire emergency procedures',
      duration: '12:30',
      views: 856,
      status: 'published',
      vimeoId: '987654321'
    },
    {
      id: '3',
      title: 'CPR Training Video',
      description: 'Hands-on CPR training demonstration',
      duration: '15:20',
      views: 567,
      status: 'processing',
      vimeoId: 'pending'
    }
  ];

  const filteredVideos = mockVideos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Video
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 published, 1 processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,657</div>
            <p className="text-xs text-muted-foreground">+124 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36m 35s</div>
            <p className="text-xs text-muted-foreground">Content library</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vimeo Storage</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4GB</div>
            <p className="text-xs text-muted-foreground">of 50GB used</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{video.title}</CardTitle>
                {getStatusBadge(video.status)}
              </div>
              <p className="text-sm text-muted-foreground">{video.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {video.duration}
                  </div>
                  <div className="flex items-center">
                    <Play className="mr-1 h-4 w-4" />
                    {video.views} views
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Vimeo ID: {video.vimeoId}
                  </span>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by uploading your first video.'}
          </p>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </div>
      )}
    </div>
  );
};