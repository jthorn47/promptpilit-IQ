import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Edit, Building } from 'lucide-react';
import { Location, useDivisions } from '@/hooks/useOrgStructure';

interface LocationCardProps {
  location: Location;
  companyId: string;
}

export function LocationCard({ location, companyId }: LocationCardProps) {
  const { data: divisions } = useDivisions(companyId, location.id);

  const formatAddress = () => {
    const parts = [location.address_line1, location.city, location.state, location.zip]
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {location.name}
            </CardTitle>
            {location.code && (
              <Badge variant="outline" className="text-xs">
                {location.code}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 inline mr-1" />
            {formatAddress()}
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{divisions?.length || 0} divisions</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>0 employees</span>
            </div>
          </div>

          {location.timezone && (
            <div className="text-xs text-muted-foreground">
              Timezone: {location.timezone}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}