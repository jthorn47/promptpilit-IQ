import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag } from 'lucide-react';

const Tags = () => {
  const sampleTags = [
    { id: '1', name: 'Hot Lead', color: 'red', count: 25 },
    { id: '2', name: 'Enterprise', color: 'blue', count: 12 },
    { id: '3', name: 'Follow Up', color: 'yellow', count: 18 },
    { id: '4', name: 'Qualified', color: 'green', count: 32 },
    { id: '5', name: 'Cold Lead', color: 'gray', count: 8 }
  ];

  return (
    <StandardPageLayout 
      title="Tags"
      subtitle="Organize contacts and deals with custom tags"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Tag Management</h2>
            <p className="text-muted-foreground">Create and manage tags for better organization</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleTags.map((tag) => (
            <Card key={tag.id}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Tag className="h-4 w-4 mr-2" />
                <CardTitle className="text-sm font-medium">{tag.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{tag.count} items</Badge>
                  <div className={`w-4 h-4 rounded-full bg-${tag.color}-500`}></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default Tags;