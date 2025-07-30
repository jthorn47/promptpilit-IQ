import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { CaseTemplate, CaseTemplateStep } from '@/hooks/useCaseTemplates';

interface CaseTemplateFormProps {
  template?: CaseTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (templateData: any) => Promise<void>;
  loading?: boolean;
}

interface TemplateFormData {
  name: string;
  category: string;
  estimated_duration_days: number;
  description: string;
  steps: Omit<CaseTemplateStep, 'id'>[];
}

const categories = [
  'HR',
  'Compliance', 
  'Legal',
  'Safety',
  'Other'
];

const roles = [
  'HR Manager',
  'HR Specialist',
  'Compliance Officer',
  'Legal Counsel',
  'Case Owner',
  'Department Manager',
  'Safety Officer'
];

export const CaseTemplateForm: React.FC<CaseTemplateFormProps> = ({
  template,
  open,
  onOpenChange,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState<TemplateFormData>(() => ({
    name: template?.name || '',
    category: template?.category || '',
    estimated_duration_days: template?.estimated_duration_days || 1,
    description: template?.description || '',
    steps: template?.steps?.map(step => ({
      step_order: step.step_order,
      title: step.title,
      description: step.description,
      assigned_to_role: step.assigned_to_role,
      due_days: step.due_days,
      required_fields: step.required_fields || [],
      metadata: step.metadata || {}
    })) || []
  }));

  const [newRequiredField, setNewRequiredField] = useState('');

  const handleInputChange = (field: keyof TemplateFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addStep = () => {
    const newStep: Omit<CaseTemplateStep, 'id'> = {
      step_order: formData.steps.length + 1,
      title: '',
      description: '',
      assigned_to_role: '',
      due_days: 1,
      required_fields: [],
      metadata: {}
    };
    
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        step_order: i + 1
      }))
    }));
  };

  const updateStep = (index: number, field: keyof Omit<CaseTemplateStep, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const addRequiredField = (stepIndex: number) => {
    if (!newRequiredField.trim()) return;
    
    updateStep(stepIndex, 'required_fields', [
      ...formData.steps[stepIndex].required_fields,
      newRequiredField.trim()
    ]);
    setNewRequiredField('');
  };

  const removeRequiredField = (stepIndex: number, fieldIndex: number) => {
    const updatedFields = formData.steps[stepIndex].required_fields.filter((_, i) => i !== fieldIndex);
    updateStep(stepIndex, 'required_fields', updatedFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category || formData.steps.length === 0) {
      return;
    }

    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogDescription>
            {template ? 'Modify the existing case template' : 'Create a new case template with workflow steps'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Harassment Investigation"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (Days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.estimated_duration_days}
                onChange={(e) => handleInputChange('estimated_duration_days', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this template is for and when to use it"
              rows={3}
            />
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Workflow Steps</h3>
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>

            {formData.steps.map((step, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      Step {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Step Title *</Label>
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                        placeholder="e.g., Initial Complaint Intake"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Assigned Role</Label>
                      <Select 
                        value={step.assigned_to_role} 
                        onValueChange={(value) => updateStep(index, 'assigned_to_role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      placeholder="Describe what needs to be done in this step"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Due Days After Previous Step</Label>
                    <Input
                      type="number"
                      min="1"
                      value={step.due_days}
                      onChange={(e) => updateStep(index, 'due_days', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Required Fields</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newRequiredField}
                        onChange={(e) => setNewRequiredField(e.target.value)}
                        placeholder="Add required field"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addRequiredField(index);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addRequiredField(index)}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {step.required_fields.map((field, fieldIndex) => (
                        <Badge
                          key={fieldIndex}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {field}
                          <button
                            type="button"
                            onClick={() => removeRequiredField(index, fieldIndex)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {formData.steps.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No steps added yet. Click "Add Step" to create your workflow.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};