import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, Calendar, Shield, Edit, Trash2 } from 'lucide-react';
import { useClientJobTitles } from '@/hooks/useClientJobTitles';
import { ClientJobTitleFormDialog } from './ClientJobTitleFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ClientJobTitlesTabProps {
  clientId: string;
}

export const ClientJobTitlesTab = ({ clientId }: ClientJobTitlesTabProps) => {
  const { jobTitles, loading, deleteJobTitle } = useClientJobTitles(clientId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState<any>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async (id: string) => {
    await deleteJobTitle(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Job Titles</h3>
          <p className="text-sm text-muted-foreground">
            Manage job titles with workers' compensation codes for this client
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job Title
        </Button>
      </div>

      {/* Job Titles List */}
      <div className="grid gap-4">
        {jobTitles.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No Job Titles</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by creating your first job title with a workers' compensation code.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job Title
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          jobTitles.map((jobTitle) => (
            <Card key={jobTitle.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{jobTitle.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Effective: {formatDate(jobTitle.effective_date)}
                      </span>
                      {jobTitle.workers_comp_codes && (
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          WC Code: {jobTitle.workers_comp_codes.code}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingJobTitle(jobTitle)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job Title</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{jobTitle.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(jobTitle.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Workers Comp Code Details */}
                  {jobTitle.workers_comp_codes && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {jobTitle.workers_comp_codes.code} - {jobTitle.workers_comp_codes.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rate: ${jobTitle.workers_comp_codes.rate}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        WC Assigned
                      </Badge>
                    </div>
                  )}

                  {/* Job Description */}
                  {(jobTitle.global_job_descriptions || jobTitle.custom_description) && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-700 mb-1">Job Description</p>
                      {jobTitle.global_job_descriptions ? (
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            {jobTitle.global_job_descriptions.title}
                          </p>
                          <p className="text-xs text-blue-600 mt-1 line-clamp-2">
                            {jobTitle.global_job_descriptions.description}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-blue-800 line-clamp-2">
                          {jobTitle.custom_description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <ClientJobTitleFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        clientId={clientId}
        mode="create"
      />

      {/* Edit Dialog */}
      {editingJobTitle && (
        <ClientJobTitleFormDialog
          open={!!editingJobTitle}
          onOpenChange={(open) => !open && setEditingJobTitle(null)}
          clientId={clientId}
          mode="edit"
          jobTitle={editingJobTitle}
        />
      )}
    </div>
  );
};