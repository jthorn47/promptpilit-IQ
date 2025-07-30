import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Send, Users, Mail, BarChart3, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_id?: string;
  status: string;
  send_at?: string;
  total_recipients: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template_type: string;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  status: string;
}

export const EmailCampaignsManager = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    template_id: "",
    send_at: "",
  });
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;
      setCampaigns(campaignsData || []);

      // Fetch templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('email_templates')
        .select('id, name, subject, template_type')
        .eq('is_active', true)
        .order('name');

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, first_name, last_name, email, company_name, status')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

      // Fetch current user's email
      if (user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('user_id', user.id)
          .single();

        if (profileData && !profileError) {
          setUserEmail(profileData.email);
        }
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      if (!newCampaign.name || !newCampaign.subject || selectedLeads.length === 0) {
        toast({
          title: "Error",
          description: "Please fill in required fields and select recipients",
          variant: "destructive",
        });
        return;
      }

      // Create campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          name: newCampaign.name,
          subject: newCampaign.subject,
          template_id: newCampaign.template_id || null,
          status: 'draft',
          send_at: newCampaign.send_at || null,
          created_by: user?.id,
          total_recipients: selectedLeads.length
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Add recipients
      const recipients = selectedLeads.map(leadId => {
        const lead = leads.find(l => l.id === leadId);
        return {
          campaign_id: campaignData.id,
          lead_id: leadId,
          email: lead?.email || '',
          name: `${lead?.first_name || ''} ${lead?.last_name || ''}`.trim()
        };
      });

      const { error: recipientsError } = await supabase
        .from('email_campaign_recipients')
        .insert(recipients);

      if (recipientsError) throw recipientsError;

      toast({
        title: "Success",
        description: "Campaign created successfully",
      });

      setShowCreateDialog(false);
      setNewCampaign({ name: "", subject: "", template_id: "", send_at: "" });
      setSelectedLeads([]);
      fetchData();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  const handleSendCampaign = async (campaign: EmailCampaign) => {
    try {
      // Get campaign recipients
      const { data: recipients, error: recipientsError } = await supabase
        .from('email_campaign_recipients')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('status', 'pending');

      if (recipientsError) throw recipientsError;

      if (!recipients || recipients.length === 0) {
        toast({
          title: "Error",
          description: "No pending recipients found for this campaign",
          variant: "destructive",
        });
        return;
      }

      // Update campaign status
      await supabase
        .from('email_campaigns')
        .update({ status: 'sending' })
        .eq('id', campaign.id);

      // Send emails via edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'campaign',
          campaignId: campaign.id,
          templateId: campaign.template_id,
          subject: campaign.subject,
          from: userEmail ? `${userEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())} - EaseLearn <${userEmail}>` : undefined,
          recipients: recipients.map(r => ({
            email: r.email,
            name: r.name,
            leadId: r.lead_id,
            variables: {
              first_name: r.name?.split(' ')[0] || '',
              company_name: 'Easeworks',
              sender_name: userEmail?.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Sales Team'
            }
          }))
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Campaign sent to ${data.totalSent} recipients`,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send campaign",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600">Create and manage bulk email campaigns</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
              <DialogDescription>
                Create a new email campaign to send to multiple leads
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Campaign Details</TabsTrigger>
                <TabsTrigger value="recipients">Select Recipients</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    placeholder="Q4 Follow-up Campaign"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={newCampaign.template_id} onValueChange={(value) => setNewCampaign({...newCampaign, template_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - {template.template_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                    placeholder="Following up on your HR needs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="send_at">Schedule Send (Optional)</Label>
                  <Input
                    id="send_at"
                    type="datetime-local"
                    value={newCampaign.send_at}
                    onChange={(e) => setNewCampaign({...newCampaign, send_at: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="recipients" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Select Recipients</h3>
                    <div className="text-sm text-gray-600">
                      {selectedLeads.length} of {leads.length} selected
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {leads.map((lead) => (
                      <div key={lead.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLeads([...selectedLeads, lead.id]);
                            } else {
                              setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {lead.first_name} {lead.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {lead.email} • {lead.company_name}
                          </div>
                        </div>
                        <Badge variant="outline">{lead.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {campaign.name}
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{campaign.subject}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handleSendCampaign(campaign)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Send Now
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.total_recipients}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    Recipients
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{campaign.sent_count}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Send className="w-3 h-3" />
                    Sent
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{campaign.opened_count}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" />
                    Opened
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{campaign.clicked_count}</div>
                  <div className="text-sm text-gray-600">Clicked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{campaign.bounced_count}</div>
                  <div className="text-sm text-gray-600">Bounced</div>
                </div>
              </div>
              
              {campaign.total_recipients > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Progress</span>
                    <span>{Math.round((campaign.sent_count / campaign.total_recipients) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(campaign.sent_count / campaign.total_recipients) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No email campaigns found</p>
            <p className="text-sm">Create your first campaign to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};