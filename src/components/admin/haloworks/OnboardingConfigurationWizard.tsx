import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useOnboardingConfig, LanguageOption } from '@/hooks/useOnboardingConfig';
import { 
  Settings, 
  FileText, 
  GraduationCap, 
  FormInput, 
  Loader2, 
  CheckCircle,
  Globe,
  Video,
  Calendar,
  Shield,
  Users
} from 'lucide-react';

interface OnboardingConfigurationWizardProps {
  clientId: string;
}

export const OnboardingConfigurationWizard: React.FC<OnboardingConfigurationWizardProps> = ({ 
  clientId 
}) => {
  const { 
    config, 
    documents, 
    trainingAssignments, 
    customFields, 
    isLoading, 
    updateField, 
    isUpdating 
  } = useOnboardingConfig(clientId);

  const [openSections, setOpenSections] = useState<string[]>(['welcome']);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading onboarding configuration...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load onboarding configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Onboarding Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Customize the onboarding experience for new employees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isUpdating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Auto-Save Enabled
          </Badge>
        </div>
      </div>

      {/* Configuration Wizard */}
      <Accordion 
        type="multiple" 
        value={openSections} 
        onValueChange={setOpenSections}
        className="space-y-4"
      >
        {/* Welcome & Introduction */}
        <AccordionItem value="welcome" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Welcome & Introduction</h3>
                <p className="text-sm text-muted-foreground">
                  Set up welcome messages and introduction content
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="welcome-text">Welcome Message</Label>
                <Textarea
                  id="welcome-text"
                  placeholder="Welcome to our team! We're excited to have you aboard..."
                  value={config.welcome_text || ''}
                  onChange={(e) => updateField('welcome_text', e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  This message will be displayed prominently on the employee's onboarding dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intro-video">Introduction Video URL</Label>
                <div className="flex gap-2">
                  <Video className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="intro-video"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={config.intro_video_url || ''}
                    onChange={(e) => updateField('intro_video_url', e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional welcome video from leadership or HR team.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Language Options</Label>
                <Select 
                  value={config.language_toggle} 
                  onValueChange={(value: LanguageOption) => updateField('language_toggle', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN">English Only</SelectItem>
                    <SelectItem value="ES">Spanish Only</SelectItem>
                    <SelectItem value="BOTH">Both English & Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Next Steps & Communication */}
        <AccordionItem value="next-steps" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-md">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Next Steps & Communication</h3>
                <p className="text-sm text-muted-foreground">
                  Configure follow-up communications and next steps
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="next-steps-subject">Email Subject Line</Label>
                <Input
                  id="next-steps-subject"
                  placeholder="Next Steps in Your Onboarding Journey"
                  value={config.next_steps_subject || ''}
                  onChange={(e) => updateField('next_steps_subject', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next-steps-body">Email Body Content</Label>
                <Textarea
                  id="next-steps-body"
                  placeholder="Your manager will contact you within 24 hours to discuss your role and answer any questions..."
                  value={config.next_steps_body || ''}
                  onChange={(e) => updateField('next_steps_body', e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Orientation Calendar Link</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow employees to schedule their orientation session
                    </p>
                  </div>
                  <Switch
                    checked={config.show_orientation_calendar_link}
                    onCheckedChange={(checked) => updateField('show_orientation_calendar_link', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Employee Portal Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Grant immediate access to employee portal after onboarding
                    </p>
                  </div>
                  <Switch
                    checked={config.allow_employee_portal_access}
                    onCheckedChange={(checked) => updateField('allow_employee_portal_access', checked)}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Approval Process */}
        <AccordionItem value="approval" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-md">
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Approval Process</h3>
                <p className="text-sm text-muted-foreground">
                  Configure manager approval requirements
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Manager Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    All onboarding submissions must be approved by a manager before completion
                  </p>
                </div>
                <Switch
                  checked={config.require_manager_approval}
                  onCheckedChange={(checked) => updateField('require_manager_approval', checked)}
                />
              </div>

              {config.require_manager_approval && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Approval Required</p>
                      <p className="text-amber-700">
                        When enabled, employees cannot complete onboarding until a manager reviews and approves their submission.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Documents & Acknowledgments */}
        <AccordionItem value="documents" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-md">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Documents & Acknowledgments</h3>
                <p className="text-sm text-muted-foreground">
                  Manage required documents and acknowledgments ({documents?.length || 0} configured)
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Document management coming soon...</p>
              <p className="text-sm">Configure required forms, handbooks, and acknowledgment documents.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Training Modules */}
        <AccordionItem value="training" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-md">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Training Modules</h3>
                <p className="text-sm text-muted-foreground">
                  Assign required training courses ({trainingAssignments?.length || 0} assigned)
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Training assignment coming soon...</p>
              <p className="text-sm">Connect to LMS modules and assign required training courses.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custom Fields */}
        <AccordionItem value="custom-fields" className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-md">
                <FormInput className="h-4 w-4 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Custom Fields</h3>
                <p className="text-sm text-muted-foreground">
                  Add job-specific fields to the onboarding form ({customFields?.length || 0} fields)
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="text-center py-8 text-muted-foreground">
              <FormInput className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Custom field builder coming soon...</p>
              <p className="text-sm">Create custom fields for role-specific information collection.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Configuration changes are automatically saved</span>
        </div>
      </div>
    </div>
  );
};