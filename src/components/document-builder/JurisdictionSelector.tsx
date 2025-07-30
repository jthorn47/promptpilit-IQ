import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, Plus, X } from 'lucide-react';
import type { Jurisdiction } from '@/types/document-builder';

interface JurisdictionSelectorProps {
  jurisdictions: Jurisdiction[];
  selectedJurisdictions: Jurisdiction[];
  onChange: (selected: Jurisdiction[]) => void;
  getStates: () => Jurisdiction[];
  getCounties: (stateId: string) => Jurisdiction[];
}

export const JurisdictionSelector = ({
  jurisdictions,
  selectedJurisdictions,
  onChange,
  getStates,
  getCounties
}: JurisdictionSelectorProps) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const states = getStates();
  const counties = selectedState ? getCounties(selectedState) : [];

  const handleAddJurisdiction = () => {
    if (selectedState) {
      const stateJurisdiction = states.find(s => s.id === selectedState);
      if (stateJurisdiction && !selectedJurisdictions.find(j => j.id === stateJurisdiction.id)) {
        const newSelections = [...selectedJurisdictions, stateJurisdiction];
        
        // Add county if selected
        if (selectedCounty) {
          const countyJurisdiction = counties.find(c => c.id === selectedCounty);
          if (countyJurisdiction && !selectedJurisdictions.find(j => j.id === countyJurisdiction.id)) {
            newSelections.push(countyJurisdiction);
          }
        }
        
        onChange(newSelections);
        setSelectedState('');
        setSelectedCounty('');
      }
    }
  };

  const handleRemoveJurisdiction = (jurisdictionId: string) => {
    onChange(selectedJurisdictions.filter(j => j.id !== jurisdictionId));
  };

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (state.abbreviation && state.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add Jurisdiction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-48">
                    {filteredStates.map(state => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name} ({state.abbreviation})
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>County (Optional)</Label>
              <Select 
                value={selectedCounty} 
                onValueChange={setSelectedCounty}
                disabled={!selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map(county => (
                    <SelectItem key={county.id} value={county.id}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleAddJurisdiction}
            disabled={!selectedState}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Jurisdiction
          </Button>
        </CardContent>
      </Card>

      {/* Selected Jurisdictions */}
      {selectedJurisdictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Jurisdictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedJurisdictions.map(jurisdiction => (
                <div key={jurisdiction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={jurisdiction.type === 'state' ? 'default' : 'secondary'}>
                      {jurisdiction.type}
                    </Badge>
                    <span className="font-medium">{jurisdiction.name}</span>
                    {jurisdiction.abbreviation && (
                      <span className="text-muted-foreground">({jurisdiction.abbreviation})</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveJurisdiction(jurisdiction.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jurisdiction Info */}
      {selectedJurisdictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applicable Regulations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedJurisdictions.map(jurisdiction => (
                <div key={jurisdiction.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{jurisdiction.name}</h4>
                    <Badge variant="outline">
                      Last Updated: {new Date(jurisdiction.regulations_last_updated).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Regulations and compliance requirements will be automatically included for this jurisdiction.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};