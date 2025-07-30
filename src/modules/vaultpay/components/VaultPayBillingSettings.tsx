import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, DollarSign, Calendar, Settings2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface VaultPaySettings {
  vaultpay_fee_type: 'per_employee' | 'flat_fee';
  vaultpay_rate_per_employee: number;
  vaultpay_flat_fee: number;
  vaultpay_terms_days: number;
  vaultpay_auto_send_invoice: boolean;
  vaultpay_include_register_pdf: boolean;
}

interface VaultPayBillingSettingsProps {
  companyId?: string;
}

export const VaultPayBillingSettings = ({ companyId }: VaultPayBillingSettingsProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<VaultPaySettings>({
    vaultpay_fee_type: 'per_employee',
    vaultpay_rate_per_employee: 25.00,
    vaultpay_flat_fee: 500.00,
    vaultpay_terms_days: 10,
    vaultpay_auto_send_invoice: true,
    vaultpay_include_register_pdf: false
  });

  useEffect(() => {
    if (companyId || user) {
      loadSettings();
    }
  }, [companyId, user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      let targetCompanyId = companyId;
      
      // If no companyId provided, get user's company
      if (!targetCompanyId && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
        
        targetCompanyId = profile?.company_id;
      }

      if (!targetCompanyId) {
        toast.error("Company not found");
        return;
      }

      const { data, error } = await supabase
        .from('company_settings')
        .select(`
          vaultpay_fee_type,
          vaultpay_rate_per_employee,
          vaultpay_flat_fee,
          vaultpay_terms_days,
          vaultpay_auto_send_invoice,
          vaultpay_include_register_pdf
        `)
        .eq('id', targetCompanyId)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          vaultpay_fee_type: (data.vaultpay_fee_type as 'per_employee' | 'flat_fee') || 'per_employee',
          vaultpay_rate_per_employee: data.vaultpay_rate_per_employee || 25.00,
          vaultpay_flat_fee: data.vaultpay_flat_fee || 500.00,
          vaultpay_terms_days: data.vaultpay_terms_days || 10,
          vaultpay_auto_send_invoice: data.vaultpay_auto_send_invoice ?? true,
          vaultpay_include_register_pdf: data.vaultpay_include_register_pdf ?? false
        });
      }
    } catch (error) {
      console.error('Error loading VaultPay settings:', error);
      toast.error("Failed to load VaultPay settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      let targetCompanyId = companyId;
      
      if (!targetCompanyId && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
        
        targetCompanyId = profile?.company_id;
      }

      if (!targetCompanyId) {
        toast.error("Company not found");
        return;
      }

      const { error } = await supabase
        .from('company_settings')
        .update({
          vaultpay_fee_type: settings.vaultpay_fee_type,
          vaultpay_rate_per_employee: settings.vaultpay_rate_per_employee,
          vaultpay_flat_fee: settings.vaultpay_flat_fee,
          vaultpay_terms_days: settings.vaultpay_terms_days,
          vaultpay_auto_send_invoice: settings.vaultpay_auto_send_invoice,
          vaultpay_include_register_pdf: settings.vaultpay_include_register_pdf
        })
        .eq('id', targetCompanyId);

      if (error) throw error;

      toast.success("VaultPay settings saved successfully!");
    } catch (error) {
      console.error('Error saving VaultPay settings:', error);
      toast.error("Failed to save VaultPay settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof VaultPaySettings>(
    key: K,
    value: VaultPaySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateEstimate = () => {
    const employees = 50; // Example employee count
    if (settings.vaultpay_fee_type === 'flat_fee') {
      return settings.vaultpay_flat_fee;
    } else {
      return employees * settings.vaultpay_rate_per_employee;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Loading VaultPay settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          VaultPay Billing Settings
        </CardTitle>
        <CardDescription>
          Configure automatic invoice generation for payroll processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fee Structure */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Billing Model</Label>
            <p className="text-sm text-muted-foreground">
              Choose how to charge for payroll processing services
            </p>
          </div>
          
          <Select 
            value={settings.vaultpay_fee_type} 
            onValueChange={(value: 'per_employee' | 'flat_fee') => 
              updateSetting('vaultpay_fee_type', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per_employee">Per Employee</SelectItem>
              <SelectItem value="flat_fee">Flat Fee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Pricing Configuration */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Pricing</Label>
            <p className="text-sm text-muted-foreground">
              Set your rates for payroll processing
            </p>
          </div>

          {settings.vaultpay_fee_type === 'per_employee' ? (
            <div className="space-y-2">
              <Label htmlFor="rate-per-employee">Rate per Employee</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="rate-per-employee"
                  type="number"
                  placeholder="25.00"
                  min="0"
                  step="0.01"
                  value={settings.vaultpay_rate_per_employee}
                  onChange={(e) => updateSetting('vaultpay_rate_per_employee', parseFloat(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Amount charged per employee in each payroll run
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="flat-fee">Flat Fee per Payroll</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="flat-fee"
                  type="number"
                  placeholder="500.00"
                  min="0"
                  step="0.01"
                  value={settings.vaultpay_flat_fee}
                  onChange={(e) => updateSetting('vaultpay_flat_fee', parseFloat(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Fixed amount charged for each payroll run, regardless of employee count
              </p>
            </div>
          )}

          {/* Estimate */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Estimate for 50 employees: {formatCurrency(calculateEstimate())}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Invoice Terms */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Invoice Terms</Label>
            <p className="text-sm text-muted-foreground">
              Configure invoice payment terms and automation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms-days">Payment Terms (Days)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="terms-days"
                type="number"
                placeholder="10"
                min="1"
                max="90"
                value={settings.vaultpay_terms_days}
                onChange={(e) => updateSetting('vaultpay_terms_days', parseInt(e.target.value) || 10)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Number of days from invoice date to due date
            </p>
          </div>
        </div>

        <Separator />

        {/* Automation Settings */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Automation</Label>
            <p className="text-sm text-muted-foreground">
              Configure automatic invoice generation behavior
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-send">Auto-send Invoices</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically mark invoices as "sent" when created
                </p>
              </div>
              <Switch
                id="auto-send"
                checked={settings.vaultpay_auto_send_invoice}
                onCheckedChange={(checked) => updateSetting('vaultpay_auto_send_invoice', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="include-pdf">Include Payroll Register</Label>
                <p className="text-xs text-muted-foreground">
                  Attach payroll register PDF to invoices (when available)
                </p>
              </div>
              <Switch
                id="include-pdf"
                checked={settings.vaultpay_include_register_pdf}
                onCheckedChange={(checked) => updateSetting('vaultpay_include_register_pdf', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* How It Works */}
        <div className="space-y-3">
          <Label className="text-base font-medium">How Automatic Billing Works</Label>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. When a payroll run is finalized, VaultPay automatically creates an invoice</p>
            <p>2. The invoice includes the payroll period and employee count</p>
            <p>3. Pricing is calculated based on your selected billing model</p>
            <p>4. Invoices appear in VaultPay for admin review and client access</p>
            <p>5. Payment terms and due dates are automatically calculated</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};