
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { IQTooltip } from '@/components/ui/iq-tooltip';
import { Plus, Trash2, Shield } from 'lucide-react';

interface WorkerCompCode {
  id: string;
  code: string;
  description: string;
  base_rate: number;
  category: string;
}

interface WorkerCompEntry {
  id: string;
  code: string;
  description: string;
  employeeCount: number;
  clientCost: number;
  ourEstimatedCost: number;
  baseRate: number;
}

interface WorkerCompManagerProps {
  workerCompCodes: WorkerCompCode[];
  entries: WorkerCompEntry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof WorkerCompEntry, value: any) => void;
}

export const WorkerCompManager = ({ 
  workerCompCodes, 
  entries, 
  onAdd, 
  onRemove, 
  onUpdate 
}: WorkerCompManagerProps) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalClientCost = () => entries.reduce((sum, entry) => sum + entry.clientCost, 0);
  const getTotalOurCost = () => entries.reduce((sum, entry) => sum + entry.ourEstimatedCost, 0);
  const getTotalEmployees = () => entries.reduce((sum, entry) => sum + entry.employeeCount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Worker's Compensation Codes
          <IQTooltip 
            content={
              <div>
                <p className="font-medium mb-2">CompX Intelligence</p>
                <p>Configure worker's compensation codes with AI-powered cost analysis and risk assessment. Our system automatically calculates potential savings and optimization opportunities.</p>
              </div>
            }
            showBranding={true}
            maxWidth="max-w-sm"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Code Button */}
        <Button onClick={onAdd} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Worker's Comp Code
        </Button>

        {/* Worker Comp Entries */}
        {entries.map((entry, index) => (
          <div key={entry.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Code #{index + 1}</Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemove(entry.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Worker's Comp Code
                  <IQTooltip 
                    content={<p>Select the appropriate NCCI classification code for this job category. Each code has different base rates and risk factors.</p>}
                    size="sm"
                  />
                </Label>
                <Select
                  value={entry.code}
                  onValueChange={(value) => {
                    const selectedCode = workerCompCodes.find(wc => wc.code === value);
                    if (selectedCode) {
                      onUpdate(entry.id, 'code', value);
                      onUpdate(entry.id, 'description', selectedCode.description);
                      onUpdate(entry.id, 'baseRate', selectedCode.base_rate);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select code" />
                  </SelectTrigger>
                  <SelectContent>
                    {workerCompCodes.map((code) => (
                      <SelectItem key={code.id} value={code.code}>
                        {code.code} - {code.description} ({code.base_rate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Count */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Employees in this classification
                  <IQTooltip 
                    content={<p>Enter the number of employees who work in this classification. This affects your overall risk profile and premium calculations.</p>}
                    size="sm"
                  />
                </Label>
                <Input
                  type="number"
                  value={entry.employeeCount}
                  onChange={(e) => onUpdate(entry.id, 'employeeCount', parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Client Current Cost */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Client's Current Annual Cost
                  <IQTooltip 
                    content={<p>The client's current annual worker's compensation premium for this classification. This helps us calculate potential savings.</p>}
                    size="sm"
                  />
                </Label>
                <Input
                  type="number"
                  value={entry.clientCost}
                  onChange={(e) => onUpdate(entry.id, 'clientCost', parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Our Estimated Cost */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Our Estimated Annual Cost
                  <IQTooltip 
                    content={
                      <div>
                        <p className="font-medium mb-1">AI-Powered Estimation</p>
                        <p>Our estimated cost based on your risk profile, claims history, and industry benchmarks. This includes our competitive rates and safety programs.</p>
                      </div>
                    }
                    variant="accent"
                    size="sm"
                  />
                </Label>
                <Input
                  type="number"
                  value={entry.ourEstimatedCost}
                  onChange={(e) => onUpdate(entry.id, 'ourEstimatedCost', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Code Details */}
            {entry.description && (
              <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                <strong>{entry.code}:</strong> {entry.description} | Rate: {entry.baseRate}%
              </div>
            )}
          </div>
        ))}

        {/* Totals Summary */}
        {entries.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              Worker's Comp Summary
              <IQTooltip 
                content={<p>Summary of all worker's compensation costs and potential savings across all classifications.</p>}
                size="sm"
                variant="accent"
              />
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Employees:</span> {getTotalEmployees()}
              </div>
              <div>
                <span className="font-medium">Client Total Cost:</span> {formatCurrency(getTotalClientCost())}
              </div>
              <div>
                <span className="font-medium">Our Total Cost:</span> {formatCurrency(getTotalOurCost())}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t">
              <span className="font-medium text-green-600">
                Potential Savings: {formatCurrency(getTotalClientCost() - getTotalOurCost())}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
