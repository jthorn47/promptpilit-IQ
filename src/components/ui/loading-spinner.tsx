import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ 
  message = "Loading...", 
  className = '',
  size = 'md'
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className={cn("animate-spin rounded-full border-2 border-primary/30 border-t-primary", sizeClasses[size])} />
          {message}
        </div>
      </CardContent>
    </Card>
  );
};