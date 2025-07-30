import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tag, TagList } from "@/components/ui/tag";
import { TagService } from "@/services/tagService";
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Plus, Search, Edit2, Trash2, Merge, Users, Globe, Building } from "lucide-react";

interface TagWithUsage {
  id: string;
  tag_name: string;
  tag_color: string;
  tag_type: string;
  scope: string;
  usage_count: number;
  created_at: string;
}

export default function TagManager() {
  const [tags, setTags] = useState<TagWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithUsage | null>(null);
  const [newTag, setNewTag] = useState({
    tag_name: "",
    tag_color: "#655DC6",
    tag_type: "general",
    scope: "global" as "global" | "company" | "team"
  });
  const { toast } = useToast();

  const tagTypes = [
    { value: "general", label: "General" },
    { value: "priority", label: "Priority" },
    { value: "department", label: "Department" },
    { value: "status", label: "Status" },
    { value: "compliance", label: "Compliance" },
    { value: "training", label: "Training" }
  ];

  const scopeTypes = [
    { value: "global", label: "Global", icon: Globe },
    { value: "company", label: "Company", icon: Building },
    { value: "team", label: "Team", icon: Users }
  ];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await TagService.searchTags();
      setTags(data as TagWithUsage[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch tags: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    try {
      await TagService.createTag(newTag);
      setShowCreateDialog(false);
      setNewTag({
        tag_name: "",
        tag_color: "#655DC6",
        tag_type: "general",
        scope: "global" as "global" | "company" | "team"
      });
      fetchTags();
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create tag: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEditTag = async () => {
    if (!editingTag) return;

    try {
      await TagService.updateTag(editingTag.id, {
        tag_name: editingTag.tag_name,
        tag_color: editingTag.tag_color,
        tag_type: editingTag.tag_type
      });
      setShowEditDialog(false);
      setEditingTag(null);
      fetchTags();
      toast({
        title: "Success",
        description: "Tag updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update tag: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag? This action cannot be undone.")) {
      return;
    }

    try {
      await TagService.deleteTag(tagId);
      fetchTags();
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete tag: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.tag_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || tag.tag_type === typeFilter;
    const matchesScope = scopeFilter === "all" || tag.scope === scopeFilter;
    return matchesSearch && matchesType && matchesScope;
  });

  const getScopeIcon = (scope: string) => {
    const scopeType = scopeTypes.find(s => s.value === scope);
    const Icon = scopeType?.icon || Globe;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
       <UnifiedLayout>
        <div className="p-6">
          <div className="text-center py-8">Loading tags...</div>
        </div>
       </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Tag Manager</h1>
            <p className="text-muted-foreground mt-2">Manage tags used across all platform modules</p>
          </div>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tags</p>
                  <p className="text-2xl font-bold">{tags.length}</p>
                </div>
                <Badge variant="secondary">{tags.length}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Global Tags</p>
                  <p className="text-2xl font-bold">{tags.filter(t => t.scope === 'global').length}</p>
                </div>
                <Globe className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Company Tags</p>
                  <p className="text-2xl font-bold">{tags.filter(t => t.scope === 'company').length}</p>
                </div>
                <Building className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                  <p className="text-2xl font-bold">{tags.reduce((sum, t) => sum + t.usage_count, 0)}</p>
                </div>
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {tagTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scopes</SelectItem>
              {scopeTypes.map(scope => (
                <SelectItem key={scope.value} value={scope.value}>
                  <div className="flex items-center gap-2">
                    <scope.icon className="h-4 w-4" />
                    {scope.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tags</CardTitle>
            <CardDescription>
              Manage and organize tags used across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Tag
                        id={tag.id}
                        name={tag.tag_name}
                        color={tag.tag_color}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tagTypes.find(t => t.value === tag.tag_type)?.label || tag.tag_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getScopeIcon(tag.scope)}
                        <span className="capitalize">{tag.scope}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tag.usage_count}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(tag.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTag(tag);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTag(tag.id)}
                          disabled={tag.usage_count > 0}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Tag Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Create a new tag that can be used across platform modules
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tag_name">Tag Name</Label>
                <Input
                  id="tag_name"
                  value={newTag.tag_name}
                  onChange={(e) => setNewTag(prev => ({ ...prev, tag_name: e.target.value }))}
                  placeholder="Enter tag name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag_color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tag_color"
                    type="color"
                    value={newTag.tag_color}
                    onChange={(e) => setNewTag(prev => ({ ...prev, tag_color: e.target.value }))}
                    className="w-20"
                  />
                  <Input
                    value={newTag.tag_color}
                    onChange={(e) => setNewTag(prev => ({ ...prev, tag_color: e.target.value }))}
                    placeholder="#655DC6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag_type">Type</Label>
                <Select value={newTag.tag_type} onValueChange={(value) => setNewTag(prev => ({ ...prev, tag_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tagTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select value={newTag.scope} onValueChange={(value: "global" | "company" | "team") => setNewTag(prev => ({ ...prev, scope: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeTypes.map(scope => (
                      <SelectItem key={scope.value} value={scope.value}>
                        <div className="flex items-center gap-2">
                          <scope.icon className="h-4 w-4" />
                          {scope.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <Tag
                  id="preview"
                  name={newTag.tag_name || "Tag Name"}
                  color={newTag.tag_color}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTag} disabled={!newTag.tag_name}>
                Create Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Tag Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>
                Update tag information
              </DialogDescription>
            </DialogHeader>
            
            {editingTag && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_tag_name">Tag Name</Label>
                  <Input
                    id="edit_tag_name"
                    value={editingTag.tag_name}
                    onChange={(e) => setEditingTag(prev => prev ? ({ ...prev, tag_name: e.target.value }) : null)}
                    placeholder="Enter tag name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_tag_color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit_tag_color"
                      type="color"
                      value={editingTag.tag_color}
                      onChange={(e) => setEditingTag(prev => prev ? ({ ...prev, tag_color: e.target.value }) : null)}
                      className="w-20"
                    />
                    <Input
                      value={editingTag.tag_color}
                      onChange={(e) => setEditingTag(prev => prev ? ({ ...prev, tag_color: e.target.value }) : null)}
                      placeholder="#655DC6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_tag_type">Type</Label>
                  <Select value={editingTag.tag_type} onValueChange={(value) => setEditingTag(prev => prev ? ({ ...prev, tag_type: value }) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tagTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <Tag
                    id="edit-preview"
                    name={editingTag.tag_name}
                    color={editingTag.tag_color}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTag} disabled={!editingTag?.tag_name}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UnifiedLayout>
  );
}