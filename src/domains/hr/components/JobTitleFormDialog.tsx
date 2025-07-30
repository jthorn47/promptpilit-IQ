import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGlobalJobTitles, GlobalJobTitle } from '@/hooks/useGlobalJobTitles';
import { WorkersCompCode } from '@/hooks/useWorkersCompCodes';

interface JobTitleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle?: GlobalJobTitle | null;
  workersCompCodes: WorkersCompCode[];
}

export const JobTitleFormDialog: React.FC<JobTitleFormDialogProps> = ({
  open,
  onOpenChange,
  jobTitle,
  workersCompCodes,
}) => {
  const { createJobTitle, updateJobTitle } = useGlobalJobTitles();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title_name: '',
    description: '',
    wc_code_id: 'none',
    category_tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  // Predefined category suggestions
  const categoryOptions = [
    'Administrative',
    'Sales',
    'Technical',
    'Management',
    'Customer Service',
    'Operations',
    'Finance',
    'HR',
    'Marketing',
    'Construction',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
  ];

  useEffect(() => {
    if (jobTitle) {
      setFormData({
        title_name: jobTitle.title_name,
        description: jobTitle.description || '',
        wc_code_id: jobTitle.wc_code_id || 'none',
        category_tags: jobTitle.category_tags,
      });
    } else {
      setFormData({
        title_name: '',
        description: '',
        wc_code_id: 'none',
        category_tags: [],
      });
    }
  }, [jobTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title_name.trim()) {
      return;
    }

    setLoading(true);
    try {
      // Convert "none" to undefined for the database
      const dataToSubmit = {
        ...formData,
        wc_code_id: formData.wc_code_id === 'none' ? undefined : formData.wc_code_id,
      };
      
      console.log('Submitting job title data:', dataToSubmit);
      
      if (jobTitle) {
        console.log('Updating job title:', jobTitle.id);
        await updateJobTitle(jobTitle.id, dataToSubmit);
      } else {
        console.log('Creating new job title');
        await createJobTitle(dataToSubmit);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving job title:', error);
      // Show the error to the user
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.category_tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        category_tags: [...prev.category_tags, trimmedTag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      category_tags: prev.category_tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {jobTitle ? 'Edit Job Title' : 'Create Job Title'}
          </DialogTitle>
          <DialogDescription>
            {jobTitle 
              ? 'Update the job title information.'
              : 'Create a new global job title that can be reused across clients.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title_name">Job Title *</Label>
            <Input
              id="title_name"
              value={formData.title_name}
              onChange={(e) => setFormData(prev => ({ ...prev, title_name: e.target.value }))}
              placeholder="e.g., Software Engineer, Sales Manager"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the role..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wc_code_id">Workers' Comp Code</Label>
            <Select
              value={formData.wc_code_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, wc_code_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a workers' comp code (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No workers' comp code</SelectItem>
                {workersCompCodes.map(code => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.code} - {code.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category Tags</Label>
            
            {/* Existing tags */}
            {formData.category_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {formData.category_tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick add from predefined options */}
            <div className="flex flex-wrap gap-1 mb-2">
              {categoryOptions
                .filter(option => !formData.category_tags.includes(option))
                .slice(0, 6)
                .map(option => (
                  <Button
                    key={option}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => addTag(option)}
                  >
                    + {option}
                  </Button>
                ))
              }
            </div>

            {/* Custom tag input */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add custom category..."
                className="text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newTag);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title_name.trim()}>
              {loading ? 'Saving...' : (jobTitle ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
