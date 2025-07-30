
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingProgress {
  company_name: string;
  progress: number;
  status: string;
  account_manager: string;
}

export const OnboardingProgressTracker: React.FC = () => {
  const [progress, setProgress] = useState<OnboardingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOnboardingProgress();
  }, []);

  const fetchOnboardingProgress = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('onboarding-service');
      
      if (error) throw error;
      setProgress(data.progress);
      setError(null);
    } catch (err) {
      console.error('Error fetching onboarding progress:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-sm lg:text-base">Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          <p className="text-sm text-destructive">Unable to load</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
          <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">Onboarding Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          </div>
        ) : progress.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active onboarding</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {progress.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-medium truncate flex-1">{item.company_name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-1.5 sm:h-2" />
                <p className="text-xs text-muted-foreground truncate">
                  AM: {item.account_manager} • Status: {item.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
