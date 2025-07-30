import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  FileSignature, 
  Lock, 
  Unlock, 
  Settings, 
  Plus, 
  Building2,
  Eye,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { Department } from './UserManagement';

interface SignatureTemplate {
  id: string;
  name: string;
  department: Department;
  isLocked: boolean;
  isActive: boolean;
  editPermission: 'admin' | 'department' | 'all';
  viewPermission: 'admin' | 'department' | 'all';
  lastModified: string;
  modifiedBy: string;
  version: number;
}

interface DepartmentPermission {
  department: Department;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
  templateCount: number;
}

const mockTemplates: SignatureTemplate[] = [
  {
    id: '1',
    name: 'HR Employment Contract',
    department: 'hr',
    isLocked: true,
    isActive: true,
    editPermission: 'admin',
    viewPermission: 'department',
    lastModified: '2024-01-15',
    modifiedBy: 'John Smith',
    version: 3
  },
  {
    id: '2',
    name: 'Finance Approval Form',
    department: 'finance',
    isLocked: false,
    isActive: true,
    editPermission: 'department',
    viewPermission: 'all',
    lastModified: '2024-01-14',
    modifiedBy: 'Sarah Johnson',
    version: 1
  },
  {
    id: '3',
    name: 'Operations Safety Agreement',
    department: 'operations',
    isLocked: true,
    isActive: true,
    editPermission: 'admin',
    viewPermission: 'department',
    lastModified: '2024-01-13',
    modifiedBy: 'Mike Davis',
    version: 2
  }
];

const departments = [
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'sales', label: 'Sales' },
  { value: 'it', label: 'IT' },
  { value: 'legal', label: 'Legal' }
];

export function SignatureControls() {
  const [templates, setTemplates] = useState<SignatureTemplate[]>(mockTemplates);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  const filteredTemplates = templates.filter(template => 
    selectedDepartment === 'all' || template.department === selectedDepartment
  );

  const departmentPermissions: DepartmentPermission[] = departments.map(dept => ({
    department: dept.value as Department,
    canEdit: templates.some(t => t.department === dept.value && t.editPermission !== 'admin'),
    canView: templates.some(t => t.department === dept.value && t.viewPermission !== 'admin'),
    canCreate: !templates.some(t => t.department === dept.value && t.isLocked),
    templateCount: templates.filter(t => t.department === dept.value).length
  }));

  const handleToggleLock = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isLocked: !template.isLocked }
        : template
    ));
    toast.success('Template lock status updated');
  };

  const handleUpdateTemplate = (templateId: string, updates: Partial<SignatureTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, ...updates, version: template.version + 1, lastModified: new Date().toISOString().split('T')[0] }
        : template
    ));
    toast.success('Template updated successfully');
  };

  const handleAddTemplate = (newTemplate: Omit<SignatureTemplate, 'id' | 'lastModified' | 'version'>) => {
    const template: SignatureTemplate = {
      ...newTemplate,
      id: Date.now().toString(),
      lastModified: new Date().toISOString().split('T')[0],
      version: 1
    };
    setTemplates(prev => [...prev, template]);
    setShowAddTemplate(false);
    toast.success('Template added successfully');
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'department': return 'bg-blue-100 text-blue-800';
      case 'all': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentColor = (department: Department) => {
    const colors = {
      hr: 'bg-purple-100 text-purple-800',
      finance: 'bg-green-100 text-green-800',
      operations: 'bg-orange-100 text-orange-800',
      sales: 'bg-pink-100 text-pink-800',
      it: 'bg-indigo-100 text-indigo-800',
      legal: 'bg-yellow-100 text-yellow-800'
    };
    return colors[department];
  };

  return (
    <div className="space-y-6">
      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Department Signature Permissions
          </CardTitle>
          <CardDescription>
            Overview of signature permissions by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentPermissions.map(dept => (
              <div key={dept.department} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={getDepartmentColor(dept.department)}>
                    {departments.find(d => d.value === dept.department)?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {dept.templateCount} templates
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm">Can Edit: {dept.canEdit ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Can View: {dept.canView ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Can Create: {dept.canCreate ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signature Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Signature Templates
          </CardTitle>
          <CardDescription>
            Manage signature templates and their permissions by department
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-48">
              <Label htmlFor="department">Filter by Department</Label>
              <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value as Department | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Template</DialogTitle>
                  </DialogHeader>
                  <AddTemplateForm onSubmit={handleAddTemplate} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Templates Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Edit Permission</TableHead>
                  <TableHead>View Permission</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map(template => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Version {template.version}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getDepartmentColor(template.department)}>
                        {departments.find(d => d.value === template.department)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {template.isLocked ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                        <span className="text-sm">
                          {template.isLocked ? 'Locked' : 'Unlocked'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getPermissionColor(template.editPermission)}>
                        {template.editPermission}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getPermissionColor(template.viewPermission)}>
                        {template.viewPermission}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{template.lastModified}</div>
                        <div className="text-xs text-muted-foreground">
                          by {template.modifiedBy}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleLock(template.id)}
                        >
                          {template.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Template: {template.name}</DialogTitle>
                            </DialogHeader>
                            <EditTemplateForm 
                              template={template} 
                              onSubmit={(updates) => handleUpdateTemplate(template.id, updates)} 
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddTemplateForm({ onSubmit }: { onSubmit: (template: Omit<SignatureTemplate, 'id' | 'lastModified' | 'version'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    department: 'hr' as Department,
    isLocked: false,
    isActive: true,
    editPermission: 'department' as 'admin' | 'department' | 'all',
    viewPermission: 'department' as 'admin' | 'department' | 'all',
    modifiedBy: 'Current User'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      department: 'hr',
      isLocked: false,
      isActive: true,
      editPermission: 'department',
      viewPermission: 'department',
      modifiedBy: 'Current User'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value as Department }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isLocked"
          checked={formData.isLocked}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isLocked: checked }))}
        />
        <Label htmlFor="isLocked">Lock Template</Label>
      </div>
      <div>
        <Label htmlFor="editPermission">Edit Permission</Label>
        <Select value={formData.editPermission} onValueChange={(value) => setFormData(prev => ({ ...prev, editPermission: value as 'admin' | 'department' | 'all' }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin Only</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="all">All Users</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="viewPermission">View Permission</Label>
        <Select value={formData.viewPermission} onValueChange={(value) => setFormData(prev => ({ ...prev, viewPermission: value as 'admin' | 'department' | 'all' }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin Only</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="all">All Users</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Add Template</Button>
    </form>
  );
}

function EditTemplateForm({ template, onSubmit }: { template: SignatureTemplate; onSubmit: (updates: Partial<SignatureTemplate>) => void }) {
  const [formData, setFormData] = useState({
    name: template.name,
    department: template.department,
    isLocked: template.isLocked,
    isActive: template.isActive,
    editPermission: template.editPermission,
    viewPermission: template.viewPermission
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value as Department }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isLocked"
          checked={formData.isLocked}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isLocked: checked }))}
        />
        <Label htmlFor="isLocked">Lock Template</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div>
        <Label htmlFor="editPermission">Edit Permission</Label>
        <Select value={formData.editPermission} onValueChange={(value) => setFormData(prev => ({ ...prev, editPermission: value as 'admin' | 'department' | 'all' }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin Only</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="all">All Users</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="viewPermission">View Permission</Label>
        <Select value={formData.viewPermission} onValueChange={(value) => setFormData(prev => ({ ...prev, viewPermission: value as 'admin' | 'department' | 'all' }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin Only</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="all">All Users</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Update Template</Button>
    </form>
  );
}