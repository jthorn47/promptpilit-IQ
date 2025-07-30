/**
 * Tag Selector Component
 * Multi-select tag picker with search, filtering, and creation capabilities
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagService, Tag, EntityType } from '@/services/tagService';
import { Tag as TagComponent } from '@/components/ui/tag';
import { useToast } from '@/hooks/use-toast';

interface TagSelectorProps {
  entityType: EntityType;
  entityId: string;
  selectedTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
  placeholder?: string;
  className?: string;
  variant?: 'popover' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  allowCreate?: boolean;
  filterByType?: string;
}

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151'
];

const TAG_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'department', label: 'Department' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'training', label: 'Training' },
  { value: 'project', label: 'Project' },
  { value: 'client', label: 'Client' },
];

export function TagSelector({
  entityType,
  entityId,
  selectedTags = [],
  onTagsChange,
  placeholder = 'Select tags...',
  className,
  variant = 'popover',
  size = 'md',
  allowCreate = true,
  filterByType
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query available tags
  const { data: availableTags = [], isLoading } = useQuery({
    queryKey: ['tags', 'search', search, filterByType],
    queryFn: () => TagService.searchTags({
      searchTerm: search,
      tagType: filterByType,
      limit: 100
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query current entity tags
  const { data: entityTags = [], refetch: refetchEntityTags } = useQuery({
    queryKey: ['entity-tags', entityType, entityId],
    queryFn: () => TagService.getEntityTags(entityType, entityId),
    enabled: !!entityId,
  });

  // Sync entity tags with selected tags
  useEffect(() => {
    if (entityTags.length > 0) {
      const tags = entityTags.map(et => ({
        id: et.tag_id,
        tag_name: et.tag_name,
        tag_color: et.tag_color,
        tag_type: et.tag_type,
        scope: 'global' as const,
        created_by: '',
        created_at: et.tagged_at,
        updated_at: et.tagged_at
      }));
      onTagsChange?.(tags);
    }
  }, [entityTags, onTagsChange]);

  // Mutation for assigning tags
  const assignTagsMutation = useMutation({
    mutationFn: (tagIds: string[]) => TagService.assignTagsToEntity(entityType, entityId, tagIds),
    onSuccess: () => {
      refetchEntityTags();
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({
        title: 'Tags updated',
        description: 'Tags have been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating tags',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for creating tags
  const createTagMutation = useMutation({
    mutationFn: TagService.createTag,
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setShowCreateDialog(false);
      handleTagToggle(newTag);
      toast({
        title: 'Tag created',
        description: `Tag "${newTag.tag_name}" has been created and added.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    const newTags = isSelected 
      ? selectedTags.filter(t => t.id !== tag.id)
      : [...selectedTags, tag];
    
    onTagsChange?.(newTags);
    
    if (entityId) {
      assignTagsMutation.mutate(newTags.map(t => t.id));
    }
  };

  const handleRemoveTag = (tagId: string) => {
    const newTags = selectedTags.filter(t => t.id !== tagId);
    onTagsChange?.(newTags);
    
    if (entityId) {
      assignTagsMutation.mutate(newTags.map(t => t.id));
    }
  };

  const filteredTags = useMemo(() => {
    return availableTags.filter(tag => 
      !selectedTags.some(selected => selected.id === tag.id) &&
      (!search || tag.tag_name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [availableTags, selectedTags, search]);

  if (variant === 'inline') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <TagComponent
              key={tag.id}
              id={tag.id}
              name={tag.tag_name}
              color={tag.tag_color}
              size={size}
              removable
              onRemove={handleRemoveTag}
            />
          ))}
        </div>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size={size === 'md' ? 'default' : size}
              className="h-auto min-h-[32px] justify-start"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <TagSelectorContent
              search={search}
              setSearch={setSearch}
              filteredTags={filteredTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              allowCreate={allowCreate}
              onCreateTag={() => setShowCreateDialog(true)}
              isLoading={isLoading}
            />
          </PopoverContent>
        </Popover>

        <CreateTagDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateTag={createTagMutation.mutate}
          isLoading={createTagMutation.isPending}
          defaultType={filterByType}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between',
              selectedTags.length === 0 && 'text-muted-foreground'
            )}
            size={size === 'md' ? 'default' : size}
          >
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {selectedTags.length === 0 ? (
                placeholder
              ) : selectedTags.length <= 3 ? (
                selectedTags.map((tag) => (
                  <TagComponent
                    key={tag.id}
                    id={tag.id}
                    name={tag.tag_name}
                    color={tag.tag_color}
                    size="sm"
                  />
                ))
              ) : (
                <span>
                  {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <TagSelectorContent
            search={search}
            setSearch={setSearch}
            filteredTags={filteredTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            allowCreate={allowCreate}
            onCreateTag={() => setShowCreateDialog(true)}
            isLoading={isLoading}
          />
        </PopoverContent>
      </Popover>

      <CreateTagDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateTag={createTagMutation.mutate}
        isLoading={createTagMutation.isPending}
        defaultType={filterByType}
      />
    </div>
  );
}

interface TagSelectorContentProps {
  search: string;
  setSearch: (value: string) => void;
  filteredTags: Tag[];
  selectedTags: Tag[];
  onTagToggle: (tag: Tag) => void;
  allowCreate: boolean;
  onCreateTag: () => void;
  isLoading: boolean;
}

function TagSelectorContent({
  search,
  setSearch,
  filteredTags,
  selectedTags,
  onTagToggle,
  allowCreate,
  onCreateTag,
  isLoading
}: TagSelectorContentProps) {
  return (
    <Command>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Search tags..."
          value={search}
          onValueChange={setSearch}
          className="flex-1"
        />
      </div>
      <CommandList>
        <CommandEmpty>
          {isLoading ? (
            'Loading tags...'
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">No tags found</p>
              {allowCreate && search && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateTag}
                  className="text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Create "{search}"
                </Button>
              )}
            </div>
          )}
        </CommandEmpty>
        
        {filteredTags.length > 0 && (
          <CommandGroup>
            {filteredTags.map((tag) => (
              <CommandItem
                key={tag.id}
                onSelect={() => onTagToggle(tag)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <TagComponent
                  id={tag.id}
                  name={tag.tag_name}
                  color={tag.tag_color}
                  size="sm"
                />
                <div className="flex-1" />
                {selectedTags.some(t => t.id === tag.id) && (
                  <Check className="h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {allowCreate && search && !filteredTags.some(t => t.tag_name.toLowerCase() === search.toLowerCase()) && (
          <CommandGroup>
            <CommandItem onSelect={onCreateTag} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Create "{search}"
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTag: (tag: Parameters<typeof TagService.createTag>[0]) => void;
  isLoading: boolean;
  defaultType?: string;
}

function CreateTagDialog({
  open,
  onOpenChange,
  onCreateTag,
  isLoading,
  defaultType
}: CreateTagDialogProps) {
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);
  const [tagType, setTagType] = useState(defaultType || 'general');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    onCreateTag({
      tag_name: tagName.trim(),
      tag_color: tagColor,
      tag_type: tagType,
      description: description.trim() || undefined,
      scope: 'company'
    });

    // Reset form
    setTagName('');
    setTagColor(TAG_COLORS[0]);
    setTagType(defaultType || 'general');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tag-name">Tag Name *</Label>
            <Input
              id="tag-name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
              required
            />
          </div>

          <div>
            <Label htmlFor="tag-type">Type</Label>
            <Select value={tagType} onValueChange={setTagType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAG_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setTagColor(color)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-transform',
                    tagColor === color ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="mt-2">
              <Input
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !tagName.trim()}>
              {isLoading ? 'Creating...' : 'Create Tag'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}