import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useEmailCampaigns } from "@/modules/HaaLO.CRM/hooks/useEmailCampaigns";
import { useEmailTemplates } from "@/modules/HaaLO.CRM/hooks/useEmailTemplates";
import { supabase } from "@/integrations/supabase/client";
import { BrandFilter } from "@/components/admin/BrandFilter";
import { BrandIdentity } from "@/types/brand";
import { BrandService } from "@/services/BrandService";
import { Mail, Send, Calendar, BarChart3, Users, Plus, RotateCcw, ExternalLink } from "lucide-react";

interface MailchimpList {
  id: string;
  name: string;
  member_count: number;
  open_rate: number;
  click_rate: number;
}

interface MailchimpAnalytics {
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  open_rate: number;
  click_rate: number;
}

export const BulkEmailManager = () => {
  const { campaigns, loading: campaignsLoading } = useEmailCampaigns();
  const { templates, loading: templatesLoading } = useEmailTemplates();
  const [mailchimpLists, setMailchimpLists] = useState<MailchimpList[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [analytics, setAnalytics] = useState<Record<string, MailchimpAnalytics>>({});
  const [selectedBrands, setSelectedBrands] = useState<BrandIdentity[]>([]);

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    subject: "",
    content: "",
    template_id: "",
    mailchimp_list_id: "",
    schedule_date: "",
    sync_to_mailchimp: true,
    brand_identity: null as BrandIdentity | null
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    content: "",
    sync_to_mailchimp: true,
    brand_identity: null as BrandIdentity | null
  });

  useEffect(() => {
    fetchMailchimpLists();
    fetchAnalytics();
  }, []);

  const fetchMailchimpLists = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('mailchimp-get-lists');
      if (error) throw error;
      setMailchimpLists(data.lists || []);
    } catch (error) {
      console.error('Error fetching Mailchimp lists:', error);
      toast.error('Failed to fetch Mailchimp lists');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('mailchimp-sync-analytics');
      if (error) throw error;
      
      // Process analytics data
      const analyticsMap: Record<string, MailchimpAnalytics> = {};
      data.analytics?.forEach((item: any) => {
        analyticsMap[item.campaign_id] = item;
      });
      setAnalytics(analyticsMap);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const createCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsCreatingCampaign(true);
    setSyncProgress(0);

    try {
      // Create local campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaignForm.name,
          subject: campaignForm.subject,
          status: 'draft',
          sync_analytics: campaignForm.sync_to_mailchimp,
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (campaignError) throw campaignError;
      setSyncProgress(50);

      // Sync to Mailchimp if enabled
      if (campaignForm.sync_to_mailchimp && campaignForm.mailchimp_list_id) {
        const { error: syncError } = await supabase.functions.invoke('mailchimp-sync-campaign', {
          body: {
            campaign_id: campaign.id,
            action: 'create',
            list_id: campaignForm.mailchimp_list_id,
            schedule_date: campaignForm.schedule_date || null
          }
        });

        if (syncError) throw syncError;
      }

      setSyncProgress(100);
      toast.success('Campaign created successfully');
      
      // Reset form
      setCampaignForm({
        name: "",
        subject: "",
        content: "",
        template_id: "",
        mailchimp_list_id: "",
        schedule_date: "",
        sync_to_mailchimp: true,
        brand_identity: null
      });
      
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setIsCreatingCampaign(false);
      setSyncProgress(0);
    }
  };

  const createTemplate = async () => {
    if (!templateForm.name || !templateForm.subject) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsCreatingTemplate(true);

    try {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .insert({
          name: templateForm.name,
          subject: templateForm.subject,
          html_content: templateForm.content,
          sync_to_mailchimp: templateForm.sync_to_mailchimp,
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (templateError) throw templateError;

      toast.success('Template created successfully');
      
      // Reset form
      setTemplateForm({
        name: "",
        subject: "",
        content: "",
        sync_to_mailchimp: true,
        brand_identity: null
      });
      
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error(error.message || 'Failed to create template');
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase.functions.invoke('mailchimp-sync-campaign', {
        body: {
          campaign_id: campaignId,
          action: 'send'
        }
      });

      if (error) throw error;
      toast.success('Campaign sent successfully');
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      toast.error(error.message || 'Failed to send campaign');
    }
  };

  const syncAnalytics = async () => {
    try {
      await fetchAnalytics();
      toast.success('Analytics synced successfully');
    } catch (error) {
      toast.error('Failed to sync analytics');
    }
  };

  if (campaignsLoading || templatesLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">Manage campaigns and templates with Mailchimp integration</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={syncAnalytics} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Sync Analytics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">
            <Mail className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Mail className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Campaigns</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {isCreatingCampaign && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Creating campaign...</span>
                        <span>{syncProgress}%</span>
                      </div>
                      <Progress value={syncProgress} />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Campaign Name *</Label>
                      <Input
                        id="name"
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter campaign name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Line *</Label>
                      <Input
                        id="subject"
                        value={campaignForm.subject}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter subject line"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template">Template</Label>
                      <Select 
                        value={campaignForm.template_id}
                        onValueChange={(value) => setCampaignForm(prev => ({ ...prev, template_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand Identity</Label>
                      <Select 
                        value={campaignForm.brand_identity || "easeworks"}
                        onValueChange={(value) => setCampaignForm(prev => ({ ...prev, brand_identity: value as BrandIdentity }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easeworks">Easeworks</SelectItem>
                          <SelectItem value="easelearn">EaseLearn</SelectItem>
                          <SelectItem value="dual">Dual Brand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={campaignForm.content}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter email content"
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sync-mailchimp"
                      checked={campaignForm.sync_to_mailchimp}
                      onCheckedChange={(checked) => setCampaignForm(prev => ({ ...prev, sync_to_mailchimp: checked }))}
                    />
                    <Label htmlFor="sync-mailchimp">Sync to Mailchimp</Label>
                  </div>

                  {campaignForm.sync_to_mailchimp && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mailchimp Audience</Label>
                        <Select 
                          value={campaignForm.mailchimp_list_id}
                          onValueChange={(value) => setCampaignForm(prev => ({ ...prev, mailchimp_list_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience" />
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
                      <div className="space-y-2">
                        <Label htmlFor="schedule">Schedule Date (optional)</Label>
                        <Input
                          id="schedule"
                          type="datetime-local"
                          value={campaignForm.schedule_date}
                          onChange={(e) => setCampaignForm(prev => ({ ...prev, schedule_date: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={createCampaign} 
                      disabled={isCreatingCampaign}
                    >
                      {isCreatingCampaign ? 'Creating...' : 'Create Campaign'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    {(campaign as any).mailchimp_campaign_id && (
                      <Badge variant="secondary">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Mailchimp
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    {analytics[campaign.id] && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Opens: {analytics[campaign.id].opens}</div>
                        <div>Clicks: {analytics[campaign.id].clicks}</div>
                        <div>Open Rate: {analytics[campaign.id].open_rate}%</div>
                        <div>Click Rate: {analytics[campaign.id].click_rate}%</div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {campaign.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => sendCampaign(campaign.id)}
                          className="flex-1"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name *</Label>
                      <Input
                        id="template-name"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter template name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-subject">Default Subject *</Label>
                      <Input
                        id="template-subject"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter default subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-brand">Brand Identity</Label>
                      <Select 
                        value={templateForm.brand_identity || "easeworks"}
                        onValueChange={(value) => setTemplateForm(prev => ({ ...prev, brand_identity: value as BrandIdentity }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easeworks">Easeworks</SelectItem>
                          <SelectItem value="easelearn">EaseLearn</SelectItem>
                          <SelectItem value="dual">Dual Brand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-content">Template Content</Label>
                    <Textarea
                      id="template-content"
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter template content"
                      rows={8}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="template-sync"
                      checked={templateForm.sync_to_mailchimp}
                      onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, sync_to_mailchimp: checked }))}
                    />
                    <Label htmlFor="template-sync">Sync to Mailchimp</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={createTemplate} 
                      disabled={isCreatingTemplate}
                    >
                      {isCreatingTemplate ? 'Creating...' : 'Create Template'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {(template as any).mailchimp_template_id && (
                      <Badge variant="secondary">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Mailchimp
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold">Campaign Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'sent').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(analytics).length > 0 
                    ? Math.round(Object.values(analytics).reduce((sum, a) => sum + a.open_rate, 0) / Object.values(analytics).length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(analytics).length > 0 
                    ? Math.round(Object.values(analytics).reduce((sum, a) => sum + a.click_rate, 0) / Object.values(analytics).length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mailchimp Audiences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mailchimpLists.map((list) => (
                  <div key={list.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{list.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {list.member_count} members
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        Open: {list.open_rate}% | Click: {list.click_rate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};