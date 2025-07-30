import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, GripVertical, DollarSign, Users, Calendar, Percent, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type BillingType = 'flat_fee_onetime' | 'flat_fee_recurring' | 'per_employee' | 'pepm' | 'percentage_payroll';

interface AdditionalFee {
  id: string;
  fee_name: string;
  description: string;
  default_cost: number;
  billing_type: BillingType;
  default_inclusion: boolean;
  editable_at_company_level: boolean;
  display_in_proposal: boolean;
  include_in_roi_calculation: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  fee_name: string;
  description: string;
  default_cost: number;
  billing_type: BillingType;
  default_inclusion: boolean;
  editable_at_company_level: boolean;
  display_in_proposal: boolean;
  include_in_roi_calculation: boolean;
  is_active: boolean;
}

const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  flat_fee_onetime: 'Flat Fee (One-time)',
  flat_fee_recurring: 'Flat Fee (Recurring)',
  per_employee: 'Per Employee',
  pepm: 'Per Employee Per Month',
  percentage_payroll: '% of Payroll'
};

const BILLING_TYPE_ICONS: Record<BillingType, any> = {
  flat_fee_onetime: DollarSign,
  flat_fee_recurring: Calendar,
  per_employee: Users,
  pepm: Users,
  percentage_payroll: Percent
};

export const AdditionalFeesSettings = () => {
  const [fees, setFees] = useState<AdditionalFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<AdditionalFee | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fee_name: '',
    description: '',
    default_cost: 0,
    billing_type: 'flat_fee_onetime',
    default_inclusion: false,
    editable_at_company_level: true,
    display_in_proposal: true,
    include_in_roi_calculation: true,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('propgen_additional_fees')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFees(data || []);
    } catch (error) {
      console.error('Error loading additional fees:', error);
      toast({
        title: "Error",
        description: "Failed to load additional fees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (editingFee) {
        // Update existing fee
        const { error } = await supabase
          .from('propgen_additional_fees')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingFee.id);

        if (error) throw error;
      } else {
        // Create new fee
        const maxSortOrder = Math.max(...fees.map(f => f.sort_order), 0);
        const { error } = await supabase
          .from('propgen_additional_fees')
          .insert({
            ...formData,
            sort_order: maxSortOrder + 1,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingFee ? "Fee updated successfully" : "Fee created successfully",
      });

      setIsDialogOpen(false);
      setEditingFee(null);
      resetForm();
      loadFees();
    } catch (error) {
      console.error('Error saving fee:', error);
      toast({
        title: "Error",
        description: "Failed to save fee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('propgen_additional_fees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee deleted successfully",
      });
      loadFees();
    } catch (error) {
      console.error('Error deleting fee:', error);
      toast({
        title: "Error",
        description: "Failed to delete fee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fees);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort_order for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }));

    setFees(updatedItems);

    // Update in database
    try {
      for (const item of updatedItems) {
        const { error } = await supabase
          .from('propgen_additional_fees')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
      loadFees(); // Reload to revert changes
    }
  };

  const openEditDialog = (fee: AdditionalFee) => {
    setEditingFee(fee);
    setFormData({
      fee_name: fee.fee_name,
      description: fee.description,
      default_cost: fee.default_cost,
      billing_type: fee.billing_type,
      default_inclusion: fee.default_inclusion,
      editable_at_company_level: fee.editable_at_company_level,
      display_in_proposal: fee.display_in_proposal,
      include_in_roi_calculation: fee.include_in_roi_calculation,
      is_active: fee.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      fee_name: '',
      description: '',
      default_cost: 0,
      billing_type: 'flat_fee_onetime',
      default_inclusion: false,
      editable_at_company_level: true,
      display_in_proposal: true,
      include_in_roi_calculation: true,
      is_active: true
    });
  };

  const formatCost = (cost: number, billingType: string) => {
    const formattedCost = `$${cost.toFixed(2)}`;
    switch (billingType) {
      case 'percentage_payroll':
        return `${cost}%`;
      case 'per_employee':
        return `${formattedCost} per employee`;
      case 'pepm':
        return `${formattedCost} per employee/month`;
      case 'flat_fee_recurring':
        return `${formattedCost} per month`;
      default:
        return formattedCost;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Additional Fees Management</h3>
          <p className="text-sm text-muted-foreground">
            Configure optional value-added services that can be included in proposals
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingFee(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFee ? 'Edit Fee' : 'Add New Fee'}</DialogTitle>
              <DialogDescription>
                Configure the details for this additional fee service
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fee_name">Fee Name</Label>
                  <Input
                    id="fee_name"
                    value={formData.fee_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, fee_name: e.target.value }))}
                    placeholder="e.g., Drug Testing"
                  />
                </div>
                <div>
                  <Label htmlFor="default_cost">Default Cost</Label>
                  <Input
                    id="default_cost"
                    type="number"
                    step="0.01"
                    value={formData.default_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_cost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the service..."
                />
              </div>

              <div>
                <Label htmlFor="billing_type">Billing Type</Label>
                <Select
                  value={formData.billing_type}
                  onValueChange={(value: BillingType) => 
                    setFormData(prev => ({ ...prev, billing_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BILLING_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="default_inclusion"
                    checked={formData.default_inclusion}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, default_inclusion: checked }))}
                  />
                  <Label htmlFor="default_inclusion">Include by Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editable_at_company_level"
                    checked={formData.editable_at_company_level}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, editable_at_company_level: checked }))}
                  />
                  <Label htmlFor="editable_at_company_level">Editable at Company Level</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="display_in_proposal"
                    checked={formData.display_in_proposal}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, display_in_proposal: checked }))}
                  />
                  <Label htmlFor="display_in_proposal">Display in Proposal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include_in_roi_calculation"
                    checked={formData.include_in_roi_calculation}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_in_roi_calculation: checked }))}
                  />
                  <Label htmlFor="include_in_roi_calculation">Include in ROI Calculation</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fees">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {fees.map((fee, index) => {
                const IconComponent = BILLING_TYPE_ICONS[fee.billing_type];
                return (
                  <Draggable key={fee.id} draggableId={fee.id} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${!fee.is_active ? 'opacity-50' : ''}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="cursor-move">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <IconComponent className="h-5 w-5 text-primary" />
                              <div>
                                <CardTitle className="text-base">{fee.fee_name}</CardTitle>
                                <CardDescription className="text-sm">
                                  {fee.description}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {formatCost(fee.default_cost, fee.billing_type)}
                              </Badge>
                              <Badge variant={fee.is_active ? "default" : "secondary"}>
                                {fee.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(fee)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Fee</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{fee.fee_name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(fee.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Type: {BILLING_TYPE_LABELS[fee.billing_type]}</span>
                            <span>Default: {fee.default_inclusion ? 'Included' : 'Not Included'}</span>
                            <span>Editable: {fee.editable_at_company_level ? 'Yes' : 'No'}</span>
                            <span>In Proposal: {fee.display_in_proposal ? 'Yes' : 'No'}</span>
                            <span>In ROI: {fee.include_in_roi_calculation ? 'Yes' : 'No'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {fees.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Additional Fees</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first additional fee service
              </p>
              <Button onClick={() => { setEditingFee(null); resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Important Notes</p>
              <ul className="text-xs text-amber-700 mt-1 space-y-1">
                <li>• Additional fees are optional services that can be included in proposals</li>
                <li>• They are included in ROI calculations but not in side-by-side comparisons</li>
                <li>• Use drag and drop to reorder fees as they appear in proposals</li>
                <li>• Employee-based fees are automatically calculated using headcount data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};