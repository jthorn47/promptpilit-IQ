import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SaveIcon, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkersCompTable } from "./WorkersCompTable";
import { AdditionalFeesSettings } from "./AdditionalFeesSettings";

interface TaxSetting {
  key: string;
  label: string;
  description: string;
  value: string;
  type: "percentage" | "currency" | "number";
}

const DEFAULT_TAX_SETTINGS: TaxSetting[] = [
  {
    key: "fica_employer_rate",
    label: "Employer Social Security (FICA) Tax Rate",
    description: "The employer's contribution rate for Social Security taxes",
    value: "6.2",
    type: "percentage"
  },
  {
    key: "fica_wage_cap",
    label: "Social Security Wage Cap",
    description: "Maximum annual earnings subject to Social Security tax",
    value: "176100",
    type: "currency"
  },
  {
    key: "medicare_employer_rate",
    label: "Employer Medicare Rate",
    description: "The employer's contribution rate for Medicare taxes",
    value: "1.45",
    type: "percentage"
  },
  {
    key: "futa_gross_rate",
    label: "FUTA Tax Rate (Gross)",
    description: "Federal Unemployment Tax Act gross rate before credits",
    value: "6.0",
    type: "percentage"
  },
  {
    key: "futa_wage_base",
    label: "FUTA Wage Base",
    description: "Maximum annual earnings per employee subject to FUTA tax",
    value: "7000",
    type: "currency"
  },
  {
    key: "futa_credit_reduction",
    label: "FUTA Default Credit Reduction",
    description: "Standard credit reduction for state unemployment taxes",
    value: "5.4",
    type: "percentage"
  },
  {
    key: "futa_net_rate",
    label: "FUTA Net Rate After Credit",
    description: "Effective FUTA rate after applying credit reduction",
    value: "0.6",
    type: "percentage"
  }
];

export const PropGENSettings = () => {
  const [taxSettings, setTaxSettings] = useState<TaxSetting[]>(DEFAULT_TAX_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTaxSettings();
  }, []);

  const loadTaxSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value, updated_at')
        .in('key', DEFAULT_TAX_SETTINGS.map(s => s.key));

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedSettings = DEFAULT_TAX_SETTINGS.map(defaultSetting => {
          const savedSetting = data.find(d => d.key === defaultSetting.key);
          return savedSetting 
            ? { ...defaultSetting, value: String(savedSetting.value) }
            : defaultSetting;
        });
        setTaxSettings(updatedSettings);
        
        // Find most recent update
        const mostRecent = data.reduce((latest, current) => {
          return new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest;
        });
        setLastUpdated(mostRecent.updated_at);
      }
    } catch (error) {
      console.error('Error loading tax settings:', error);
      toast({
        title: "Error",
        description: "Failed to load tax settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setTaxSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
  };

  const saveTaxSettings = async () => {
    try {
      setLoading(true);
      
      // Prepare upsert data
      const upsertData = taxSettings.map(setting => ({
        key: setting.key,
        value: setting.value,
        category: 'propgen',
        description: setting.description,
        is_public: false,
        created_by: '00000000-0000-0000-0000-000000000000'
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(upsertData, { onConflict: 'key' });

      if (error) throw error;

      setLastUpdated(new Date().toISOString());
      toast({
        title: "Success",
        description: "Tax settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving tax settings:', error);
      toast({
        title: "Error",
        description: "Failed to save tax settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (setting: TaxSetting) => {
    switch (setting.type) {
      case "percentage":
        return `${setting.value}%`;
      case "currency":
        return `$${parseFloat(setting.value).toLocaleString()}`;
      default:
        return setting.value;
    }
  };

  return (
    <Tabs defaultValue="taxes" className="space-y-6" onValueChange={(value) => {
      console.log('🔍 PropGEN Tab changed to:', value);
    }}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="taxes" onClick={() => console.log('🔍 Taxes tab clicked')}>
          FICA & Payroll Taxes
        </TabsTrigger>
        <TabsTrigger value="workerscomp" onClick={() => console.log('🔍 Workers comp tab clicked')}>
          Workers' Comp Classifications
        </TabsTrigger>
        <TabsTrigger value="additional-fees" onClick={() => console.log('🔍 Additional fees tab clicked')}>
          Additional Fees
        </TabsTrigger>
      </TabsList>

      <TabsContent value="taxes" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">FICA & Payroll Tax Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure default tax rates and wage caps for payroll calculations
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <Badge variant="outline" className="text-xs">
                Updated: {new Date(lastUpdated).toLocaleDateString()}
              </Badge>
            )}
            <Button onClick={loadTaxSettings} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={saveTaxSettings} disabled={loading}>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6">
          {taxSettings.map((setting) => (
            <Card key={setting.key}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{setting.label}</Label>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {formatValue(setting)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-2">
                  {setting.type === "percentage" && (
                    <span className="text-sm text-muted-foreground">%</span>
                  )}
                  {setting.type === "currency" && (
                    <span className="text-sm text-muted-foreground">$</span>
                  )}
                  <Input
                    type="number"
                    step={setting.type === "percentage" ? "0.01" : "1"}
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    className="max-w-xs"
                  />
                  {setting.type === "percentage" && setting.key.includes("rate") && (
                    <span className="text-sm text-muted-foreground">percent</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Important Notice</p>
                <p className="text-xs text-orange-700 mt-1">
                  These tax rates are used globally across all PropGEN calculations. Changes will affect all future proposals and investment analyses. Please verify rates are current before saving.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="workerscomp" className="space-y-6">
        <WorkersCompTable />
      </TabsContent>

      <TabsContent value="additional-fees" className="space-y-6">
        <AdditionalFeesSettings />
      </TabsContent>
    </Tabs>
  );
};