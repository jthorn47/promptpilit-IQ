import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGenerateACHBatch } from '../api/useGenerateACHBatch';
import { FileText, Download, Plus, Settings } from 'lucide-react';

export const ACHProcessing: React.FC = () => {
  console.log('🔍 ACH Processing component rendering');
  console.log('🔍 Component mounted at:', new Date().toISOString());
  
  const [batchName, setBatchName] = useState('');
  const [batchType, setBatchType] = useState<'Payroll' | 'Benefits' | 'Tax' | 'Vendor'>('Payroll');
  const [effectiveDate, setEffectiveDate] = useState('');
  
  console.log('🔍 About to call useGenerateACHBatch hook');
  
  const { generateBatch, isLoading } = useGenerateACHBatch();
  console.log('🔍 useGenerateACHBatch hook called successfully');
  console.log('🔍 ACH Processing state:', { batchName, batchType, effectiveDate, isLoading });

  const handleGenerateBatch = () => {
    if (!batchName || !effectiveDate) return;
    
    generateBatch({
      name: batchName,
      type: batchType,
      effectiveDate
    });
  };

  const mockBatches = [
    { id: 'ACH-001', name: 'Payroll 2024-01', type: 'Payroll', status: 'Ready', amount: '$25,450.00' },
    { id: 'ACH-002', name: 'Benefits Deduction', type: 'Benefits', status: 'Pending', amount: '$8,200.00' },
    { id: 'ACH-003', name: 'Tax Remittance', type: 'Tax', status: 'Completed', amount: '$12,300.00' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Create New Batch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New ACH Batch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch-name">Batch Name</Label>
              <Input
                id="batch-name"
                placeholder="Enter batch name"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batch-type">Batch Type</Label>
              <Select value={batchType} onValueChange={(value: any) => setBatchType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Payroll">Payroll</SelectItem>
                  <SelectItem value="Benefits">Benefits</SelectItem>
                  <SelectItem value="Tax">Tax</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="effective-date">Effective Date</Label>
              <Input
                id="effective-date"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleGenerateBatch}
            disabled={!batchName || !effectiveDate || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? 'Generating...' : 'Generate ACH Batch'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Batches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent ACH Batches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBatches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{batch.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {batch.id}</p>
                  </div>
                  <Badge variant={batch.status === 'Completed' ? 'default' : 'secondary'}>
                    {batch.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{batch.amount}</p>
                    <p className="text-sm text-muted-foreground">{batch.type}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Total Batches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">$45,950</div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
