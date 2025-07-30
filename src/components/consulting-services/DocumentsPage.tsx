
import React from 'react';
import { StandardLayout } from '@/components/layouts/StandardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Upload, Plus, Settings } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const documents = [
    {
      id: '1',
      title: 'Employee Handbook 2024',
      type: 'handbook',
      size: '2.4 MB',
      lastModified: '2024-01-15',
      status: 'published'
    },
    {
      id: '2',
      title: 'Safety Procedures Manual',
      type: 'manual',
      size: '1.8 MB',
      lastModified: '2024-01-12',
      status: 'draft'
    },
    {
      id: '3',
      title: 'Code of Conduct',
      type: 'policy',
      size: '0.9 MB',
      lastModified: '2024-01-10',
      status: 'published'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  return (
    <StandardLayout 
      title="Documents"
      subtitle="Manage and distribute company documents, handbooks, and policies"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(doc.type)}
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                    </div>
                    <CardDescription>
                      {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} • {doc.size}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Last modified: {doc.lastModified}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StandardLayout>
  );
};
