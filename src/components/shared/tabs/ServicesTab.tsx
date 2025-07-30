import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Plus } from "lucide-react";

interface Service {
  id?: string;
  name: string;
  status?: 'active' | 'inactive' | 'pending';
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface ServicesTabProps {
  services: Service[] | string[];
  onManageServices?: () => void;
  onAddService?: () => void;
  readonly?: boolean;
  title?: string;
  description?: string;
}

export const ServicesTab = ({ 
  services, 
  onManageServices, 
  onAddService,
  readonly = false,
  title = "Services",
  description = "Services and modules for this organization"
}: ServicesTabProps) => {
  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
    }
  };

  // Handle both string array and object array formats
  const normalizedServices: Service[] = services?.map((service, index) => {
    if (typeof service === 'string') {
      return { id: index.toString(), name: service, status: 'active' as const };
    }
    return service;
  }) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {!readonly && onAddService && (
              <Button onClick={onAddService} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            )}
            {!readonly && onManageServices && (
              <Button onClick={onManageServices} size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {normalizedServices.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {normalizedServices.map((service) => (
                <div key={service.id} className="flex items-center gap-2 p-3 border rounded-lg">
                  <Badge variant="secondary" className="font-medium">
                    {service.name}
                  </Badge>
                  {service.status && (
                    <Badge 
                      variant="outline" 
                      className={getServiceStatusColor(service.status)}
                    >
                      {service.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            {/* Service Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {normalizedServices.map((service) => (
                <Card key={service.id} className="border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{service.name}</h4>
                        {service.status && (
                          <Badge 
                            variant="outline" 
                            className={getServiceStatusColor(service.status)}
                          >
                            {service.status}
                          </Badge>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                      {(service.startDate || service.endDate) && (
                        <div className="text-xs text-muted-foreground">
                          {service.startDate && `Started: ${new Date(service.startDate).toLocaleDateString()}`}
                          {service.endDate && ` • Ends: ${new Date(service.endDate).toLocaleDateString()}`}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No services configured</p>
            {!readonly && onAddService && (
              <Button onClick={onAddService} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Service
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};