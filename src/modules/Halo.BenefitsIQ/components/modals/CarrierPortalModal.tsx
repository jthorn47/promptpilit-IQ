import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, ExternalLink, Phone, Mail, Search, Building2, Shield } from 'lucide-react';

interface CarrierPortalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

interface Carrier {
  id: string;
  name: string;
  type: string;
  portalUrl: string;
  supportPhone: string;
  supportEmail: string;
  description: string;
  status: 'active' | 'inactive';
  logo?: string;
}

export const CarrierPortalModal: React.FC<CarrierPortalModalProps> = ({
  open,
  onOpenChange,
  companyId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock carrier data - in real app this would come from benefit_carriers table
  const carriers: Carrier[] = [
    {
      id: '1',
      name: 'Blue Cross Blue Shield',
      type: 'Medical',
      portalUrl: 'https://www.bcbs.com/broker-portal',
      supportPhone: '1-800-555-0123',
      supportEmail: 'broker-support@bcbs.com',
      description: 'Comprehensive medical and health insurance coverage',
      status: 'active'
    },
    {
      id: '2',
      name: 'Cigna',
      type: 'Medical',
      portalUrl: 'https://www.cigna.com/brokers',
      supportPhone: '1-800-555-0124',
      supportEmail: 'brokers@cigna.com',
      description: 'Global health services and medical insurance',
      status: 'active'
    },
    {
      id: '3',
      name: 'Delta Dental',
      type: 'Dental',
      portalUrl: 'https://www.deltadental.com/broker',
      supportPhone: '1-800-555-0125',
      supportEmail: 'broker@deltadental.com',
      description: 'Leading dental insurance provider',
      status: 'active'
    },
    {
      id: '4',
      name: 'VSP Vision Care',
      type: 'Vision',
      portalUrl: 'https://www.vsp.com/broker-portal',
      supportPhone: '1-800-555-0126',
      supportEmail: 'brokers@vsp.com',
      description: 'Vision insurance and eye care benefits',
      status: 'active'
    },
    {
      id: '5',
      name: 'MetLife',
      type: 'Life & Disability',
      portalUrl: 'https://www.metlife.com/broker-portal',
      supportPhone: '1-800-555-0127',
      supportEmail: 'broker-services@metlife.com',
      description: 'Life insurance and disability coverage',
      status: 'active'
    },
    {
      id: '6',
      name: 'Unum',
      type: 'Disability',
      portalUrl: 'https://www.unum.com/broker',
      supportPhone: '1-800-555-0128',
      supportEmail: 'broker@unum.com',
      description: 'Disability insurance and workplace benefits',
      status: 'inactive'
    }
  ];

  const filteredCarriers = carriers.filter(carrier =>
    carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carrier.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCarriers = filteredCarriers.filter(carrier => carrier.status === 'active');
  const inactiveCarriers = filteredCarriers.filter(carrier => carrier.status === 'inactive');

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'medical': return 'bg-blue-100 text-blue-800';
      case 'dental': return 'bg-green-100 text-green-800';
      case 'vision': return 'bg-purple-100 text-purple-800';
      case 'life & disability': return 'bg-orange-100 text-orange-800';
      case 'disability': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCarrierPortalClick = (portalUrl: string, carrierName: string) => {
    // In a real app, you might want to track this activity
    console.log(`Opening carrier portal for ${carrierName}: ${portalUrl}`);
    window.open(portalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Carrier Portal Access
          </DialogTitle>
          <DialogDescription>
            Quick access to your benefit carrier portals and support contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search carriers by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Carriers */}
          {activeCarriers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Active Carriers ({activeCarriers.length})
              </h3>
              <div className="grid gap-4">
                {activeCarriers.map((carrier) => (
                  <Card key={carrier.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{carrier.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {carrier.description}
                          </CardDescription>
                        </div>
                        <Badge className={getTypeColor(carrier.type)}>
                          {carrier.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCarrierPortalClick(carrier.portalUrl, carrier.name)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Portal
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${carrier.supportPhone}`, '_self')}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {carrier.supportPhone}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`mailto:${carrier.supportEmail}`, '_self')}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email Support
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Carriers */}
          {inactiveCarriers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5" />
                Available Carriers ({inactiveCarriers.length})
              </h3>
              <div className="grid gap-4">
                {inactiveCarriers.map((carrier) => (
                  <Card key={carrier.id} className="opacity-60">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{carrier.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {carrier.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Inactive</Badge>
                          <Badge className={getTypeColor(carrier.type)}>
                            {carrier.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        Contact your benefits administrator to activate this carrier.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Portal Access Disabled
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${carrier.supportPhone}`, '_self')}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {carrier.supportPhone}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredCarriers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No carriers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'No carriers are currently configured.'}
              </p>
            </div>
          )}

          {/* Support Information */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                If you need assistance accessing carrier portals or have questions about your benefits:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Benefits Team
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};