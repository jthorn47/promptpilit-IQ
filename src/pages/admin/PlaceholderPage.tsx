import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  description = "This feature is under development and will be available soon.",
  breadcrumbItems = []
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      {breadcrumbItems.length > 0 && (
        <BreadcrumbNav items={breadcrumbItems} />
      )}
      
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Placeholder Content */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Construction className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Feature Under Development</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {description}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/admin')}>
              Return to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;