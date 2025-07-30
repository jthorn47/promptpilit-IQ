import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClientJobTitles, type ClientJobTitle, type WorkersCompCode } from '@/hooks/useClientJobTitles';
import { useGlobalJobTitles } from '@/hooks/useGlobalJobTitles';
import { Shield, FileText, Calendar, Briefcase } from 'lucide-react';

interface ClientJobTitleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  mode: 'create' | 'edit';
  jobTitle?: ClientJobTitle;
}

export const ClientJobTitleFormDialog = ({
  open,
  onOpenChange,
  clientId,
  mode,
  jobTitle
}: ClientJobTitleFormDialogProps) => {
  const { createJobTitle, updateJobTitle, fetchAvailableWCCodes } = useClientJobTitles(clientId);
  const { jobDescriptions } = useGlobalJobTitles();
  const [loading, setLoading] = useState(false);
  const [wcCodes, setWcCodes] = useState<WorkersCompCode[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [wcCodeId, setWcCodeId] = useState('');
  const [useJobDescription, setUseJobDescription] = useState(false);
  const [jobDescriptionId, setJobDescriptionId] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  useEffect(() => {
    if (open) {
      // Load WC codes
      fetchAvailableWCCodes().then(setWcCodes);
      
      // Reset form
      if (mode === 'create') {
        setTitle('');
        setEffectiveDate('');
        setWcCodeId('');
        setUseJobDescription(false);
        setJobDescriptionId('');
        setCustomDescription('');
      } else if (mode === 'edit' && jobTitle) {
        setTitle(jobTitle.title);
        setEffectiveDate(jobTitle.effective_date);
        setWcCodeId(jobTitle.wc_code_id);
        setUseJobDescription(!!jobTitle.job_description_id || !!jobTitle.custom_description);
        setJobDescriptionId(jobTitle.job_description_id || '');
        setCustomDescription(jobTitle.custom_description || '');
      }
    }
  }, [open, mode, jobTitle, fetchAvailableWCCodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        title,
        effective_date: effectiveDate,
        wc_code_id: wcCodeId,
        job_description_id: useJobDescription && jobDescriptionId ? jobDescriptionId : undefined,
        custom_description: useJobDescription && !jobDescriptionId ? customDescription : undefined,
      };

      if (mode === 'create') {
        await createJobTitle({
          client_id: clientId,
          ...formData
        });
      } else if (mode === 'edit' && jobTitle) {
        await updateJobTitle(jobTitle.id, formData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving job title:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedWcCode = wcCodes.find(wc => wc.id === wcCodeId);
  const selectedJobDescription = jobDescriptions.find(jd => jd.id === jobDescriptionId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {mode === 'create' ? 'Create Job Title' : 'Edit Job Title'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new job title with workers\' compensation code assignment.'
              : 'Update the job title details and assignments.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter job title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Effective Date *
                </Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Workers' Compensation Code */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Workers' Compensation Code *
              </CardTitle>
              <CardDescription>
                Select the appropriate workers' compensation code for this job title.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={wcCodeId} onValueChange={setWcCodeId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select workers' comp code" />
                </SelectTrigger>
                <SelectContent>
                  {wcCodes.map((wcCode) => (
                    <SelectItem key={wcCode.id} value={wcCode.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{wcCode.code} - {wcCode.description}</span>
                        <Badge variant="outline" className="ml-2">
                          ${wcCode.rate}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedWcCode && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    Selected: {selectedWcCode.code}
                  </p>
                  <p className="text-xs text-green-700">
                    {selectedWcCode.description} - Rate: ${selectedWcCode.rate}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Job Description (Optional)
              </CardTitle>
              <CardDescription>
                Add a job description by selecting from templates or writing a custom description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="useJobDescription"
                  checked={useJobDescription}
                  onCheckedChange={setUseJobDescription}
                />
                <Label htmlFor="useJobDescription">Add job description</Label>
              </div>

              {useJobDescription && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobDescriptionId">Template (Optional)</Label>
                    <Select value={jobDescriptionId} onValueChange={setJobDescriptionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select from template library" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobDescriptions.map((jd) => (
                          <SelectItem key={jd.id} value={jd.id}>
                            {jd.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedJobDescription && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">
                        Template: {selectedJobDescription.title}
                      </p>
                      <p className="text-xs text-blue-700 mt-1 line-clamp-3">
                        {selectedJobDescription.description}
                      </p>
                    </div>
                  )}

                  {!jobDescriptionId && (
                    <div className="space-y-2">
                      <Label htmlFor="customDescription">Custom Description</Label>
                      <Textarea
                        id="customDescription"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="Write a custom job description..."
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title || !effectiveDate || !wcCodeId}>
              {loading ? 'Saving...' : (mode === 'create' ? 'Create Job Title' : 'Update Job Title')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};