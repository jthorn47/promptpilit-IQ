import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings, Trophy, Award, Users, RotateCcw, Save } from 'lucide-react';

interface GamificationSettings {
  id: string;
  company_id: string;
  is_enabled: boolean;
  leaderboard_enabled: boolean;
  achievements_enabled: boolean;
  public_leaderboard: boolean;
  scoring_weights: {
    spin_completion: number;
    proposal_sent: number;
    proposal_signed: number;
    opportunity_created: number;
    task_completed: number;
    deal_closed: number;
    ai_usage: number;
  };
  achievement_thresholds: {
    spin_master: number;
    closer_threshold: number;
    task_slayer: number;
    fast_starter: number;
    pitch_pro: number;
    ai_believer: number;
    followup_freak: number;
    pipeline_builder: number;
  };
}

interface GamificationSettingsProps {
  companyId: string;
}

export function GamificationSettings({ companyId }: GamificationSettingsProps) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['gamification-settings', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_gamification_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;
      return data as any;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<GamificationSettings>) => {
      const { data, error } = await supabase
        .from('crm_gamification_settings')
        .upsert({
          company_id: companyId,
          ...updates
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-settings'] });
      toast.success('Gamification settings updated');
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });

  const resetScores = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('crm-season-manager', {
        body: { action: 'reset_scores', companyId }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leaderboard'] });
      toast.success('Scores reset successfully');
    },
    onError: () => {
      toast.error('Failed to reset scores');
    }
  });

  const handleToggle = (field: keyof GamificationSettings, value: boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  const handleWeightChange = (weight: string, value: number) => {
    if (!settings) return;
    
    updateSettings.mutate({
      scoring_weights: {
        ...settings.scoring_weights,
        [weight]: value
      }
    });
  };

  const handleThresholdChange = (threshold: string, value: number) => {
    if (!settings) return;
    
    updateSettings.mutate({
      achievement_thresholds: {
        ...settings.achievement_thresholds,
        [threshold]: value
      }
    });
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Gamification Settings</h2>
        </div>
        <Badge variant={settings?.is_enabled ? 'default' : 'secondary'}>
          {settings?.is_enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Control the overall gamification features for your CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Gamification</Label>
              <p className="text-sm text-muted-foreground">
                Turn on/off all gamification features
              </p>
            </div>
            <Switch
              checked={settings?.is_enabled || false}
              onCheckedChange={(checked) => handleToggle('is_enabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Leaderboards</Label>
              <p className="text-sm text-muted-foreground">
                Display competitive leaderboards
              </p>
            </div>
            <Switch
              checked={settings?.leaderboard_enabled || false}
              onCheckedChange={(checked) => handleToggle('leaderboard_enabled', checked)}
              disabled={!settings?.is_enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Achievements</Label>
              <p className="text-sm text-muted-foreground">
                Enable achievement badges and milestones
              </p>
            </div>
            <Switch
              checked={settings?.achievements_enabled || false}
              onCheckedChange={(checked) => handleToggle('achievements_enabled', checked)}
              disabled={!settings?.is_enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Public Leaderboard</Label>
              <p className="text-sm text-muted-foreground">
                Allow all users to see leaderboard rankings
              </p>
            </div>
            <Switch
              checked={settings?.public_leaderboard || false}
              onCheckedChange={(checked) => handleToggle('public_leaderboard', checked)}
              disabled={!settings?.is_enabled || !settings?.leaderboard_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scoring Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Activity Scoring Weights
          </CardTitle>
          <CardDescription>
            Configure point values for different CRM activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings?.scoring_weights || {}).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize">
                  {key.replace('_', ' ')}
                </Label>
                <Input
                  type="number"
                  value={String(value)}
                  onChange={(e) => handleWeightChange(key, parseInt(e.target.value) || 0)}
                  disabled={!settings?.is_enabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievement Thresholds
          </CardTitle>
          <CardDescription>
            Set the requirements for earning achievement badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings?.achievement_thresholds || {}).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize">
                  {key.replace('_', ' ')}
                </Label>
                <Input
                  type="number"
                  value={String(value)}
                  onChange={(e) => handleThresholdChange(key, parseInt(e.target.value) || 0)}
                  disabled={!settings?.is_enabled || !settings?.achievements_enabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin Actions
          </CardTitle>
          <CardDescription>
            Administrative actions for managing the gamification system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Reset All Scores</Label>
              <p className="text-sm text-muted-foreground">
                Clear all leaderboard scores and start fresh
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => resetScores.mutate()}
              disabled={resetScores.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {resetScores.isPending ? 'Resetting...' : 'Reset Scores'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}