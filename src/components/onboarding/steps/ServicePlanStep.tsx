import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Star, Zap, Shield } from 'lucide-react';

interface ServicePlanStepProps {
  data: any;
  onUpdate: (section: string, data: any) => void;
  onCommentaryUpdate: (commentary: string) => void;
}

export const ServicePlanStep: React.FC<ServicePlanStepProps> = ({
  data,
  onUpdate,
  onCommentaryUpdate,
}) => {
  const servicePlan = data.servicePlan || {};

  const handlePlanSelect = (planType: string) => {
    const updatedPlan = { ...servicePlan, servicePlanType: planType };
    onUpdate('servicePlan', updatedPlan);
    
    if (planType === 'PEO') {
      onCommentaryUpdate('PEO model selected. This means we become your co-employer and handle all compliance responsibilities.');
    } else {
      onCommentaryUpdate('ASO model selected. You maintain full control while we handle payroll processing and compliance support.');
    }
  };

  const handleAddonToggle = (addon: string, checked: boolean) => {
    const currentAddons = servicePlan.selectedAddons || [];
    const updatedAddons = checked 
      ? [...currentAddons, addon]
      : currentAddons.filter((a: string) => a !== addon);
    
    onUpdate('servicePlan', { ...servicePlan, selectedAddons: updatedAddons });
  };

  const addons = [
    {
      id: 'hr_compliance',
      name: 'HR Compliance Suite',
      description: 'Employee handbook, policy templates, compliance tracking',
      price: 49,
      icon: Shield,
    },
    {
      id: 'ai_risk_monitor',
      name: 'AI Risk Monitor',
      description: 'Real-time compliance monitoring and alert system',
      price: 79,
      icon: Zap,
    },
    {
      id: 'handbook_builder',
      name: 'Handbook Builder',
      description: 'Customizable employee handbook with legal review',
      price: 29,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Service Plan Selection */}
      <div>
        <h2 className="text-xl font-bold mb-4">Choose Your Service Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ASO Plan */}
          <Card className={`cursor-pointer transition-all ${
            servicePlan.servicePlanType === 'ASO' ? 'ring-2 ring-primary' : ''
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>ASO (Administrative Services Only)</span>
                {servicePlan.servicePlanType === 'ASO' && <Badge>Selected</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You remain the employer of record. We handle payroll processing, tax filing, and compliance support.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-green-500" />
                    <span>Full control over HR decisions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-green-500" />
                    <span>Lower cost structure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-green-500" />
                    <span>Payroll and tax compliance</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="text-2xl font-bold">$8</div>
                  <div className="text-sm text-muted-foreground">per employee/month</div>
                </div>
                
                <Button 
                  className="w-full" 
                  variant={servicePlan.servicePlanType === 'ASO' ? 'default' : 'outline'}
                  onClick={() => handlePlanSelect('ASO')}
                >
                  {servicePlan.servicePlanType === 'ASO' ? 'Selected' : 'Select ASO'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PEO Plan */}
          <Card className={`cursor-pointer transition-all ${
            servicePlan.servicePlanType === 'PEO' ? 'ring-2 ring-primary' : ''
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>PEO (Professional Employer Organization)</span>
                {servicePlan.servicePlanType === 'PEO' && <Badge>Selected</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We become your co-employer, handling all HR functions, benefits, and compliance responsibilities.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-green-500" />
                    <span>Complete HR outsourcing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-green-500" />
                    <span>Enterprise benefits access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-green-500" />
                    <span>Full compliance protection</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="text-2xl font-bold">$15</div>
                  <div className="text-sm text-muted-foreground">per employee/month</div>
                </div>
                
                <Button 
                  className="w-full" 
                  variant={servicePlan.servicePlanType === 'PEO' ? 'default' : 'outline'}
                  onClick={() => handlePlanSelect('PEO')}
                >
                  {servicePlan.servicePlanType === 'PEO' ? 'Selected' : 'Select PEO'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <h2 className="text-xl font-bold mb-4">Add-on Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {addons.map((addon) => (
            <Card key={addon.id}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id={addon.id}
                    checked={servicePlan.selectedAddons?.includes(addon.id) || false}
                    onCheckedChange={(checked) => handleAddonToggle(addon.id, checked as boolean)}
                  />
                  <addon.icon className="w-5 h-5 text-primary" />
                  <label htmlFor={addon.id} className="font-medium cursor-pointer">
                    {addon.name}
                  </label>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {addon.description}
                </p>
                
                <div className="font-bold text-lg">
                  ${addon.price}/month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Plan ({servicePlan.servicePlanType || 'ASO'})</span>
              <span>${servicePlan.servicePlanType === 'PEO' ? '15' : '8'} × employees</span>
            </div>
            
            {servicePlan.selectedAddons?.map((addonId: string) => {
              const addon = addons.find(a => a.id === addonId);
              return addon ? (
                <div key={addonId} className="flex justify-between">
                  <span>{addon.name}</span>
                  <span>${addon.price}</span>
                </div>
              ) : null;
            })}
            
            <div className="border-t pt-2 font-bold flex justify-between">
              <span>Estimated Total</span>
              <span>Based on employee count</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};