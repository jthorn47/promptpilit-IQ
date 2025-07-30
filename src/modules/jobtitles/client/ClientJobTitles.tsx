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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Wand2, 
  Building, 
  Calendar,
  Users,
  Filter,
  Search,
  Globe
} from 'lucide-react';
import { useJobTitles } from '../hooks/useJobTitles';
import { JobDescriptionEditor } from '../components/JobDescriptionEditor';
import { JobTitle, WorkersCompCode, CreateJobTitleRequest, UpdateJobTitleRequest } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ClientJobTitles: React.FC = () => {
  const { user } = useAuth();
  const [userCompanyId, setUserCompanyId] = useState<string>('');

  // Get both global and client-specific job titles
  const { 
    jobTitles: globalJobTitles, 
    loading: globalLoading 
  } = useJobTitles({
    is_global: true,
    include_descriptions: true
  });

  const { 
    jobTitles: clientJobTitles, 
    loading: clientLoading, 
    createJobTitle, 
    updateJobTitle, 
    attachJobDescription 
  } = useJobTitles({
    is_global: false,
    client_id: userCompanyId,
    include_descriptions: true
  });

  const [wcCodes, setWcCodes] = useState<WorkersCompCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState<JobTitle | null>(null);
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false);
  const [selectedJobTitleForDescription, setSelectedJobTitleForDescription] = useState<JobTitle | null>(null);
  const [createJobDescription, setCreateJobDescription] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title_name: '',
    wc_code_id: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    getUserCompany();
  }, [user]);

  useEffect(() => {
    if (userCompanyId) {
      fetchClientWorkerCompCodes();
    }
  }, [userCompanyId]);

  const getUserCompany = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data?.company_id) {
        setUserCompanyId(data.company_id);
      }
    } catch (error) {
      console.error('Error getting user company:', error);
    }
  };

  const fetchClientWorkerCompCodes = async () => {
    try {
      // Mock implementation since workers_comp_codes table may not exist
      console.log('fetchClientWorkerCompCodes: Using mock data');
      const mockWcCodes = [
        { id: '1', code: 'WC001', description: 'Office Work' },
        { id: '2', code: 'WC002', description: 'Manufacturing' }
      ];
      setWcCodes(mockWcCodes);
    } catch (error) {
      console.error('Error fetching client WC codes:', error);
      // Use fallback mock data
      setWcCodes([
        { id: '1', code: 'WC001', description: 'Office Work' },
        { id: '2', code: 'WC002', description: 'Manufacturing' }
      ]);
    }
  };

  const filteredGlobalJobTitles = globalJobTitles.filter(jt => 
    jt.is_available_for_clients && 
    jt.title_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClientJobTitles = clientJobTitles.filter(jt => 
    jt.title_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title_name: '',
      wc_code_id: '',
      start_date: '',
      end_date: '',
      description: ''
    });
    setCreateJobDescription(false);
  };

  const handleCreateJobTitle = async () => {
    try {
      const createData: CreateJobTitleRequest = {
        ...formData,
        client_id: userCompanyId,
        is_global: false,
        description: createJobDescription ? formData.description : undefined
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
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        description: formData.description || undefined
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
      start_date: jobTitle.start_date || '',
      end_date: jobTitle.end_date || '',
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
      key: 'workers_comp_codes',
      title: 'WC Code',
      render: (value: WorkersCompCode | undefined) => {
        return value ? (
          <div className="text-sm">
            <div className="font-medium">{value.code}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">None assigned</span>
        );
      },
    },
    {
      key: 'start_date',
      title: 'Start Date',
      sortable: true,
      render: (value: string) => {
        return value ? new Date(value).toLocaleDateString() : '-';
      },
    },
    {
      key: 'end_date',
      title: 'End Date',
      sortable: true,
      render: (value: string) => {
        return value ? new Date(value).toLocaleDateString() : 'Active';
      },
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
      render: (value: any, record: JobTitle) => {
        const isClientTitle = !record.is_global;
        return (
          <div className="flex gap-2">
            {isClientTitle && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(record)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDescriptionEditor(record)}
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const loading = globalLoading || clientLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Titles</h1>
          <p className="text-muted-foreground">
            Manage your company's job titles and descriptions
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search job titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Titles Tables */}
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company" className="gap-2">
            <Building className="h-4 w-4" />
            Company Job Titles ({filteredClientJobTitles.length})
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" />
            Global Library ({filteredGlobalJobTitles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Your Company's Job Titles</CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={columns}
                data={filteredClientJobTitles}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle>Available Global Job Titles</CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={columns}
                data={filteredGlobalJobTitles}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

            <div className="space-y-2">
              <Label htmlFor="wc_code_id">Workers' Comp Code *</Label>
              <Select value={formData.wc_code_id} onValueChange={(value) => setFormData({ ...formData, wc_code_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select WC code" />
                </SelectTrigger>
                <SelectContent>
                  {wcCodes.map(code => (
                    <SelectItem key={code.id} value={code.id}>
                      {code.code} - {code.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            {!editingJobTitle && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create_job_description"
                    checked={createJobDescription}
                    onCheckedChange={setCreateJobDescription}
                  />
                  <Label htmlFor="create_job_description">
                    Would you like to create a job description?
                  </Label>
                </div>

                {createJobDescription && (
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description (Optional)</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter job description or leave blank to create later..."
                      rows={4}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    />
                    <p className="text-sm text-muted-foreground">
                      You can also use the AI-powered editor after creating the job title.
                    </p>
                  </div>
                )}
              </div>
            )}

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
                disabled={!formData.title_name.trim() || !formData.wc_code_id || (!editingJobTitle && !formData.start_date)}
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