import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HaaLODataGrid } from '@/modules/HaaLO.Shared/components';
import { 
  Plus, 
  Edit, 
  Wand2, 
  Building, 
  Calendar,
  Users,
  Filter,
  Search
} from 'lucide-react';
import { useJobTitles } from '../hooks/useJobTitles';
import { JobDescriptionEditor } from '../components/JobDescriptionEditor';
import { JobTitle, WorkersCompCode, JOB_CATEGORIES, CreateJobTitleRequest, UpdateJobTitleRequest } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkersCompCodesResponse {
  workersCompCodes: WorkersCompCode[];
}

export const GlobalJobTitles: React.FC = () => {
  const { jobTitles, categories, loading, createJobTitle, updateJobTitle, generateJobDescription, attachJobDescription } = useJobTitles({
    is_global: true,
    include_descriptions: true
  });

  const [wcCodes, setWcCodes] = useState<WorkersCompCode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState<JobTitle | null>(null);
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false);
  const [selectedJobTitleForDescription, setSelectedJobTitleForDescription] = useState<JobTitle | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title_name: '',
    wc_code_id: '',
    category: '',
    is_available_for_clients: true,
    description: ''
  });

  useEffect(() => {
    fetchWorkerCompCodes();
  }, []);

  const fetchWorkerCompCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('workers_comp_codes')
        .select('id, code, description')
        .order('code');

      if (error) throw error;
      setWcCodes(data || []);
    } catch (error) {
      console.error('Error fetching WC codes:', error);
      toast.error('Failed to load Workers\' Comp codes');
    }
  };

  const filteredJobTitles = jobTitles.filter(jt => {
    const matchesSearch = jt.title_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || jt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      title_name: '',
      wc_code_id: '',
      category: '',
      is_available_for_clients: true,
      description: ''
    });
  };

  const handleCreateJobTitle = async () => {
    try {
      const createData: CreateJobTitleRequest = {
        ...formData,
        is_global: true,
        is_available_for_clients: formData.is_available_for_clients
      };

      await createJobTitle(createData);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleEditJobTitle = async () => {
    if (!editingJobTitle) return;

    try {
      const updateData: UpdateJobTitleRequest = {
        job_title_id: editingJobTitle.id,
        title_name: formData.title_name,
        wc_code_id: formData.wc_code_id || undefined,
        category: formData.category || undefined,
        is_available_for_clients: formData.is_available_for_clients
      };

      await updateJobTitle(updateData);
      setEditingJobTitle(null);
      resetForm();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const openEditDialog = (jobTitle: JobTitle) => {
    setEditingJobTitle(jobTitle);
    setFormData({
      title_name: jobTitle.title_name,
      wc_code_id: jobTitle.wc_code_id || '',
      category: jobTitle.category || '',
      is_available_for_clients: jobTitle.is_available_for_clients,
      description: jobTitle.job_descriptions?.[0]?.description || ''
    });
  };

  const openDescriptionEditor = (jobTitle: JobTitle) => {
    setSelectedJobTitleForDescription(jobTitle);
    setShowDescriptionEditor(true);
  };

  const handleSaveDescription = async (description: string, isAiGenerated: boolean) => {
    if (!selectedJobTitleForDescription) return;

    await attachJobDescription(selectedJobTitleForDescription.id, description, isAiGenerated);
    setShowDescriptionEditor(false);
    setSelectedJobTitleForDescription(null);
  };

  const columns = [
    {
      key: 'title_name',
      title: 'Job Title',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (value: string) => {
        return value ? (
          <Badge variant="secondary">{value}</Badge>
        ) : (
          <span className="text-muted-foreground">Uncategorized</span>
        );
      },
    },
    {
      key: 'workers_comp_codes',
      title: 'WC Code',
      render: (value: WorkersCompCode | undefined) => {
        return value ? (
          <div className="text-sm">
            <div className="font-medium">{value.code}</div>
            <div className="text-muted-foreground truncate max-w-48" title={value.description}>
              {value.description}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">None assigned</span>
        );
      },
    },
    {
      key: 'is_available_for_clients',
      title: 'Available',
      sortable: true,
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'job_descriptions',
      title: 'Description',
      render: (value: any[]) => {
        const hasDescription = value && value.length > 0;
        return (
          <Badge variant={hasDescription ? 'default' : 'outline'}>
            {hasDescription ? 'Has Description' : 'No Description'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, record: JobTitle) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(record)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDescriptionEditor(record)}
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Global Job Titles Library</h1>
          <p className="text-muted-foreground">
            Manage system-wide job titles available to all clients
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Job Title
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job titles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {JOB_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Titles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Titles ({filteredJobTitles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <HaaLODataGrid
            columns={columns}
            data={filteredJobTitles}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={showCreateDialog || editingJobTitle !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingJobTitle(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingJobTitle ? 'Edit Job Title' : 'Create New Job Title'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title_name">Job Title Name *</Label>
              <Input
                id="title_name"
                value={formData.title_name}
                onChange={(e) => setFormData({ ...formData, title_name: e.target.value })}
                placeholder="e.g., Software Engineer, Construction Manager"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wc_code_id">Workers' Comp Code</Label>
                <Select value={formData.wc_code_id} onValueChange={(value) => setFormData({ ...formData, wc_code_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select WC code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No WC code</SelectItem>
                    {wcCodes.map(code => (
                      <SelectItem key={code.id} value={code.id}>
                        {code.code} - {code.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_available_for_clients"
                checked={formData.is_available_for_clients}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available_for_clients: checked })}
              />
              <Label htmlFor="is_available_for_clients">Available for Client Use</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingJobTitle(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingJobTitle ? handleEditJobTitle : handleCreateJobTitle}
                disabled={!formData.title_name.trim()}
              >
                {editingJobTitle ? 'Update' : 'Create'} Job Title
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Description Editor Dialog */}
      {showDescriptionEditor && selectedJobTitleForDescription && (
        <Dialog open={showDescriptionEditor} onOpenChange={setShowDescriptionEditor}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Job Description Editor</DialogTitle>
            </DialogHeader>
            <JobDescriptionEditor
              jobTitle={selectedJobTitleForDescription.title_name}
              wcCodeDescription={selectedJobTitleForDescription.workers_comp_codes?.description}
              initialDescription={selectedJobTitleForDescription.job_descriptions?.[0]?.description || ''}
              isAiGenerated={selectedJobTitleForDescription.job_descriptions?.[0]?.is_ai_generated || false}
              onSave={handleSaveDescription}
              onCancel={() => setShowDescriptionEditor(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};