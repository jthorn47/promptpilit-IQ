import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Rocket, 
  Calendar,
  Clock
} from "lucide-react";

interface HaaloPlaceholderProps {
  title: string;
  description: string;
  moduleName: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const HaaloPlaceholder = ({ 
  title, 
  description, 
  moduleName, 
  icon: Icon 
}: HaaloPlaceholderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Icon className="h-8 w-8 text-primary" />
            {title}
          </h1>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
        <Badge variant="secondary">
          <Wrench className="h-3 w-3 mr-1" />
          In Development
        </Badge>
      </div>

      <Card className="border-dashed border-2">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">
            {moduleName} Module Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground max-w-md mx-auto">
            This module is currently under development as part of the HaaLO Core system. 
            It will provide comprehensive functionality for {title.toLowerCase()} management.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Q2 2024 Release
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Development Phase
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" disabled>
              <Wrench className="h-4 w-4 mr-2" />
              Module Unavailable
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planned Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Core Functionality</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Comprehensive management interface</li>
                <li>• Real-time data synchronization</li>
                <li>• Advanced filtering and search</li>
                <li>• Bulk operations support</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Advanced Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Role-based access control</li>
                <li>• Audit logging and compliance</li>
                <li>• API integration support</li>
                <li>• Custom workflow automation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HaaloPlaceholder;