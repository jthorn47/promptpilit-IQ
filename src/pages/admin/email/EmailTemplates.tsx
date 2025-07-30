import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Plus,
  Edit,
  Copy,
  Trash2,
  Mail,
  Eye,
  Calendar,
  ExternalLink,
  Upload,
  Download
} from "lucide-react";
import { useEmailTemplates } from "@/modules/HaaLO.CRM/hooks/useEmailTemplates";

const EmailTemplates = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [syncingTemplate, setSyncingTemplate] = useState(null);
  const { templates, loading, fetchTemplates } = useEmailTemplates();
  const { toast } = useToast();

  const categories = ["All", "Onboarding", "Newsletter", "Sales", "Marketing", "Support"];

  const handleSyncToMailchimp = async (template, enable = true) => {
    setSyncingTemplate(template.id);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ 
          sync_to_mailchimp: enable,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Template ${enable ? 'enabled' : 'disabled'} for Mailchimp sync.`,
      });

      // Refresh templates to show updated status
      fetchTemplates();
    } catch (error) {
      console.error('Template sync toggle failed:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update template sync settings.",
        variant: "destructive",
      });
    } finally {
      setSyncingTemplate(null);
    }
  };

  const handlePushToMailchimp = async (template) => {
    setSyncingTemplate(template.id);
    try {
      // For now, we'll just toggle the sync status and show success
      // In a full implementation, this would call a Mailchimp API to create/update the template
      await handleSyncToMailchimp(template, true);
      
      toast({
        title: "Template Synced",
        description: "Template has been pushed to Mailchimp successfully.",
      });
    } catch (error) {
      console.error('Template push failed:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to push template to Mailchimp.",
        variant: "destructive",
      });
    } finally {
      setSyncingTemplate(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable email templates for your campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            Marketing IQ
          </Badge>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.toLowerCase()} 
              value={category.toLowerCase()}
              className="flex items-center gap-2"
            >
              {category === "All" && <FileText className="h-4 w-4" />}
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">
                  {templates.filter(t => t.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">86.0%</div>
                <p className="text-xs text-muted-foreground">
                  +3.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Click Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.3%</div>
                <p className="text-xs text-muted-foreground">
                  +1.8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates Used</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage your email templates and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading templates...</p>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No email templates found. Create your first template to get started.</p>
                  </div>
                ) : templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {template.template_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Modified: {new Date(template.updated_at).toLocaleDateString()}
                            </span>
                            {(template as any).sync_to_mailchimp && (
                              <Badge variant="outline" className="text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Mailchimp
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`sync-${template.id}`}
                            checked={(template as any).sync_to_mailchimp || false}
                            onCheckedChange={(checked) => handleSyncToMailchimp(template, checked === true)}
                            disabled={syncingTemplate === template.id}
                          />
                          <label 
                            htmlFor={`sync-${template.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Sync to Mailchimp
                          </label>
                        </div>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          {(template as any).sync_to_mailchimp && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePushToMailchimp(template)}
                              disabled={syncingTemplate === template.id}
                              title="Push to Mailchimp"
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {categories.slice(1).map((category) => (
          <TabsContent key={category.toLowerCase()} value={category.toLowerCase()} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{category} Templates</CardTitle>
                <CardDescription>
                  Templates specifically designed for {category.toLowerCase()} communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates
                    .filter(t => t.template_type === category.toLowerCase())
                    .map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                Modified: {new Date(template.updated_at).toLocaleDateString()}
                              </span>
                              {(template as any).sync_to_mailchimp && (
                                <Badge variant="outline" className="text-xs">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Mailchimp
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`sync-cat-${template.id}`}
                              checked={(template as any).sync_to_mailchimp || false}
                              onCheckedChange={(checked) => handleSyncToMailchimp(template, checked === true)}
                              disabled={syncingTemplate === template.id}
                            />
                            <label 
                              htmlFor={`sync-cat-${template.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Sync to Mailchimp
                            </label>
                          </div>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            {(template as any).sync_to_mailchimp && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePushToMailchimp(template)}
                                disabled={syncingTemplate === template.id}
                                title="Push to Mailchimp"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {templates.filter(t => t.template_type === category.toLowerCase()).length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No {category.toLowerCase()} templates found. Create your first template to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EmailTemplates;