import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { 
  useClientPayConfigurations, 
  usePayGroups 
} from '@/hooks/useClientPayrollSettings';
import { PayConfigurationForm } from './PayConfigurationForm';
import { PayGroupManager } from './PayGroupManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PayConfigurationManagerProps {
  clientId: string;
}

export const PayConfigurationManager: React.FC<PayConfigurationManagerProps> = ({ clientId }) => {
  const [isConfigFormOpen, setIsConfigFormOpen] = useState(false);
  const [isPayGroupManagerOpen, setIsPayGroupManagerOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);

  const { 
    data: configurations = [], 
    isLoading,
    addConfiguration,
    updateConfiguration,
    deleteConfiguration,
    isAdding,
    isUpdating,
    isDeleting
  } = useClientPayConfigurations(clientId);

  const { data: allPayGroups = [] } = usePayGroups(clientId);

  const payFrequencyLabels = {
    weekly: 'Weekly',
    bi_weekly: 'Bi-Weekly',
    semi_monthly: 'Semi-Monthly',
    monthly: 'Monthly'
  };

  const handleAddConfiguration = () => {
    setEditingConfig(null);
    setIsConfigFormOpen(true);
  };

  const handleEditConfiguration = (config: any) => {
    setEditingConfig(config);
    setIsConfigFormOpen(true);
  };

  const handleDeleteConfiguration = (configId: string) => {
    if (confirm('Are you sure you want to delete this pay configuration?')) {
      deleteConfiguration(configId);
    }
  };

  const getPayGroupDetails = (payGroupIds: string[]) => {
    const groups = allPayGroups.filter(pg => payGroupIds.includes(pg.id));
    return groups;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Loading pay configurations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Pay Frequency & Group Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure multiple pay cycles and assign pay groups to each frequency
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPayGroupManagerOpen(true)}
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Pay Groups
          </Button>
          <Button onClick={handleAddConfiguration}>
            <Plus className="w-4 h-4 mr-2" />
            Add Pay Cycle
          </Button>
        </div>
      </div>

      {/* Configurations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Pay Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          {configurations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Pay Configurations</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first pay cycle configuration
              </p>
              <Button onClick={handleAddConfiguration}>
                <Plus className="w-4 h-4 mr-2" />
                Add Pay Cycle
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Frequency</TableHead>
                  <TableHead>Pay Groups</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Assigned Employees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configurations.map((config) => {
                  const payGroups = getPayGroupDetails(config.pay_group_ids || []);
                  const totalEmployees = payGroups.reduce((sum, pg) => sum + (typeof pg.employee_count === 'number' ? pg.employee_count : 0), 0);
                  const nextRunDate = payGroups.length > 0 
                    ? Math.min(...payGroups.map(pg => new Date(pg.next_pay_date || '').getTime()).filter(d => !isNaN(d)))
                    : null;

                  return (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Badge variant="secondary">
                          {payFrequencyLabels[config.pay_frequency]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {payGroups.length === 0 ? (
                            <span className="text-muted-foreground text-sm">No groups assigned</span>
                          ) : (
                            payGroups.map(pg => (
                              <div key={pg.id} className="text-sm">
                                {pg.name}
                                {typeof pg.employee_count === 'number' && pg.employee_count > 0 && (
                                  <span className="text-muted-foreground ml-2">
                                    ({pg.employee_count} employees)
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {nextRunDate ? (
                          new Date(nextRunDate).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {totalEmployees} employees
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditConfiguration(config)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteConfiguration(config.id!)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Configuration Form Dialog */}
      <Dialog open={isConfigFormOpen} onOpenChange={setIsConfigFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit Pay Configuration' : 'Add Pay Configuration'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Configure pay frequency and assign pay groups for this client.
            </p>
          </DialogHeader>
          <PayConfigurationForm
            clientId={clientId}
            initialData={editingConfig}
            onSave={(data) => {
              if (editingConfig) {
                updateConfiguration({ id: editingConfig.id, ...data });
              } else {
                addConfiguration(data);
              }
              setIsConfigFormOpen(false);
            }}
            onCancel={() => setIsConfigFormOpen(false)}
            isLoading={isAdding || isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Pay Group Manager Dialog */}
      <Dialog open={isPayGroupManagerOpen} onOpenChange={setIsPayGroupManagerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Pay Groups</DialogTitle>
          </DialogHeader>
          <PayGroupManager clientId={clientId} onClose={() => setIsPayGroupManagerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};