import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

export const Vendors: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
        <p className="text-muted-foreground">
          Vendor management and accounts payable
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Vendors Module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vendors module coming soon. This will include vendor management, accounts payable, and payment tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vendors;