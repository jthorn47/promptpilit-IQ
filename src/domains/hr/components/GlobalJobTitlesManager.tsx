import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  Send,
  FileText,
  SortAsc,
  SortDesc,
  Briefcase
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalJobTitles, GlobalJobTitle } from '@/hooks/useGlobalJobTitles';
import { useWorkersCompCodes } from '@/hooks/useWorkersCompCodes';
import { useNavigate } from 'react-router-dom';
import { JobTitleFormDialog } from './JobTitleFormDialog';

export const GlobalJobTitlesManager: React.FC = () => {
  const navigate = useNavigate();
  const { jobTitles, loading, deleteJobTitle } = useGlobalJobTitles();
  const { workersCompCodes } = useWorkersCompCodes();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof GlobalJobTitle>('title_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState<GlobalJobTitle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let filtered = jobTitles.filter(item => {
      const matchesSearch = item.title_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || 
                            item.category_tags.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

    return filtered;
  }, [jobTitles, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    jobTitles.forEach(item => {
      item.category_tags.forEach(tag => cats.add(tag));
    });
    return Array.from(cats).sort();
  }, [jobTitles]);

  const handleSort = (field: keyof GlobalJobTitle) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map(item => item.id));
    }
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleEdit = (jobTitle: GlobalJobTitle) => {
    setEditingJobTitle(jobTitle);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJobTitle(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting job title:', error);
    }
  };

  const handleCreateDescription = (jobTitleId: string) => {
    navigate(`/admin/hr-tools/job-descriptions/${jobTitleId}`);
  };

  const handleViewDescription = (jobTitleId: string) => {
    navigate(`/admin/hr-tools/job-descriptions/${jobTitleId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job titles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Global Job Titles & Descriptions
          </h2>
          <p className="text-muted-foreground">
            Manage reusable job titles and structured descriptions for HR workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={selectedItems.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Push to Client ({selectedItems.length})
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Job Title
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search job titles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Job Titles ({filteredData.length})
            </CardTitle>
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} selected
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredData.length > 0 && selectedItems.length === filteredData.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('title_name')}
                  >
                    <div className="flex items-center gap-1">
                      Job Title
                      {sortBy === 'title_name' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Category Tags</TableHead>
                  <TableHead>WC Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.title_name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.category_tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.workers_comp_code ? (
                        <Badge variant="outline">
                          {item.workers_comp_code.code}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No code</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.job_description ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDescription(item.id)}
                          className="h-8 px-2"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateDescription(item.id)}
                          className="h-8 px-2"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Title
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCreateDescription(item.id)}>
                            <FileText className="w-4 h-4 mr-2" />
                            {item.job_description ? 'Edit Description' : 'Create Description'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteConfirm(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Briefcase className="w-12 h-12 text-muted-foreground" />
                        <div className="text-lg font-medium">No job titles found</div>
                        <div className="text-sm text-muted-foreground">
                          {searchTerm || selectedCategory !== 'all' 
                            ? "Try adjusting your search or filters"
                            : "Create your first global job title to get started"
                          }
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <JobTitleFormDialog
        open={showAddDialog || !!editingJobTitle}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingJobTitle(null);
          }
        }}
        jobTitle={editingJobTitle}
        workersCompCodes={workersCompCodes}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Title</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job title? This action cannot be undone.
              Any associated job descriptions will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};