import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, User } from "lucide-react";
import { CaseTemplate } from '@/hooks/useCaseTemplates';

interface TemplatePreviewModalProps {
  template: CaseTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate?: (template: CaseTemplate) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  open,
  onOpenChange,
  onUseTemplate
}) => {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {template.name}
            <Badge variant="outline">{template.category}</Badge>
          </DialogTitle>
          <DialogDescription>
            {template.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">{template.steps?.length || 0} Steps</div>
                <div className="text-xs text-muted-foreground">Workflow steps</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">~{template.estimated_duration_days} Days</div>
                <div className="text-xs text-muted-foreground">Estimated duration</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <User className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">{template.category}</div>
                <div className="text-xs text-muted-foreground">Category</div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Steps */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Workflow Steps</h3>
            <div className="space-y-4">
              {template.steps?.map((step, index) => (
                <Card key={step.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Assigned to:</span>
                        <br />
                        <span className="text-muted-foreground">{step.assigned_to_role}</span>
                      </div>
                      <div>
                        <span className="font-medium">Due in:</span>
                        <br />
                        <span className="text-muted-foreground">{step.due_days} days</span>
                      </div>
                      <div>
                        <span className="font-medium">Required fields:</span>
                        <br />
                        <span className="text-muted-foreground">
                          {step.required_fields?.length > 0 
                            ? `${step.required_fields.length} fields`
                            : 'None'
                          }
                        </span>
                      </div>
                    </div>

                    {step.required_fields && step.required_fields.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs font-medium mb-2">Required Fields:</div>
                        <div className="flex flex-wrap gap-1">
                          {step.required_fields.map((field, fieldIndex) => (
                            <Badge key={fieldIndex} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => onUseTemplate?.(template)}
              className="flex-1"
            >
              Use This Template
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};