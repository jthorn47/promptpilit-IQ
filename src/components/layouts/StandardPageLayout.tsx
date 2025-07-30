import React from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { IntelligentHeroBanner } from '@/components/hero/IntelligentHeroBanner';
import { LaunchpadLayout } from '@/launchpads/components/LaunchpadLayout';
import { DynamicBreadcrumbs } from '@/components/navigation/BreadcrumbSystem';

interface StandardPageLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

/**
 * Standard page layout that follows the /launchpad/system design pattern.
 * This ensures all pages have the same structure:
 * - AdminLayout wrapper
 * - LaunchpadGreetingBanner (Good Evening, jeffrey!)
 * - DynamicBreadcrumbs (consistent navigation)
 * - LaunchpadLayout with title, subtitle, badge and refresh
 * - Content area
 */
export const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  title,
  subtitle,
  badge,
  onRefresh,
  isRefreshing = false,
  headerActions,
  children,
  showBreadcrumbs = true
}) => {
  return (
    <UnifiedLayout>
      <div className="h-full overflow-y-auto space-y-6 py-6 pb-24 md:pb-6">
        <IntelligentHeroBanner />
        {showBreadcrumbs && <DynamicBreadcrumbs />}
        <LaunchpadLayout
          title={title}
          subtitle={subtitle}
          badge={badge}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          headerActions={headerActions}
        >
          {children}
        </LaunchpadLayout>
      </div>
    </UnifiedLayout>
  );
};