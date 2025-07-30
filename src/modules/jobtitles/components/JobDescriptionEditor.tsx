import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wand2, FileText, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface JobDescriptionEditorProps {
  jobTitle: string;
  wcCodeDescription?: string;
  initialDescription?: string;
  isAiGenerated?: boolean;
  onSave: (description: string, isAiGenerated: boolean) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export const JobDescriptionEditor: React.FC<JobDescriptionEditorProps> = ({
  jobTitle,
  wcCodeDescription,
  initialDescription = '',
  isAiGenerated = false,
  onSave,
  onCancel,
  className
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentlyAiGenerated, setCurrentlyAiGenerated] = useState(isAiGenerated);

  useEffect(() => {
    setDescription(initialDescription);
    setCurrentlyAiGenerated(isAiGenerated);
  }, [initialDescription, isAiGenerated]);

  const handleGenerateDescription = async () => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-job-description', {
        body: {
          job_title: jobTitle,
          wc_code_description: wcCodeDescription,
          industry: 'general business',
          company_type: 'company'
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate description');
      }

      setDescription(data.description);
      setCurrentlyAiGenerated(true);
      toast.success('Job description generated successfully');
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate job description');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertWcDescription = () => {
    if (!wcCodeDescription) return;
    
    const wcSection = `\n\n<h3>Workers' Compensation Classification</h3>\n<p>${wcCodeDescription}</p>`;
    setDescription(prev => prev + wcSection);
    toast.success('Workers\' Comp description inserted');
  };

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(description, currentlyAiGenerated);
    } catch (error) {
      console.error('Error saving description:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    // If user modifies AI-generated content, mark as no longer purely AI-generated
    if (currentlyAiGenerated && value !== initialDescription) {
      setCurrentlyAiGenerated(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Job Description for: {jobTitle}</CardTitle>
          {currentlyAiGenerated && (
            <Badge variant="secondary" className="gap-1">
              <Wand2 className="h-3 w-3" />
              AI Generated
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateDescription}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Sample Description'}
          </Button>
          
          {wcCodeDescription && (
            <Button
              variant="outline"
              size="sm"
              onClick={insertWcDescription}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Insert WC Description
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Job Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Enter the job description here... You can use the AI generator to get started or write your own."
            rows={15}
            className="min-h-[300px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            You can use HTML formatting in the description (e.g., &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;p&gt;, etc.)
          </p>
        </div>

        {wcCodeDescription && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Workers' Comp Classification:</h4>
            <p className="text-xs text-muted-foreground">{wcCodeDescription}</p>
          </div>
        )}

        <Separator />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || !description.trim()}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Description'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};