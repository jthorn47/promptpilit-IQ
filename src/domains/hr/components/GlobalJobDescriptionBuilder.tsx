import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  ArrowLeft, 
  FileText,
  Lightbulb,
  Bot
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobalJobTitles } from '@/hooks/useGlobalJobTitles';
import { useGlobalJobDescriptions, GlobalJobDescription } from '@/hooks/useGlobalJobTitles';

export const GlobalJobDescriptionBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { titleId } = useParams<{ titleId: string }>();
  const { jobTitles } = useGlobalJobTitles();
  const { fetchJobDescription, createJobDescription, updateJobDescription } = useGlobalJobDescriptions();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingDescription, setExistingDescription] = useState<GlobalJobDescription | null>(null);
  const [jobTitle, setJobTitle] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    summary: '',
    duties: [''] as string[],
    supervisory: false,
    supervisory_details: '',
    skills_qualifications: '',
    flsa_classification: 'non_exempt' as 'exempt' | 'non_exempt',
    physical_requirements: '',
    work_environment: '',
    notes: '',
  });

  useEffect(() => {
    if (titleId) {
      // Find the job title
      const title = jobTitles.find(jt => jt.id === titleId);
      setJobTitle(title);

      // Load existing job description if it exists
      loadJobDescription();
    }
  }, [titleId, jobTitles]);

  const loadJobDescription = async () => {
    if (!titleId) return;

    try {
      setLoading(true);
      const description = await fetchJobDescription(titleId);
      
      if (description) {
        setExistingDescription(description as GlobalJobDescription);
        setFormData({
          summary: description.summary,
          duties: Array.isArray(description.duties) ? description.duties.filter(d => typeof d === 'string') : [''],
          supervisory: description.supervisory,
          supervisory_details: description.supervisory_details || '',
          skills_qualifications: description.skills_qualifications,
          flsa_classification: description.flsa_classification,
          physical_requirements: description.physical_requirements || '',
          work_environment: description.work_environment || '',
          notes: description.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading job description:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!titleId) return;

    setSaving(true);
    try {
      const descriptionData = {
        job_title_id: titleId,
        summary: formData.summary,
        duties: formData.duties.filter(duty => duty.trim() !== ''),
        supervisory: formData.supervisory,
        supervisory_details: formData.supervisory_details,
        skills_qualifications: formData.skills_qualifications,
        flsa_classification: formData.flsa_classification,
        physical_requirements: formData.physical_requirements,
        work_environment: formData.work_environment,
        notes: formData.notes,
      };

      if (existingDescription) {
        await updateJobDescription(existingDescription.id, descriptionData);
      } else {
        await createJobDescription(descriptionData);
      }

      navigate('/admin/hr-tools/job-titles');
    } catch (error) {
      console.error('Error saving job description:', error);
    } finally {
      setSaving(false);
    }
  };

  const addDuty = () => {
    setFormData(prev => ({
      ...prev,
      duties: [...prev.duties, '']
    }));
  };

  const updateDuty = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      duties: prev.duties.map((duty, i) => i === index ? value : duty)
    }));
  };

  const removeDuty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      duties: prev.duties.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job description...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/admin/hr-tools/job-titles')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Titles
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Job Description Builder
            </h2>
            {jobTitle && (
              <p className="text-muted-foreground">
                {existingDescription ? 'Editing' : 'Creating'} description for: {jobTitle.title_name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled // Placeholder for future AI feature
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Suggestions
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
            disabled={saving || !formData.summary.trim() || !formData.skills_qualifications.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Description'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Provide a brief overview of the role, its purpose, and key objectives..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Duties & Responsibilities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Duties & Responsibilities</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addDuty}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Duty
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.duties.map((duty, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex items-center mt-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={duty}
                      onChange={(e) => updateDuty(index, e.target.value)}
                      placeholder={`Duty ${index + 1}...`}
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDuty(index)}
                    disabled={formData.duties.length === 1}
                    className="mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {formData.duties.length === 1 && formData.duties[0] === '' && (
                <div className="text-center py-4 text-muted-foreground">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                  <p>Add detailed responsibilities and duties for this role</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supervisory Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supervisory Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="supervisory"
                  checked={formData.supervisory}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, supervisory: checked }))}
                />
                <Label htmlFor="supervisory">This position has supervisory duties</Label>
              </div>
              
              {formData.supervisory && (
                <div className="space-y-2">
                  <Label htmlFor="supervisory_details">Supervisory Details</Label>
                  <Textarea
                    id="supervisory_details"
                    value={formData.supervisory_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, supervisory_details: e.target.value }))}
                    placeholder="Describe the supervisory responsibilities, number of direct reports, management duties..."
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills & Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Skills & Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills_qualifications">Skills & Qualifications *</Label>
                <Textarea
                  id="skills_qualifications"
                  value={formData.skills_qualifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills_qualifications: e.target.value }))}
                  placeholder="List required education, experience, certifications, technical skills, soft skills..."
                  rows={5}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="physical_requirements">Physical Requirements</Label>
                <Textarea
                  id="physical_requirements"
                  value={formData.physical_requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, physical_requirements: e.target.value }))}
                  placeholder="Describe any physical requirements (lifting, standing, computer work, etc.)..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_environment">Work Environment</Label>
                <Textarea
                  id="work_environment"
                  value={formData.work_environment}
                  onChange={(e) => setFormData(prev => ({ ...prev, work_environment: e.target.value }))}
                  placeholder="Describe the work environment (office, remote, warehouse, outdoor, etc.)..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information, special considerations, or notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* FLSA Classification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flsa_classification">FLSA Classification *</Label>
                <Select
                  value={formData.flsa_classification}
                  onValueChange={(value: 'exempt' | 'non_exempt') => 
                    setFormData(prev => ({ ...prev, flsa_classification: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exempt">Exempt</SelectItem>
                    <SelectItem value="non_exempt">Non-Exempt</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.flsa_classification === 'exempt' 
                    ? 'Not eligible for overtime pay'
                    : 'Eligible for overtime pay'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Job Title Info */}
          {jobTitle && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Title Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm">{jobTitle.title_name}</p>
                </div>
                
                {jobTitle.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{jobTitle.description}</p>
                  </div>
                )}

                {jobTitle.category_tags?.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Categories</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {jobTitle.category_tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {jobTitle.workers_comp_code && (
                  <div>
                    <Label className="text-sm font-medium">Workers' Comp Code</Label>
                    <Badge variant="outline" className="mt-1">
                      {jobTitle.workers_comp_code.code}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions Placeholder */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">AI-powered suggestions will be available here in a future update</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};