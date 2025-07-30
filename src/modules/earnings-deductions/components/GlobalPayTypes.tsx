import React, { useState } from 'react';
import { HaaLODataGrid } from '@/modules/HaaLO.Shared/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, DollarSign, Minus, Info } from 'lucide-react';
import { useGlobalPayTypes, useCreateGlobalPayType, useUpdatePayType, PayType } from '@/hooks/usePayTypes';
import { CreatePayTypeDialog } from './dialogs/CreatePayTypeDialog';
import { EditPayTypeDialog } from './dialogs/EditPayTypeDialog';

export const GlobalPayTypes = () => {
  const [activeTab, setActiveTab] = useState<'earnings' | 'deductions'>('earnings');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPayType, setEditingPayType] = useState<PayType | null>(null);

  const { data: earningsTypes = [], isLoading: earningsLoading } = useGlobalPayTypes('earnings');
  const { data: deductionTypes = [], isLoading: deductionsLoading } = useGlobalPayTypes('deductions');
  
  const currentData = activeTab === 'earnings' ? earningsTypes : deductionTypes;
  const loading = activeTab === 'earnings' ? earningsLoading : deductionsLoading;

  const getTaxTreatmentBadge = (payType: PayType) => {
    const taxableItems = [];
    if (payType.is_taxable_federal) taxableItems.push('Fed');
    if (payType.is_taxable_state) taxableItems.push('State');
    if (payType.is_taxable_fica) taxableItems.push('FICA');
    if (payType.is_taxable_medicare) taxableItems.push('Medicare');
    
    if (taxableItems.length === 0) {
      return <Badge variant="secondary">Non-taxable</Badge>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {taxableItems.map((item) => (
          <Badge key={item} variant="outline" className="text-xs">
            {item}
          </Badge>
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value: string, record: PayType) => (
        <div className="font-medium flex items-center gap-2">
          {record.pay_category === 'earnings' ? (
            <DollarSign className="h-4 w-4 text-green-600" />
          ) : (
            <Minus className="h-4 w-4 text-red-600" />
          )}
          {value}
        </div>
      ),
    },
    {
      key: 'code',
      title: 'Code',
      render: (value: string) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'tax_treatment',
      title: 'Tax Treatment',
      render: (value: any, record: PayType) => getTaxTreatmentBadge(record),
    },
    {
      key: 'subject_to_overtime',
      title: 'OT Eligible',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'default_rate_multiplier',
      title: 'Rate Multiplier',
      render: (value: number) => (
        <span className="font-mono">
          {value ? `${value}x` : '1.0x'}
        </span>
      ),
    },
    {
      key: 'w2_box_code',
      title: 'W2 Box',
      render: (value: string) => (
        <Badge variant="outline" className="font-mono">
          {value || '-'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, record: PayType) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingPayType(record)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pay Types Library</h2>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Pay Type
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'earnings' | 'deductions')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Earnings ({earningsTypes.length})
          </TabsTrigger>
          <TabsTrigger value="deductions" className="flex items-center gap-2">
            <Minus className="h-4 w-4" />
            Deductions ({deductionTypes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Earnings Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={columns}
                data={earningsTypes}
                loading={earningsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Minus className="h-5 w-5 text-red-600" />
                Deduction Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={columns}
                data={deductionTypes}
                loading={deductionsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Pay Type Dialog */}
      <CreatePayTypeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        defaultType={activeTab}
      />

      {/* Edit Pay Type Dialog */}
      {editingPayType && (
        <EditPayTypeDialog
          open={!!editingPayType}
          onOpenChange={() => setEditingPayType(null)}
          payType={editingPayType}
        />
      )}
    </div>
  );
};