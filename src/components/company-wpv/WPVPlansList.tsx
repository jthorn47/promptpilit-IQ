import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Trash2, Bot, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WPVPlan {
  id: string;
  plan_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  status: string;
  ai_content_generated: boolean;
  ai_generation_date: string | null;
}

interface WPVPlansListProps {
  companyId: string;
  onGenerateAIContent?: (planId: string) => void;
}

export const WPVPlansList = ({ companyId, onGenerateAIContent }: WPVPlansListProps) => {
  const [plans, setPlans] = useState<WPVPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, [companyId]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('wpv_plans')
        .select('*')
        .eq('company_id', companyId)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching WPV plans:', error);
      toast({
        title: "Error",
        description: "Failed to load WPV plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (plan: WPVPlan) => {
    try {
      const { data, error } = await supabase.storage
        .from('wpv-plans')
        .download(plan.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = plan.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${plan.file_name}`,
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (plan: WPVPlan) => {
    if (!confirm(`Are you sure you want to delete "${plan.plan_name}"?`)) {
      return;
    }

    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('wpv-plans')
        .remove([plan.file_path]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await supabase
        .from('wpv_plans')
        .delete()
        .eq('id', plan.id);

      if (dbError) throw dbError;

      toast({
        title: "Plan Deleted",
        description: `"${plan.plan_name}" has been deleted successfully.`,
      });

      fetchPlans(); // Refresh the list
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading WPV plans...</p>
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No WPV Plans Found</h3>
          <p className="text-muted-foreground">
            Upload your first Workplace Violence Prevention plan to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Uploaded WPV Plans</h3>
        <Badge variant="outline">
          {plans.length} plan{plans.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-1">{plan.plan_name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{plan.file_name}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(plan.upload_date)}
                      </span>
                      <span>{formatFileSize(plan.file_size)}</span>
                      <Badge variant={plan.status === 'uploaded' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </div>

                    {plan.ai_content_generated && plan.ai_generation_date && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                        <Bot className="w-3 h-3" />
                        AI content generated on {formatDate(plan.ai_generation_date)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!plan.ai_content_generated && onGenerateAIContent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onGenerateAIContent(plan.id)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Bot className="w-4 h-4 mr-1" />
                      Generate AI Content
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(plan)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};