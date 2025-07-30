import React, { useState } from 'react';
import { HaaLODataGrid } from '@/modules/HaaLO.Shared/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, DollarSign, Minus, Building2, Eye } from 'lucide-react';
import { useCompanyPayTypes, PayType } from '@/hooks/usePayTypes';
import { CreatePayTypeDialog } from './dialogs/CreatePayTypeDialog';
import { EditPayTypeDialog } from './dialogs/EditPayTypeDialog';

interface ClientPayTypesManagerProps {
  companyId: string;
}

export const ClientPayTypesManager = ({ companyId }: ClientPayTypesManagerProps) => {
  const [activeTab, setActiveTab] = useState<'earnings' | 'deductions'>('earnings');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPayType, setEditingPayType] = useState<PayType | null>(null);

  const { data: earningsTypes = [], isLoading: earningsLoading } = useCompanyPayTypes(companyId, 'earnings');
  const { data: deductionTypes = [], isLoading: deductionsLoading } = useCompanyPayTypes(companyId, 'deductions');
  
  const currentData = activeTab === 'earnings' ? earningsTypes : deductionTypes;
  const loading = activeTab === 'earnings' ? earningsLoading : deductionsLoading;

  // Separate global and custom pay types
  const globalPayTypes = currentData.filter(pt => pt.is_global);
  const customPayTypes = currentData.filter(pt => !pt.is_global);

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
          {record.is_global && (
            <Badge variant="outline" className="text-xs">
              Global
            </Badge>
          )}
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
      key: 'gl_code',
      title: 'GL Code',
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
          {record.is_global ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Global pay types are read-only"
            >
              <Eye className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingPayType(record)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Earnings & Deductions Configuration</h2>
          <p className="text-muted-foreground">
            Manage pay types for your organization
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Pay Type
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
          {/* Custom Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Your Custom Earnings ({customPayTypes.filter(pt => pt.pay_category === 'earnings').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={columns}
                data={customPayTypes.filter(pt => pt.pay_category === 'earnings')}
                loading={earningsLoading}
              />
            </CardContent>
          </Card>

          {/* Global Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Available Global Earnings ({globalPayTypes.filter(pt => pt.pay_category === 'earnings').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={columns}
                data={globalPayTypes.filter(pt => pt.pay_category === 'earnings')}
                loading={earningsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-4">
          {/* Custom Deductions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Your Custom Deductions ({customPayTypes.filter(pt => pt.pay_category === 'deductions').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={columns}
                data={customPayTypes.filter(pt => pt.pay_category === 'deductions')}
                loading={deductionsLoading}
              />
            </CardContent>
          </Card>

          {/* Global Deductions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Minus className="h-5 w-5 text-red-600" />
                Available Global Deductions ({globalPayTypes.filter(pt => pt.pay_category === 'deductions').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HaaLODataGrid
                columns={columns}
                data={globalPayTypes.filter(pt => pt.pay_category === 'deductions')}
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
        companyId={companyId}
      />

      {/* Edit Pay Type Dialog */}
      {editingPayType && (
        <EditPayTypeDialog
          open={!!editingPayType}
          onOpenChange={() => setEditingPayType(null)}
          payType={editingPayType}
          companyId={companyId}
        />
      )}
    </div>
  );
};