import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LaunchpadLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export const LaunchpadLayout: React.FC<LaunchpadLayoutProps> = ({
  title,
  subtitle,
  badge,
  onRefresh,
  isRefreshing = false,
  headerActions,
  children
}) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background px-6 pb-4 pt-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {badge && <Badge variant="secondary">{badge}</Badge>}
            </div>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {headerActions}
            {onRefresh && (
              <Button 
                onClick={onRefresh} 
                disabled={isRefreshing}
                variant="outline" 
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-0">
          {children}
        </div>
      </motion.div>
    </div>
  );
};