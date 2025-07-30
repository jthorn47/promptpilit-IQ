import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCw } from 'lucide-react';
import { useCrmSpinContentByOpportunity, useCrmSpinContentMutations } from '../hooks/useCrmSpinContents';
import { useToast } from '@/hooks/use-toast';

interface SpinSellingPanelProps {
  opportunityId: string;
  className?: string;
}

const SPIN_FIELDS = [
  {
    key: 'situation',
    label: 'Situation',
    description: 'Current state and context of the prospect',
    placeholder: 'Describe the current situation, context, and background...'
  },
  {
    key: 'problem',
    label: 'Problem',
    description: 'Issues, difficulties, or dissatisfactions identified',
    placeholder: 'What problems, challenges, or pain points have been identified?'
  },
  {
    key: 'implication',
    label: 'Implication',
    description: 'Consequences and effects of the problems',
    placeholder: 'What are the consequences if these problems are not solved?'
  },
  {
    key: 'need_payoff',
    label: 'Need-Payoff',
    description: 'Value and benefits of solving the problems',
    placeholder: 'What would be the value and benefits of solving these problems?'
  }
];

export function SpinSellingPanel({ opportunityId, className }: SpinSellingPanelProps) {
  const { data: spinContent, isLoading } = useCrmSpinContentByOpportunity(opportunityId);
  const { createSpinContent, updateSpinContent } = useCrmSpinContentMutations();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Record<string, string>>({
    situation: '',
    problem: '',
    implication: '',
    need_payoff: ''
  });
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data when spin content loads
  useEffect(() => {
    if (spinContent) {
      const initialData: Record<string, string> = {};
      SPIN_FIELDS.forEach(field => {
        initialData[field.key] = (spinContent as any)[field.key] || '';
      });
      setFormData(initialData);
      setIsDirty(false);
    }
  }, [spinContent]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const calculateCompletionScore = () => {
    const completedFields = SPIN_FIELDS.filter(field => 
      formData[field.key] && formData[field.key].trim().length > 0
    ).length;
    return Math.round((completedFields / SPIN_FIELDS.length) * 100);
  };

  const handleSave = async () => {
    try {
      const saveData = {
        opportunity_id: opportunityId,
        ...formData,
      };

      if (spinContent?.id) {
        await updateSpinContent.mutateAsync({
          id: spinContent.id,
          ...saveData
        });
        toast({
          title: "SPIN content updated",
          description: "Your SPIN selling content has been successfully updated.",
        });
      } else {
        await createSpinContent.mutateAsync(saveData);
        toast({
          title: "SPIN content created",
          description: "Your SPIN selling content has been successfully created.",
        });
      }
      
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving SPIN content:', error);
      toast({
        title: "Error",
        description: "Failed to save SPIN content. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading SPIN content...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionScore = calculateCompletionScore();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with completion score */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">SPIN Selling Framework</h2>
          <p className="text-sm text-muted-foreground">
            Systematic approach to understanding customer needs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={completionScore === 100 ? 'default' : 'secondary'}>
            {completionScore}% Complete
          </Badge>
          <Button 
            onClick={handleSave} 
            disabled={!isDirty || createSpinContent.isPending || updateSpinContent.isPending}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {createSpinContent.isPending || updateSpinContent.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* SPIN Fields */}
      <div className="grid gap-6">
        {SPIN_FIELDS.map((field) => (
          <Card key={field.key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{field.label}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {formData[field.key] && formData[field.key].trim().length > 0 ? 'Completed' : 'Pending'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{field.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor={field.key}>{field.label} Details</Label>
                <Textarea
                  id={field.key}
                  placeholder={field.placeholder}
                  value={formData[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                {field.key === 'situation' && (
                  <p className="text-xs text-muted-foreground">
                    Focus on facts about the prospect's current state, background, and context.
                  </p>
                )}
                {field.key === 'problem' && (
                  <p className="text-xs text-muted-foreground">
                    Identify specific problems, difficulties, or dissatisfactions the prospect is experiencing.
                  </p>
                )}
                {field.key === 'implication' && (
                  <p className="text-xs text-muted-foreground">
                    Explore the consequences and effects of not solving the identified problems.
                  </p>
                )}
                {field.key === 'need_payoff' && (
                  <p className="text-xs text-muted-foreground">
                    Focus on the value, benefits, and positive outcomes of solving the problems.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>SPIN Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SPIN_FIELDS.map((field) => (
              <div key={field.key} className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  formData[field.key] && formData[field.key].trim().length > 0 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                }`} />
                <p className="text-sm font-medium">{field.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formData[field.key] && formData[field.key].trim().length > 0 ? 'Complete' : 'Pending'}
                </p>
              </div>
            ))}
          </div>
          
          {completionScore === 100 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                🎉 SPIN Analysis Complete!
              </p>
              <p className="text-xs text-green-600 mt-1">
                All sections have been completed. You can now generate proposals and next steps.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}