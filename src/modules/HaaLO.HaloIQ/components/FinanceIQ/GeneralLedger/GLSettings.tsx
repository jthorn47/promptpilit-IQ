import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Calendar, Shield, Hash } from 'lucide-react';
import { useGLSettings } from '@/modules/HaaLO.Shared/hooks/useGLModule';

interface GLSettingsProps {
  companyId: string;
}

export const GLSettings: React.FC<GLSettingsProps> = ({ companyId }) => {
  const { settings, updateSettings, isLoading, isUpdating } = useGLSettings(companyId);
  
  const [formData, setFormData] = useState({
    auto_journal_number_prefix: 'JE',
    current_period_open: '',
    next_period_open: '',
    allow_future_posting: true,
    require_batch_approval: false,
    lock_posted_entries: true,
    default_posting_rules: {} as Record<string, any>
  });

  const [postingRulesText, setPostingRulesText] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        auto_journal_number_prefix: settings.auto_journal_number_prefix,
        current_period_open: settings.current_period_open?.split('T')[0] || '',
        next_period_open: settings.next_period_open?.split('T')[0] || '',
        allow_future_posting: settings.allow_future_posting,
        require_batch_approval: settings.require_batch_approval,
        lock_posted_entries: settings.lock_posted_entries,
        default_posting_rules: settings.default_posting_rules || {}
      });
      
      setPostingRulesText(JSON.stringify(settings.default_posting_rules || {}, null, 2));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      let postingRules = {};
      if (postingRulesText.trim()) {
        try {
          postingRules = JSON.parse(postingRulesText);
        } catch (error) {
          alert('Invalid JSON in posting rules. Please check the format.');
          return;
        }
      }

      await updateSettings({
        ...formData,
        default_posting_rules: postingRules
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetToDefaults = () => {
    setFormData({
      auto_journal_number_prefix: 'JE',
      current_period_open: '',
      next_period_open: '',
      allow_future_posting: true,
      require_batch_approval: false,
      lock_posted_entries: true,
      default_posting_rules: {}
    });
    setPostingRulesText('{}');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            General Ledger Settings
          </h1>
          <p className="text-muted-foreground">
            Configure posting rules, period management, and journal entry preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Journal Numbering */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Journal Numbering
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prefix">Journal Number Prefix</Label>
              <Input
                id="prefix"
                value={formData.auto_journal_number_prefix}
                onChange={(e) => setFormData({ ...formData, auto_journal_number_prefix: e.target.value })}
                placeholder="JE"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Journal numbers will be formatted as: {formData.auto_journal_number_prefix}-000001
              </p>
            </div>
            
            {settings && (
              <div>
                <Label>Next Journal Number</Label>
                <div className="text-lg font-mono">
                  {formData.auto_journal_number_prefix}-{String(settings.next_journal_number).padStart(6, '0')}
                </div>
                <p className="text-sm text-muted-foreground">
                  This will be automatically assigned to the next journal entry
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Period Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Period Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current_period">Current Period Open Date</Label>
              <Input
                id="current_period"
                type="date"
                value={formData.current_period_open}
                onChange={(e) => setFormData({ ...formData, current_period_open: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Entries before this date may be restricted
              </p>
            </div>
            
            <div>
              <Label htmlFor="next_period">Next Period Open Date</Label>
              <Input
                id="next_period"
                type="date"
                value={formData.next_period_open}
                onChange={(e) => setFormData({ ...formData, next_period_open: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                When the next accounting period begins
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Future Posting</Label>
                <p className="text-sm text-muted-foreground">
                  Allow journal entries with future dates
                </p>
              </div>
              <Switch
                checked={formData.allow_future_posting}
                onCheckedChange={(checked) => setFormData({ ...formData, allow_future_posting: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Batch Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require review before posting journal batches
                </p>
              </div>
              <Switch
                checked={formData.require_batch_approval}
                onCheckedChange={(checked) => setFormData({ ...formData, require_batch_approval: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lock Posted Entries</Label>
                <p className="text-sm text-muted-foreground">
                  Prevent editing of posted journal entries
                </p>
              </div>
              <Switch
                checked={formData.lock_posted_entries}
                onCheckedChange={(checked) => setFormData({ ...formData, lock_posted_entries: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Posting Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Default Posting Rules</CardTitle>
            <p className="text-sm text-muted-foreground">
              JSON configuration for automatic posting rules from other modules
            </p>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="posting_rules">Posting Rules (JSON)</Label>
              <Textarea
                id="posting_rules"
                value={postingRulesText}
                onChange={(e) => setPostingRulesText(e.target.value)}
                placeholder='{"payroll": {"wages_account": "5000", "tax_account": "2100"}}'
                className="font-mono text-sm"
                rows={10}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Configure default account mappings for automated journal entries
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Example Configuration:</h4>
              <pre className="text-xs overflow-auto">
{`{
  "payroll": {
    "wages_account": "5000",
    "federal_tax_account": "2100",
    "state_tax_account": "2110",
    "fica_account": "2120"
  },
  "accounts_payable": {
    "default_ap_account": "2000",
    "default_expense_account": "6000"
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Settings Summary */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Journal Prefix</Label>
                <div className="font-mono">{settings.auto_journal_number_prefix}</div>
              </div>
              
              <div>
                <Label>Next Number</Label>
                <div className="font-mono">
                  {settings.auto_journal_number_prefix}-{String(settings.next_journal_number).padStart(6, '0')}
                </div>
              </div>
              
              <div>
                <Label>Future Posting</Label>
                <div className={settings.allow_future_posting ? 'text-green-600' : 'text-red-600'}>
                  {settings.allow_future_posting ? 'Allowed' : 'Blocked'}
                </div>
              </div>
              
              <div>
                <Label>Batch Approval</Label>
                <div className={settings.require_batch_approval ? 'text-orange-600' : 'text-blue-600'}>
                  {settings.require_batch_approval ? 'Required' : 'Not Required'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};