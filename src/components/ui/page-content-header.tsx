import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  headerActions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title,
  subtitle,
  badge,
  onRefresh,
  isRefreshing = false,
  headerActions,
  children,
  className = '' 
}: PageHeaderProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {badge && (
              <Badge variant="secondary" className="px-2 py-1">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {headerActions}
        </div>
      </header>
      {children}
    </div>
  );
};