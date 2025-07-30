import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Type, Calendar, CheckSquare } from 'lucide-react';

const CustomFields = () => {
  const fieldTypes = {
    text: { icon: Type, label: 'Text' },
    date: { icon: Calendar, label: 'Date' },
    boolean: { icon: CheckSquare, label: 'Checkbox' }
  };

  const sampleFields = [
    {
      id: '1',
      name: 'Industry',
      type: 'text',
      entity: 'Contact',
      required: true,
      active: true
    },
    {
      id: '2',
      name: 'Last Contact Date',
      type: 'date',
      entity: 'Deal',
      required: false,
      active: true
    },
    {
      id: '3',
      name: 'Is Decision Maker',
      type: 'boolean',
      entity: 'Contact',
      required: false,
      active: true
    },
    {
      id: '4',
      name: 'Annual Revenue',
      type: 'text',
      entity: 'Company',
      required: false,
      active: false
    }
  ];

  return (
    <StandardPageLayout 
      title="Custom Fields"
      subtitle="Create and manage custom fields for contacts, companies, and deals"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Custom Fields</h2>
            <p className="text-muted-foreground">Extend your CRM with custom data fields</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Field
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleFields.map((field) => {
            const TypeIcon = fieldTypes[field.type as keyof typeof fieldTypes]?.icon || Type;
            return (
              <Card key={field.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-4 w-4" />
                      <CardTitle className="text-sm">{field.name}</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Entity:</span>
                      <Badge variant="outline">{field.entity}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant="secondary">
                        {fieldTypes[field.type as keyof typeof fieldTypes]?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Required:</span>
                      <Badge variant={field.required ? "default" : "outline"}>
                        {field.required ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={field.active ? "default" : "secondary"}>
                        {field.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default CustomFields;