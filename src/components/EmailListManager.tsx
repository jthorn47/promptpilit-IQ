import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Mail, Trash2, Edit, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmailList {
  id: string;
  name: string;
  description: string | null;
  recipient_count: number;
  is_active: boolean;
  tags: any;
  created_at: string;
  updated_at: string;
}

export const EmailListManager = () => {
  const [open, setOpen] = useState(false);
  const [editingList, setEditingList] = useState<EmailList | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lists, isLoading } = useQuery({
    queryKey: ['email-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_lists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailList[];
    }
  });

  const createListMutation = useMutation({
    mutationFn: async (newList: { name: string; description: string }) => {
      const { data, error } = await supabase
        .from('email_lists')
        .insert([{
          name: newList.name,
          description: newList.description,
          is_active: true,
          recipient_count: 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-lists'] });
      setOpen(false);
      setFormData({ name: "", description: "" });
      toast({
        title: "List Created",
        description: "Email list has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create email list.",
        variant: "destructive",
      });
    }
  });

  const updateListMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailList> }) => {
      const { data, error } = await supabase
        .from('email_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-lists'] });
      setOpen(false);
      setEditingList(null);
      setFormData({ name: "", description: "" });
      toast({
        title: "List Updated",
        description: "Email list has been updated successfully.",
      });
    }
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_lists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-lists'] });
      toast({
        title: "List Deleted",
        description: "Email list has been deleted successfully.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingList) {
      updateListMutation.mutate({
        id: editingList.id,
        updates: {
          name: formData.name,
          description: formData.description
        }
      });
    } else {
      createListMutation.mutate(formData);
    }
  };

  const handleEdit = (list: EmailList) => {
    setEditingList(list);
    setFormData({
      name: list.name,
      description: list.description || ""
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this list?")) {
      deleteListMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingList(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Lists</h1>
          <p className="text-muted-foreground">Manage your email marketing lists</p>
        </div>
        
        <Dialog open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingList ? 'Edit Email List' : 'Create New Email List'}
              </DialogTitle>
              <DialogDescription>
                {editingList ? 'Update your email list details.' : 'Create a new email list for your marketing campaigns.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">List Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter list name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this email list"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createListMutation.isPending || updateListMutation.isPending}
                >
                  {editingList ? 'Update List' : 'Create List'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading email lists...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists?.map((list) => (
            <Card key={list.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                  {list.description && (
                    <CardDescription className="mt-1">{list.description}</CardDescription>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(list)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(list.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{list.recipient_count} contacts</span>
                </div>
                
                {list.tags?.source && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Tag className="w-3 h-3" />
                    <Badge variant="secondary" className="text-xs">
                      {list.tags.source === 'hubspot' ? 'HubSpot' : 'Manual'}
                    </Badge>
                    {list.tags.hubspot_list_type && (
                      <Badge variant="outline" className="text-xs">
                        {list.tags.hubspot_list_type}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {lists?.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Email Lists Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first email list to start organizing your contacts for marketing campaigns.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First List
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};