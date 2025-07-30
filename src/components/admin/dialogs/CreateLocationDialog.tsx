import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateLocation } from '@/hooks/useOrgStructure';

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function CreateLocationDialog({ open, onOpenChange, companyId }: CreateLocationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    location_code: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    timezone: 'America/New_York',
  });

  const createLocation = useCreateLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createLocation.mutate({
      ...formData,
      company_id: companyId,
    }, {
      onSuccess: () => {
        setFormData({
          name: '',
          location_code: '',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          country: 'US',
          timezone: 'America/New_York',
        });
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Location</DialogTitle>
          <DialogDescription>
            Add a new location to your organization. Locations are the top-level organizational units.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., New York Office, Chicago Factory"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_code">Location Code</Label>
            <Input
              id="location_code"
              value={formData.location_code}
              onChange={(e) => setFormData(prev => ({ ...prev, location_code: e.target.value.toUpperCase() }))}
              placeholder="e.g., NYC, CHI (auto-generated if empty)"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this location. Leave empty to auto-generate.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Street address"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || createLocation.isPending}>
              {createLocation.isPending ? 'Creating...' : 'Create Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}