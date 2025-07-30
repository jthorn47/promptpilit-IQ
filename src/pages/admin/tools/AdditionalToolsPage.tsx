import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Package, Workflow } from 'lucide-react';

interface ToolItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AdditionalToolsPage: React.FC = () => {
  const navigate = useNavigate();

  const tools: ToolItem[] = [
    {
      id: 'data-import-export',
      title: 'Integration Hub',
      description: 'Advanced data import/export tools and third-party integrations.',
      url: '/admin/tools/data',
      icon: Database
    },
    {
      id: 'bulk-operations',
      title: 'Bulk Operations',
      description: 'Perform bulk operations on data and system entities.',
      url: '/admin/tools/bulk',
      icon: Package
    },
    {
      id: 'api-management',
      title: 'API Management',
      description: 'Manage API access, security audits, and system monitoring.',
      url: '/admin/tools/api',
      icon: Workflow
    }
  ];

  const handleToolClick = (url: string) => {
    navigate(url);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Additional Tools</h1>
        <p className="text-muted-foreground mt-2">
          Access advanced system tools and utilities for data management, bulk operations, and API administration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleToolClick(tool.url)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};