import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Search, Plus, Edit, Trash2, Database } from 'lucide-react';

interface AttributeSchema {
  id: string;
  key: string;
  displayName: string;
  dataType: 'string' | 'number' | 'boolean' | 'array';
  allowedValues?: string[];
  isRequired: boolean;
  description: string;
  usageCount: number;
}

export const AttributeSchemaManager: React.FC = () => {
  const [schemas, setSchemas] = useState<AttributeSchema[]>([
    {
      id: '1',
      key: 'department',
      displayName: 'Department',
      dataType: 'string',
      allowedValues: ['hr', 'finance', 'engineering', 'sales', 'marketing'],
      isRequired: false,
      description: 'Employee department for access scoping',
      usageCount: 45
    },
    {
      id: '2',
      key: 'job_title',
      displayName: 'Job Title',
      dataType: 'string',
      allowedValues: undefined,
      isRequired: false,
      description: 'Employee job title',
      usageCount: 38
    },
    {
      id: '3',
      key: 'is_manager',
      displayName: 'Is Manager',
      dataType: 'boolean',
      isRequired: false,
      description: 'Whether user has management responsibilities',
      usageCount: 12
    },
    {
      id: '4',
      key: 'assigned_modules',
      displayName: 'Assigned Modules',
      dataType: 'array',
      allowedValues: ['vault', 'pulse', 'crm', 'payroll', 'hr', 'training'],
      isRequired: true,
      description: 'Modules available to the user',
      usageCount: 67
    },
    {
      id: '5',
      key: 'security_clearance',
      displayName: 'Security Clearance Level',
      dataType: 'number',
      allowedValues: ['1', '2', '3', '4', '5'],
      isRequired: false,
      description: 'Security clearance level (1-5)',
      usageCount: 8
    }
  ]);

  const [editingSchema, setEditingSchema] = useState<AttributeSchema | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const columns = [
    {
      accessorKey: 'key',
      header: 'Attribute Key',
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">{row.getValue('key')}</div>
      )
    },
    {
      accessorKey: 'displayName',
      header: 'Display Name'
    },
    {
      accessorKey: 'dataType',
      header: 'Data Type',
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.getValue('dataType')}</Badge>
      )
    },
    {
      accessorKey: 'allowedValues',
      header: 'Allowed Values',
      cell: ({ row }: any) => {
        const values = row.getValue('allowedValues') as string[];
        if (!values || values.length === 0) return <span className="text-muted-foreground">Any</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {values.slice(0, 3).map((value) => (
              <Badge key={value} variant="secondary" className="text-xs">
                {value}
              </Badge>
            ))}
            {values.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{values.length - 3} more
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'usageCount',
      header: 'Usage Count',
      cell: ({ row }: any) => (
        <div className="text-center">{row.getValue('usageCount')}</div>
      )
    },
    {
      accessorKey: 'isRequired',
      header: 'Required',
      cell: ({ row }: any) => (
        <Badge variant={row.getValue('isRequired') ? 'default' : 'secondary'}>
          {row.getValue('isRequired') ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleEdit = (schema: AttributeSchema) => {
    setEditingSchema(schema);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    setSchemas(schemas.filter(s => s.id !== id));
  };

  const handleCreate = () => {
    setEditingSchema({
      id: '',
      key: '',
      displayName: '',
      dataType: 'string',
      allowedValues: undefined,
      isRequired: false,
      description: '',
      usageCount: 0
    });
    setIsCreating(true);
  };

  const SchemaEditor: React.FC<{ schema: AttributeSchema }> = ({ schema }) => {
    const [formData, setFormData] = useState(schema);

    return (
      <Card className="border-primary mb-6">
        <CardHeader>
          <CardTitle>{isCreating ? 'Create Attribute Schema' : 'Edit Attribute Schema'}</CardTitle>
          <CardDescription>
            Define the structure and validation rules for user attributes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="key">Attribute Key</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                placeholder="e.g., department, job_title"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., Department, Job Title"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataType">Data Type</Label>
              <select
                id="dataType"
                value={formData.dataType}
                onChange={(e) => setFormData(prev => ({ ...prev, dataType: e.target.value as any }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRequired"
                checked={formData.isRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
              />
              <Label htmlFor="isRequired">Required Attribute</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe how this attribute is used"
            />
          </div>

          <div>
            <Label htmlFor="allowedValues">Allowed Values (comma-separated)</Label>
            <Input
              id="allowedValues"
              value={formData.allowedValues?.join(', ') || ''}
              onChange={(e) => {
                const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                setFormData(prev => ({ ...prev, allowedValues: values.length > 0 ? values : undefined }));
              }}
              placeholder="e.g., hr, finance, engineering (leave empty for any value)"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => {
              if (isCreating) {
                setSchemas([...schemas, { ...formData, id: Date.now().toString() }]);
              } else {
                setSchemas(schemas.map(s => s.id === formData.id ? formData : s));
              }
              setEditingSchema(null);
              setIsCreating(false);
            }}>
              <Database className="h-4 w-4 mr-2" />
              Save Schema
            </Button>
            <Button variant="outline" onClick={() => {
              setEditingSchema(null);
              setIsCreating(false);
            }}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Attribute Schema Manager</h2>
          <p className="text-muted-foreground">
            Define and manage the structure of user attributes for permission rules
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schema
        </Button>
      </div>

      {editingSchema && <SchemaEditor schema={editingSchema} />}

      <Card>
        <CardHeader>
          <CardTitle>Attribute Schemas</CardTitle>
          <CardDescription>
            All defined attribute schemas with their validation rules and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={schemas}
            searchKey="key"
            searchPlaceholder="Search by attribute key..."
          />
        </CardContent>
      </Card>
    </div>
  );
};