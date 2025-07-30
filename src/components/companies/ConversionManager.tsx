import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, AlertTriangle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConversionManagerProps {
  onConversionComplete?: () => void;
}

export const ConversionManager = ({ onConversionComplete }: ConversionManagerProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMigrateCompanyToClient = async (companyId: string, companyName: string, source: string = 'Manual Deal') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('migrate_company_to_client', {
        p_company_id: companyId,
        p_source: source,
        p_deal_id: null,
        p_converted_by: null
      });

      if (error) throw error;

      toast({
        title: "Conversion Successful",
        description: `${companyName} has been migrated to client successfully`,
      });

      onConversionComplete?.();
      return data;
    } catch (error: any) {
      console.error("Migration error:", error);
      toast({
        title: "Migration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkForDuplicates = async (companyName: string) => {
    try {
      const { data, error } = await supabase.rpc('check_duplicate_company_client', {
        p_company_name: companyName,
        p_email: null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Duplicate check error:", error);
      return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Company-to-Client Conversion Manager
        </CardTitle>
        <CardDescription>
          Manage the flow from companies to clients. This tool helps maintain data integrity and proper workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* eCommerce Flow */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-700">eCommerce Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Direct client creation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Instant onboarding trigger</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Source: eCommerce
              </Badge>
            </CardContent>
          </Card>

          {/* Sales Flow */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-700">Sales Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span>Company → Deal → Client</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-blue-600" />
                <span>White glove onboarding</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Source: Sales
              </Badge>
            </CardContent>
          </Card>

          {/* Manual Flow */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-700">Manual Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-purple-600" />
                <span>Manual intervention</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-purple-600" />
                <span>Custom onboarding</span>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Source: Manual Deal
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-2">Key Features:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Automatic duplicate prevention across Company and Client tables</li>
            <li>• Full data migration with audit trail</li>
            <li>• Source attribution for proper reporting</li>
            <li>• Automatic deal closure triggers</li>
            <li>• Differentiated onboarding workflows</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};