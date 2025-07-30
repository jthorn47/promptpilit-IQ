import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { marketingIQChildren } from '@/data/hierarchicalApps';
import { useAuth } from '@/contexts/AuthContext';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const MarketingIQApp: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // Filter children based on user roles
  const accessibleChildren = marketingIQChildren.filter(child => 
    !child.roles || child.roles.some(role => hasRole(role))
  );

  const handleBackToLaunchpad = () => {
    if (hasRole('super_admin')) {
      navigate('/launchpad/system');
    } else if (hasRole('company_admin')) {
      navigate('/launchpad/company');
    } else {
      navigate('/launchpad/employee');
    }
  };

  const handleChildClick = (child: any) => {
    navigate(child.url);
  };

  return (
    <StandardPageLayout
      title="Marketing IQ"
      subtitle="Comprehensive marketing automation and analytics platform"
      badge="Marketing Suite"
      showBreadcrumbs={true}
      headerActions={
        <Button
          variant="outline"
          onClick={handleBackToLaunchpad}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Launchpad
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Marketing Intelligence Suite</CardTitle>
            <CardDescription>
              Access all marketing tools and analytics to drive your business growth through data-driven campaigns and automated workflows.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Marketing IQ Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleChildren.map((child) => {
            const IconComponent = child.icon;
            
            return (
              <Card 
                key={child.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary"
                onClick={() => handleChildClick(child)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">
                        {child.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {child.description}
                  </CardDescription>
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      Access Module →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {accessibleChildren.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Marketing Modules Available
                </h3>
                <p className="text-sm text-muted-foreground">
                  You don't have access to any Marketing IQ modules. Contact your administrator for access.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StandardPageLayout>
  );
};