import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, 
  Plus,
  Play,
  Pause,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Eye,
  MousePointer,
  RefreshCw,
  Send,
  ExternalLink,
  RotateCw
} from "lucide-react";
import { useEmailCampaigns } from "@/modules/HaaLO.CRM/hooks/useEmailCampaigns";

const EmailCampaigns = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [mailchimpLists, setMailchimpLists] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedList, setSelectedList] = useState("");
  const [isMailchimpDialogOpen, setIsMailchimpDialogOpen] = useState(false);
  const [syncingCampaign, setSyncingCampaign] = useState(null);
  const { campaigns, loading, fetchCampaigns } = useEmailCampaigns();
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

  const handleRefresh = () => {
    fetchCampaigns();
    fetchMailchimpLists();
  };

  const handleSyncToMailchimp = async (campaign, action = 'create') => {
    if (!selectedList && action === 'create') {
      toast({
        title: "List Required",
        description: "Please select a Mailchimp list first.",
        variant: "destructive",
      });
      return;
    }

    setSyncingCampaign(campaign.id);
    try {
      const { data, error } = await supabase.functions.invoke('mailchimp-sync-campaign', {
        body: {
          campaignId: campaign.id,
          listId: selectedList || (campaign as any).mailchimp_list_id,
          action: action
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: action === 'create' 
          ? `Campaign synced to Mailchimp successfully.` 
          : `Campaign ${action} action completed.`,
      });

      // Refresh campaigns to show updated status
      fetchCampaigns();
      setIsMailchimpDialogOpen(false);
    } catch (error) {
      console.error('Mailchimp sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with Mailchimp.",
        variant: "destructive",
      });
    } finally {
      setSyncingCampaign(null);
    }
  };

  const handleSyncAnalytics = async (campaignId = null) => {
    try {
      const { data, error } = await supabase.functions.invoke('mailchimp-sync-analytics', {
        body: { campaignId }
      });

      if (error) throw error;

      toast({
        title: "Analytics Synced",
        description: `Successfully synced analytics for ${data.synced_campaigns} campaign(s).`,
      });

      // Refresh campaigns to show updated analytics
      fetchCampaigns();
    } catch (error) {
      console.error('Analytics sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync analytics from Mailchimp.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create, manage, and track your email marketing campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            Marketing IQ
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSyncAnalytics()}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Sync Analytics
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <Pause className="h-4 w-4" />
            Drafts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === "sent" || c.status === "sending").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns
                    .filter(c => c.status === "sent" || c.status === "sending")
                    .reduce((sum, c) => sum + (c.sent_count || 0), 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across active campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.length > 0 
                    ? (campaigns.reduce((sum, c) => sum + ((c as any).opens || c.opened_count || 0), 0) / Math.max(campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0), 1) * 100).toFixed(1) + '%'
                    : '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  From Mailchimp analytics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Click Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.length > 0 
                    ? (campaigns.reduce((sum, c) => sum + ((c as any).clicks || c.clicked_count || 0), 0) / Math.max(campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0), 1) * 100).toFixed(1) + '%'
                    : '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  From Mailchimp analytics
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Currently running email campaigns and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading campaigns...</p>
                  </div>
                ) : campaigns.filter(c => c.status === "sent" || c.status === "sending").length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No active campaigns found.</p>
                  </div>
                ) : campaigns
                  .filter(c => c.status === "sent" || c.status === "sending")
                  .map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Play className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">{campaign.subject || "No subject"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Created: {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                            {(campaign as any).mailchimp_campaign_id && (
                              <Badge variant="outline" className="text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Mailchimp
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Sent:</span> {(campaign.sent_count || 0).toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Opens:</span> {(campaign as any).opens || campaign.opened_count || 0}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Clicks:</span> {(campaign as any).clicks || campaign.clicked_count || 0}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={(campaign as any).mailchimp_status ? "default" : "secondary"}>
                            {(campaign as any).mailchimp_status || campaign.status}
                          </Badge>
                          {!(campaign as any).mailchimp_campaign_id ? (
                            <Dialog open={isMailchimpDialogOpen && selectedCampaign?.id === campaign.id} onOpenChange={(open) => {
                              setIsMailchimpDialogOpen(open);
                              if (open) setSelectedCampaign(campaign);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Send className="h-4 w-4 mr-1" />
                                  Sync to Mailchimp
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Sync Campaign to Mailchimp</DialogTitle>
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
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      onClick={() => handleSyncToMailchimp(campaign, 'create')}
                                      disabled={syncingCampaign === campaign.id}
                                    >
                                      {syncingCampaign === campaign.id ? "Syncing..." : "Sync Campaign"}
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsMailchimpDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSyncToMailchimp(campaign, 'send')}
                                disabled={syncingCampaign === campaign.id || (campaign as any).mailchimp_status === 'sent'}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                {(campaign as any).mailchimp_status === 'sent' ? 'Sent' : 'Send Now'}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSyncAnalytics(campaign.id)}
                              >
                                <RotateCw className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Campaigns</CardTitle>
              <CardDescription>
                Finished email campaigns and their final performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns
                  .filter(c => c.status === "completed")
                  .map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">{campaign.subject || "No subject"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Sent: {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Sent:</span> {(campaign.sent_count || 0).toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Opens:</span> {campaign.opened_count || 0}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Clicks:</span> {campaign.clicked_count || 0}
                        </div>
                        <Badge variant="secondary">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Draft Campaigns</CardTitle>
              <CardDescription>
                Campaigns that are being prepared and not yet sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns
                  .filter(c => c.status === "draft")
                  .map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Pause className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">{campaign.subject || "No subject"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Created: {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Recipients:</span> {(campaign.sent_count || 0).toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Scheduled:</span> {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : "Not scheduled"}
                        </div>
                        <Badge variant="secondary">
                          Draft
                        </Badge>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and performance insights for all campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Campaign analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailCampaigns;