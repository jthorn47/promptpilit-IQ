import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Tag, Eye, EyeOff, Users, Shield } from 'lucide-react';

interface SaveReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: any;
  prompt: string;
}

export const SaveReportDialog: React.FC<SaveReportDialogProps> = ({
  open,
  onOpenChange,
  reportData,
  prompt
}) => {
  const [reportName, setReportName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveReport = async () => {
    setIsSaving(true);
    
    // TODO: Implement save report functionality
    const reportToSave = {
      name: reportName,
      description,
      tags,
      visibility,
      prompt,
      data: reportData,
      createdAt: new Date().toISOString()
    };
    
    console.log('Saving report:', reportToSave);
    
    setTimeout(() => {
      setIsSaving(false);
      onOpenChange(false);
      // Reset form
      setReportName('');
      setDescription('');
      setTags([]);
      setVisibility('private');
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Report
          </DialogTitle>
          <DialogDescription>
            Save this report to access it later and optionally share it with your team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name *</Label>
            <Input
              id="report-name"
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this report"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <Label>Visibility</Label>
            <RadioGroup value={visibility} onValueChange={setVisibility}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                  <EyeOff className="h-4 w-4" />
                  Private - Only you can see this report
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="submit_admin" id="submit_admin" />
                <Label htmlFor="submit_admin" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="h-4 w-4" />
                  Submit to Admin - Request approval for team sharing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team_share" id="team_share" />
                <Label htmlFor="team_share" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Team Share - Available to your team (Future)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveReport} 
            disabled={!reportName.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};