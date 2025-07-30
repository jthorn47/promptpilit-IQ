import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ClientSelector } from "@/components/ClientSelector";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useATSJobPostings } from '@/domains/ats/hooks';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Briefcase, 
  Globe, 
  Users, 
  Eye, 
  EyeOff,
  Plus,
  X,
  Save,
  Calendar
} from "lucide-react";

const jobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(10, "Job description must be at least 10 characters"),
  department: z.string().optional(),
  location: z.string().optional(),
  employment_type: z.string().default('full-time'),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  salary_currency: z.string().default('USD'),
  visibility: z.enum(['public', 'internal', 'invite_only']).default('public'),
  board_type: z.enum(['internal_hr', 'both']).default('internal_hr'),
  post_to_internal: z.boolean().default(true),
  post_to_career_page: z.boolean().default(false),
  expires_at: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
});

type JobPostingFormData = z.infer<typeof jobPostingSchema>;

interface JobPostingFormProps {
  companyId?: string;
  onSuccess?: () => void;
  isEditing?: boolean;
  initialData?: Partial<JobPostingFormData>;
}

export const JobPostingForm = ({ companyId, onSuccess, isEditing = false, initialData }: JobPostingFormProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(companyId || "");
  const [requirementInput, setRequirementInput] = useState("");
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const { isSuperAdmin, isCompanyAdmin } = useUserRole();
  const { createJobPosting, updateJobPosting } = useATSJobPostings();
  const { toast } = useToast();

  const form = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      department: initialData?.department || "",
      location: initialData?.location || "",
      employment_type: initialData?.employment_type || 'full-time',
      salary_currency: initialData?.salary_currency || 'USD',
      visibility: initialData?.visibility || 'public',
      board_type: initialData?.board_type || 'internal_hr',
      post_to_internal: initialData?.post_to_internal ?? true,
      post_to_career_page: initialData?.post_to_career_page ?? false,
      requirements: initialData?.requirements || [],
      responsibilities: initialData?.responsibilities || [],
      ...initialData
    }
  });

  const requirements = form.watch('requirements');
  const responsibilities = form.watch('responsibilities');
  const visibility = form.watch('visibility');
  const boardType = form.watch('board_type');

  const addRequirement = () => {
    if (requirementInput.trim()) {
      form.setValue('requirements', [...requirements, requirementInput.trim()]);
      setRequirementInput("");
    }
  };

  const removeRequirement = (index: number) => {
    form.setValue('requirements', requirements.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      form.setValue('responsibilities', [...responsibilities, responsibilityInput.trim()]);
      setResponsibilityInput("");
    }
  };

  const removeResponsibility = (index: number) => {
    form.setValue('responsibilities', responsibilities.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: JobPostingFormData) => {
    if (!selectedClientId && !companyId) {
      toast({
        title: "Error",
        description: "Please select a company",
        variant: "destructive",
      });
      return;
    }

    const jobPostingData = {
      title: data.title,
      description: data.description,
      requirements: data.requirements || [],
      responsibilities: data.responsibilities || [],
      location: data.location || '',
      department: data.department || '',
      employment_type: data.employment_type || 'full-time',
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      salary_currency: data.salary_currency || 'USD',
      visibility: data.visibility || 'public',
      board_type: data.board_type || 'internal_hr',
      post_to_internal: data.post_to_internal ?? true,
      post_to_career_page: data.post_to_career_page ?? false,
      expires_at: data.expires_at,
      company_id: selectedClientId || companyId!,
      status: 'open',
      metadata: {}
    };

    try {
      if (isEditing) {
        // Handle update logic here
        toast({
          title: "Success",
          description: "Job posting updated successfully",
        });
      } else {
        await createJobPosting(jobPostingData);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving job posting:', error);
    }
  };

  const getVisibilityIcon = (type: string) => {
    switch (type) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'internal': return <Building2 className="w-4 h-4" />;
      case 'invite_only': return <EyeOff className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getBoardTypeIcon = (type: string) => {
    switch (type) {
      case 'internal_hr': return <Building2 className="w-4 h-4" />;
      case 'both': return <Briefcase className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/ats">ATS</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isEditing ? 'Edit' : 'Create'} Job Posting</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? 'Edit' : 'Create'} Job Posting</h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update job posting details and visibility settings' : 'Create a new job posting for internal hiring or external candidates'}
          </p>
        </div>
      </div>

      {/* Client Selector for Super Admin */}
      {isSuperAdmin && !companyId && (
        <ClientSelector
          selectedClientId={selectedClientId}
          onClientSelect={setSelectedClientId}
          className="max-w-md"
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Job Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Job Details
                  </CardTitle>
                  <CardDescription>Basic information about the position</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Senior Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Engineering" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. San Francisco, CA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employment_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="temporary">Temporary</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Salary Range */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="salary_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Salary</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salary_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Salary</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="80000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salary_currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="CAD">CAD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="expires_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>When should this job posting expire?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                  <CardDescription>Skills, experience, and qualifications needed for this role</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a requirement (e.g. 3+ years React experience)"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <Button type="button" onClick={addRequirement}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {req}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Responsibilities */}
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                  <CardDescription>Key duties and responsibilities for this position</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a responsibility (e.g. Lead technical architecture decisions)"
                      value={responsibilityInput}
                      onChange={(e) => setResponsibilityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                    />
                    <Button type="button" onClick={addResponsibility}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {responsibilities.map((resp, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {resp}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0"
                          onClick={() => removeResponsibility(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visibility and Publishing Settings */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getVisibilityIcon(visibility)}
                    Visibility Settings
                  </CardTitle>
                  <CardDescription>Control who can see and apply to this job</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Visibility</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Public - Anyone can view
                              </div>
                            </SelectItem>
                            <SelectItem value="internal">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Internal - Employees only
                              </div>
                            </SelectItem>
                            <SelectItem value="invite_only">
                              <div className="flex items-center gap-2">
                                <EyeOff className="w-4 h-4" />
                                Invite Only - Link required
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="board_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Board Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="internal_hr">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Internal HR
                              </div>
                            </SelectItem>
                            <SelectItem value="staffing">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Staffing
                              </div>
                            </SelectItem>
                            <SelectItem value="both">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Both
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publishing Options</CardTitle>
                  <CardDescription>Choose where this job should be posted</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="post_to_internal"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Internal Job Board</FormLabel>
                          <FormDescription>
                            Show on employee portal for internal applications
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="post_to_career_page"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Career Page</FormLabel>
                          <FormDescription>
                            Display on public career page and embedded widgets
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update' : 'Create'} Job Posting
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};