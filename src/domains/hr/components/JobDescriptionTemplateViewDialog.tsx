import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { JobDescriptionTemplate } from '@/hooks/useJobDescriptionTemplates';
import { 
  Copy, 
  X, 
  FileText, 
  Users, 
  GraduationCap, 
  Briefcase, 
  DollarSign,
  MapPin,
  Clock,
  Award,
  Target,
  CheckCircle
} from 'lucide-react';

interface JobDescriptionTemplateViewDialogProps {
  template: JobDescriptionTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyTemplate?: (template: JobDescriptionTemplate) => void;
}

export const JobDescriptionTemplateViewDialog: React.FC<JobDescriptionTemplateViewDialogProps> = ({
  template,
  isOpen,
  onClose,
  onCopyTemplate
}) => {
  if (!template) return null;

  const handleCopyTemplate = () => {
    if (onCopyTemplate) {
      onCopyTemplate(template);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <DialogTitle className="text-xl">{template.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{template.department}</Badge>
                  <Badge variant="secondary">{template.level}</Badge>
                  {template.flsa_classification && (
                    <Badge variant={template.flsa_classification === 'exempt' ? 'default' : 'secondary'}>
                      {template.flsa_classification}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCopyTemplate} size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Use Template
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="px-6 py-4 space-y-6">
            
            {/* Job Summary */}
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                Job Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed">{template.summary}</p>
            </section>

            <Separator />

            {/* Key Responsibilities */}
            {template.key_responsibilities && template.key_responsibilities.length > 0 && (
              <>
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-primary" />
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {template.key_responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <Separator />
              </>
            )}

            {/* Required Qualifications */}
            {template.required_qualifications && template.required_qualifications.length > 0 && (
              <>
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Required Qualifications
                  </h3>
                  <ul className="space-y-2">
                    {template.required_qualifications.map((qualification, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <Separator />
              </>
            )}

            {/* Preferred Qualifications */}
            {template.preferred_qualifications && template.preferred_qualifications.length > 0 && (
              <>
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-primary" />
                    Preferred Qualifications
                  </h3>
                  <ul className="space-y-2">
                    {template.preferred_qualifications.map((qualification, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <Separator />
              </>
            )}

            {/* Skills Required */}
            {template.skills_required && template.skills_required.length > 0 && (
              <>
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {template.skills_required.map((skill, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* Skills Preferred */}
            {template.skills_preferred && template.skills_preferred.length > 0 && (
              <>
                <section>
                  <h3 className="text-lg font-semibold mb-3">Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.skills_preferred.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* Job Details */}
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary" />
                Job Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {template.education_level && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Education:</span>
                    <span className="text-muted-foreground">{template.education_level}</span>
                  </div>
                )}
                {(template.experience_years_min !== undefined || template.experience_years_max !== undefined) && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Experience:</span>
                    <span className="text-muted-foreground">
                      {template.experience_years_min !== undefined && template.experience_years_max !== undefined
                        ? `${template.experience_years_min}-${template.experience_years_max} years`
                        : template.experience_years_min !== undefined
                          ? `${template.experience_years_min}+ years`
                          : 'Not specified'
                      }
                    </span>
                  </div>
                )}
                {(template.salary_min || template.salary_max) && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Salary Range:</span>
                    <span className="text-muted-foreground">
                      {template.salary_min && template.salary_max
                        ? `${template.salary_currency || '$'}${template.salary_min?.toLocaleString()} - ${template.salary_currency || '$'}${template.salary_max?.toLocaleString()}`
                        : template.salary_min
                          ? `${template.salary_currency || '$'}${template.salary_min?.toLocaleString()}+`
                          : 'Competitive'
                      }
                    </span>
                  </div>
                )}
                {template.employment_type && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Employment Type:</span>
                    <span className="text-muted-foreground">{template.employment_type}</span>
                  </div>
                )}
                {template.work_arrangement && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Work Arrangement:</span>
                    <span className="text-muted-foreground">{template.work_arrangement}</span>
                  </div>
                )}
                {template.travel_percentage !== undefined && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Travel Required:</span>
                    <span className="text-muted-foreground">{template.travel_percentage}%</span>
                  </div>
                )}
                {template.supervisory_role !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Supervisory Role:</span>
                    <span className="text-muted-foreground">{template.supervisory_role ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {(template.team_size_min || template.team_size_max) && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Team Size:</span>
                    <span className="text-muted-foreground">
                      {template.team_size_min && template.team_size_max
                        ? `${template.team_size_min}-${template.team_size_max} people`
                        : template.team_size_min
                          ? `${template.team_size_min}+ people`
                          : 'Not specified'
                      }
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Benefits Highlights */}
            {template.benefits_highlights && template.benefits_highlights.length > 0 && (
              <>
                <Separator />
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-primary" />
                    Benefits Highlights
                  </h3>
                  <ul className="space-y-2">
                    {template.benefits_highlights.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {/* Performance Metrics */}
            {template.performance_metrics && template.performance_metrics.length > 0 && (
              <>
                <Separator />
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-primary" />
                    Performance Metrics
                  </h3>
                  <ul className="space-y-2">
                    {template.performance_metrics.map((metric, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{metric}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {/* Additional Information */}
            {(template.physical_requirements || template.work_environment || template.career_progression) && (
              <>
                <Separator />
                <section>
                  <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                  <div className="space-y-4">
                    {template.physical_requirements && (
                      <div>
                        <h4 className="font-medium mb-1">Physical Requirements</h4>
                        <p className="text-muted-foreground text-sm">{template.physical_requirements}</p>
                      </div>
                    )}
                    {template.work_environment && (
                      <div>
                        <h4 className="font-medium mb-1">Work Environment</h4>
                        <p className="text-muted-foreground text-sm">{template.work_environment}</p>
                      </div>
                    )}
                    {template.career_progression && (
                      <div>
                        <h4 className="font-medium mb-1">Career Progression</h4>
                        <p className="text-muted-foreground text-sm">{template.career_progression}</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* Certifications */}
            {((template.certifications_required && template.certifications_required.length > 0) || 
              (template.certifications_preferred && template.certifications_preferred.length > 0)) && (
              <>
                <Separator />
                <section>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-primary" />
                    Certifications
                  </h3>
                  {template.certifications_required && template.certifications_required.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Required Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.certifications_required.map((cert, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {template.certifications_preferred && template.certifications_preferred.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Preferred Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.certifications_preferred.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};