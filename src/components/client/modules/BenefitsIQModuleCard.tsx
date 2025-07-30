
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Loader2, Lock } from 'lucide-react';
import { useModuleAccess } from '@/hooks/useModuleAccess';

export const BenefitsIQModuleCard: React.FC = () => {
  const { data: moduleAccess, isLoading } = useModuleAccess('haalo.benefitsiq-v11');

  if (isLoading) {
    return (
      <Card className="h-[200px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  const isDisabled = !moduleAccess?.hasAccess || !moduleAccess?.isEnabled;

  return (
    <Card className={`transition-all duration-200 ${isDisabled ? 'opacity-60' : 'hover:shadow-lg'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDisabled ? 'bg-muted' : 'bg-red-50'}`}>
              {isDisabled ? (
                <Lock className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Heart className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                BenefitsIQ
                {moduleAccess?.hasAccess && moduleAccess?.isEnabled && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
                {!moduleAccess?.setupCompleted && moduleAccess?.isEnabled && (
                  <Badge variant="outline" className="text-xs">Setup Required</Badge>
                )}
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <CardDescription className="leading-relaxed">
          Manage your company's benefit plans, costs, and compliance with intelligent analytics and reporting.
        </CardDescription>
        
        {isDisabled ? (
          <div className="pt-2">
            <Button variant="outline" disabled className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Module Not Available
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Contact your administrator to enable BenefitsIQ
            </p>
          </div>
        ) : (
          <Button asChild className="w-full">
            <Link to="/client/benefitsiq">
              <Heart className="h-4 w-4 mr-2" />
              Open BenefitsIQ
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
