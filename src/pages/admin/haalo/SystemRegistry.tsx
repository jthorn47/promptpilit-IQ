import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Filter,
  Database,
  Code,
  AlertTriangle,
  Save
} from "lucide-react";
import { 
  getAllRegistryEntries, 
  setRegistryValue, 
  deleteRegistryValue, 
  getRegistryAuditLog,
  type SystemRegistryEntry 
} from "@/utils/systemRegistry";
import { supabase } from "@/integrations/supabase/client";

interface RegistryFormData {
  key: string;
  value: string;
  description: string;
  data_type: string; // Changed to string to match DB
  category: string;
  requires_restart: boolean;
}

export default function SystemRegistry() {
  const [entries, setEntries] = useState<SystemRegistryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<SystemRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SystemRegistryEntry | null>(null);
  const [formData, setFormData] = useState<RegistryFormData>({
    key: "",
    value: "",
    description: "",
    data_type: "string",
    category: "",
    requires_restart: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, categoryFilter, statusFilter]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await getAllRegistryEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error loading registry entries:', error);
      toast({
        title: "Error",
        description: "Failed to load registry entries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(entry => entry.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(entry => 
        statusFilter === "active" ? entry.status === 'active' : entry.status !== 'active'
      );
    }

    setFilteredEntries(filtered);
  };

  const handleSave = async () => {
    try {
      if (!formData.key || !formData.value) {
        toast({
          title: "Error",
          description: "Key and value are required",
          variant: "destructive"
        });
        return;
      }

      let processedValue: any = formData.value;

      // Process value based on data type
      switch (formData.data_type) {
        case 'number':
          processedValue = parseFloat(formData.value);
          if (isNaN(processedValue)) {
            throw new Error('Invalid number format');
          }
          break;
        case 'boolean':
          processedValue = formData.value.toLowerCase() === 'true';
          break;
        case 'json':
          processedValue = JSON.parse(formData.value);
          break;
        case 'date':
          processedValue = new Date(formData.value).toISOString();
          break;
      }

      await setRegistryValue(
        formData.key,
        processedValue,
        formData.description,
        formData.data_type as any, // Type cast to match function signature
        formData.category,
        true, // is_active
        formData.requires_restart
      );

      toast({
        title: "Success",
        description: `Registry entry ${editingEntry ? 'updated' : 'created'} successfully`
      });

      setIsAddDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      loadEntries();
    } catch (error) {
      console.error('Error saving registry entry:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingEntry ? 'update' : 'create'} registry entry`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (entry: SystemRegistryEntry) => {
    setEditingEntry(entry);
    setFormData({
      key: entry.key,
      value: typeof entry.value === 'object' ? JSON.stringify(entry.value, null, 2) : String(entry.value),
      description: entry.description || "",
      data_type: entry.data_type,
      category: entry.category,
      requires_restart: entry.requires_restart || false
    });
    setIsAddDialogOpen(true);
  };

  const handleClone = (entry: SystemRegistryEntry) => {
    setEditingEntry(null);
    setFormData({
      key: `${entry.key}_copy`,
      value: typeof entry.value === 'object' ? JSON.stringify(entry.value, null, 2) : String(entry.value),
      description: entry.description || "",
      data_type: entry.data_type,
      category: entry.category,
      requires_restart: entry.requires_restart || false
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this registry entry?')) {
      return;
    }

    try {
      await deleteRegistryValue(key);
      toast({
        title: "Success",
        description: "Registry entry deleted successfully"
      });
      loadEntries();
    } catch (error) {
      console.error('Error deleting registry entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete registry entry",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      key: "",
      value: "",
      description: "",
      data_type: "string",
      category: "",
      requires_restart: false
    });
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(entries.map(entry => entry.category))];
    return categories.sort();
  };

  const formatValue = (value: any, dataType: string) => {
    if (dataType === 'json') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'string': return 'bg-blue-100 text-blue-800';
      case 'number': return 'bg-green-100 text-green-800';
      case 'boolean': return 'bg-purple-100 text-purple-800';
      case 'json': return 'bg-orange-100 text-orange-800';
      case 'date': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading registry entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Registry</h1>
          <p className="text-muted-foreground">
            Manage system-wide configuration settings and constants
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingEntry(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Registry Entry' : 'Add Registry Entry'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="key">Key *</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="e.g., FICA_RATE_2025"
                    disabled={!!editingEntry}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Payroll, HR, Security"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short explanation of what this value controls"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataType">Data Type</Label>
                  <Select
                    value={formData.data_type}
                    onValueChange={(value: any) => setFormData({ ...formData, data_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="requires_restart"
                    checked={formData.requires_restart}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_restart: checked })}
                  />
                  <Label htmlFor="requires_restart">Requires Restart</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="value">Value *</Label>
                {formData.data_type === 'json' ? (
                  <Textarea
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder='{"key": "value"}'
                    rows={4}
                  />
                ) : (
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={
                      formData.data_type === 'boolean' ? 'true or false' :
                      formData.data_type === 'number' ? '123.45' :
                      formData.data_type === 'date' ? '2025-01-01' :
                      'Enter value'
                    }
                  />
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingEntry(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingEntry ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by key, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Registry Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No entries found</h3>
                <p className="text-muted-foreground">
                  {entries.length === 0 
                    ? "Create your first registry entry to get started"
                    : "Try adjusting your search or filters"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.key} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono text-sm font-medium">{entry.key}</h3>
                      <Badge className={getDataTypeColor(entry.data_type)}>
                        {entry.data_type}
                      </Badge>
                      <Badge variant={entry.status === 'active' ? "default" : "secondary"}>
                        {entry.status === 'active' ? "Active" : "Inactive"}
                      </Badge>
                      {entry.requires_restart && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Restart Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Category: {entry.category}</span>
                      <span>Updated: {new Date(entry.updated_at).toLocaleDateString()}</span>
                      {entry.updated_by && <span>By: {entry.updated_by}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClone(entry)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.key)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-md p-3">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    {formatValue(entry.value, entry.data_type)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}