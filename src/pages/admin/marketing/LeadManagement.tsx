import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Plus,
  UserPlus,
  TrendingUp,
  Filter,
  Search,
  Phone,
  Mail,
  Calendar,
  Download,
  ExternalLink,
  Tag,
  UserCheck
} from "lucide-react";
import { useLeads } from "@/modules/HaaLO.CRM/hooks/useLeads";

const LeadManagement = () => {
  const [activeTab, setActiveTab] = useState("leads");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [mailchimpLists, setMailchimpLists] = useState([]);
  const [selectedList, setSelectedList] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [isMailchimpDialogOpen, setIsMailchimpDialogOpen] = useState(false);
  const [syncingLeads, setSyncingLeads] = useState(false);
  const { leads, loading, fetchLeads, createLead, updateLead, deleteLead } = useLeads();
  const { toast } = useToast();

  // Fetch Mailchimp lists on component mount
  useEffect(() => {
    fetchMailchimpLists();
  }, []);

  const fetchMailchimpLists = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('mailchimp-get-lists');
      if (error) throw error;
      setMailchimpLists(data.lists || []);
    } catch (error) {
      console.error('Failed to fetch Mailchimp lists:', error);
      toast({
        title: "Warning",
        description: "Unable to load Mailchimp lists. Ensure integration is configured.",
        variant: "destructive",
      });
    }
  };

  const handleLeadSelection = (leadId, selected) => {
    if (selected) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSyncToMailchimp = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No Leads Selected",
        description: "Please select leads to sync to Mailchimp.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedList) {
      toast({
        title: "List Required",
        description: "Please select a Mailchimp list.",
        variant: "destructive",
      });
      return;
    }

    setSyncingLeads(true);
    try {
      const { data, error } = await supabase.functions.invoke('mailchimp-sync-contacts', {
        body: {
          leadIds: selectedLeads,
          listId: selectedList,
          tags: selectedTags,
          action: 'subscribe'
        }
      });

      if (error) throw error;

      toast({
        title: "Sync Successful",
        description: `Successfully synced ${data.synced_contacts} leads to Mailchimp.`,
      });

      // Refresh leads to show updated Mailchimp status
      fetchLeads();
      setIsMailchimpDialogOpen(false);
      setSelectedLeads([]);
      setSelectedTags([]);
      setSelectedList("");
    } catch (error) {
      console.error('Mailchimp sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync leads to Mailchimp.",
        variant: "destructive",
      });
    } finally {
      setSyncingLeads(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads from capture to conversion
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            Marketing IQ
          </Badge>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Leads
          </TabsTrigger>
          <TabsTrigger value="qualified" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Qualified
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leads.length}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : "Total leads"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leads.filter(l => l.status === 'qualified').length}</div>
                <p className="text-xs text-muted-foreground">
                  Qualified leads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.8%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Pipeline</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$248K</div>
                <p className="text-xs text-muted-foreground">
                  Potential revenue
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>
                    Latest leads captured from your marketing campaigns
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Dialog open={isMailchimpDialogOpen} onOpenChange={setIsMailchimpDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={selectedLeads.length === 0}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Sync to Mailchimp ({selectedLeads.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Sync Leads to Mailchimp</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="mailchimp-list">Select Mailchimp List</Label>
                          <Select value={selectedList} onValueChange={setSelectedList}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a list..." />
                            </SelectTrigger>
                            <SelectContent>
                              {mailchimpLists.map((list) => (
                                <SelectItem key={list.id} value={list.id}>
                                  {list.name} ({list.member_count} members)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Tags (Optional)</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              placeholder="Add a tag..."
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={addTag}>
                              <Tag className="h-4 w-4" />
                            </Button>
                          </div>
                          {selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedTags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                  <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 text-muted-foreground hover:text-foreground"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 pt-4">
                          <Button 
                            onClick={handleSyncToMailchimp}
                            disabled={syncingLeads || !selectedList}
                          >
                            {syncingLeads ? "Syncing..." : `Sync ${selectedLeads.length} Lead(s)`}
                          </Button>
                          <Button variant="outline" onClick={() => setIsMailchimpDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={selectedLeads.length === leads.length && leads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      Select All ({selectedLeads.length}/{leads.length})
                    </span>
                  </div>
                  {selectedLeads.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {selectedLeads.length} lead(s) selected
                    </span>
                  )}
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading leads...</p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leads found. Create your first lead to get started.</p>
                  </div>
                ) : leads.slice(0, 10).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => handleLeadSelection(lead.id, checked)}
                      />
                      <div>
                        <h4 className="font-medium">{lead.first_name} {lead.last_name}</h4>
                        <p className="text-sm text-muted-foreground">{lead.company_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(lead as any).mailchimp_member_id && (
                            <Badge variant="outline" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Mailchimp
                            </Badge>
                          )}
                          {(lead as any).mailchimp_tags && (lead as any).mailchimp_tags.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {(lead as any).mailchimp_tags.length} tag(s)
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Source:</span> {lead.source}
                      </div>
                      {lead.score && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Score:</span> {lead.score}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          lead.status === "new" ? "secondary" :
                          lead.status === "qualified" ? "default" :
                          lead.status === "contacted" ? "outline" : "default"
                        }>
                          {lead.status}
                        </Badge>
                        {(lead as any).mailchimp_status && (
                          <Badge variant="outline" className="text-xs">
                            {(lead as any).mailchimp_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualified" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Qualified Leads</CardTitle>
              <CardDescription>
                Leads that meet your qualification criteria and are sales-ready
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Qualified leads management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline</CardTitle>
              <CardDescription>
                Visual pipeline showing leads through different stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Pipeline visualization coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Analytics</CardTitle>
              <CardDescription>
                Analytics and insights about your lead generation performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lead analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadManagement;