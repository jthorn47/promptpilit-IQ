import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Calculator, DollarSign } from "lucide-react";
import { halobillAPI } from "../../../domains/billing/halobill/api";
import type { PricingModel, FeatureSku } from "../../../domains/billing/halobill/types";

export const PricingModelBuilder: React.FC = () => {
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [featureSkus, setFeatureSkus] = useState<FeatureSku[]>([]);
  const [showModelForm, setShowModelForm] = useState(false);
  const [showSkuForm, setShowSkuForm] = useState(false);
  const [editingModel, setEditingModel] = useState<PricingModel | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [modelForm, setModelForm] = useState({
    name: '',
    model_type: 'per_employee' as 'per_employee' | 'per_check' | 'flat_fee' | 'hybrid',
    base_rate: 0,
    per_check_rate: 0,
    per_employee_rate: 0,
    minimum_fee: 0,
    maximum_fee: 0,
    is_active: true,
    effective_date: new Date().toISOString().split('T')[0],
    expires_date: ''
  });

  const [skuForm, setSkuForm] = useState({
    sku_code: '',
    feature_name: '',
    description: '',
    pricing_type: 'monthly' as const,
    unit_price: 0,
    billing_trigger: 'monthly' as const,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [models, skus] = await Promise.all([
        halobillAPI.getPricingModels(),
        halobillAPI.getFeatureSkus()
      ]);
      setPricingModels(models);
      setFeatureSkus(skus);
    } catch (error) {
      console.error('Failed to load pricing data:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModel = async () => {
    try {
      if (editingModel) {
        const updated = await halobillAPI.updatePricingModel(editingModel.id, modelForm);
        setPricingModels(models => models.map(m => m.id === updated.id ? updated : m));
        toast({
          title: "Success",
          description: "Pricing model updated successfully",
        });
      } else {
        const created = await halobillAPI.createPricingModel(modelForm);
        setPricingModels(models => [created, ...models]);
        toast({
          title: "Success",
          description: "Pricing model created successfully",
        });
      }
      
      setShowModelForm(false);
      setEditingModel(null);
      resetModelForm();
    } catch (error) {
      console.error('Failed to save pricing model:', error);
      toast({
        title: "Error",
        description: "Failed to save pricing model",
        variant: "destructive",
      });
    }
  };

  const handleSaveSku = async () => {
    try {
      const created = await halobillAPI.createFeatureSku(skuForm);
      setFeatureSkus(skus => [created, ...skus]);
      
      toast({
        title: "Success",
        description: "Feature SKU created successfully",
      });
      
      setShowSkuForm(false);
      resetSkuForm();
    } catch (error) {
      console.error('Failed to save feature SKU:', error);
      toast({
        title: "Error",
        description: "Failed to save feature SKU",
        variant: "destructive",
      });
    }
  };

  const resetModelForm = () => {
    setModelForm({
      name: '',
      model_type: 'per_employee' as 'per_employee' | 'per_check' | 'flat_fee' | 'hybrid',
      base_rate: 0,
      per_check_rate: 0,
      per_employee_rate: 0,
      minimum_fee: 0,
      maximum_fee: 0,
      is_active: true,
      effective_date: new Date().toISOString().split('T')[0],
      expires_date: ''
    });
  };

  const resetSkuForm = () => {
    setSkuForm({
      sku_code: '',
      feature_name: '',
      description: '',
      pricing_type: 'monthly' as const,
      unit_price: 0,
      billing_trigger: 'monthly' as const,
      is_active: true
    });
  };

  const editModel = (model: PricingModel) => {
    setEditingModel(model);
    setModelForm({
      name: model.name,
      model_type: model.model_type,
      base_rate: model.base_rate,
      per_check_rate: model.per_check_rate || 0,
      per_employee_rate: model.per_employee_rate || 0,
      minimum_fee: model.minimum_fee || 0,
      maximum_fee: model.maximum_fee || 0,
      is_active: model.is_active,
      effective_date: model.effective_date,
      expires_date: model.expires_date || ''
    });
    setShowModelForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pricing Models & SKUs</h2>
          <p className="text-muted-foreground">
            Configure billing models and feature pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSkuForm(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Feature SKU
          </Button>
          <Button onClick={() => setShowModelForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Model
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing Models */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Pricing Models
            </CardTitle>
            <CardDescription>
              Base billing models for client subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pricingModels.map((model) => (
                <div key={model.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{model.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={model.is_active ? "default" : "secondary"}>
                        {model.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => editModel(model)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Type: {model.model_type.replace('_', ' ')}</p>
                    <p>Base Rate: ${model.base_rate}</p>
                    {model.per_check_rate && <p>Per Check: ${model.per_check_rate}</p>}
                    {model.per_employee_rate && <p>Per Employee: ${model.per_employee_rate}</p>}
                    {model.minimum_fee && <p>Min Fee: ${model.minimum_fee}</p>}
                    {model.maximum_fee && <p>Max Fee: ${model.maximum_fee}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature SKUs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Feature SKUs
            </CardTitle>
            <CardDescription>
              Billable features and add-on services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureSkus.map((sku) => (
                <div key={sku.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{sku.feature_name}</h3>
                    <Badge variant={sku.is_active ? "default" : "secondary"}>
                      {sku.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>SKU: {sku.sku_code}</p>
                    <p>Price: ${sku.unit_price} ({sku.pricing_type})</p>
                    <p>Billing: {sku.billing_trigger}</p>
                    {sku.description && <p>{sku.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Model Form Modal */}
      {showModelForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingModel ? 'Edit Pricing Model' : 'Create Pricing Model'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Model Name</Label>
                  <Input
                    id="name"
                    value={modelForm.name}
                    onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                    placeholder="e.g., Standard Payroll"
                  />
                </div>
                
                <div>
                  <Label htmlFor="model_type">Billing Type</Label>
                  <Select
                    value={modelForm.model_type}
                    onValueChange={(value: any) => setModelForm({...modelForm, model_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_check">Per Check</SelectItem>
                      <SelectItem value="per_employee">Per Employee</SelectItem>
                      <SelectItem value="flat_fee">Flat Fee</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="base_rate">Base Rate ($)</Label>
                  <Input
                    id="base_rate"
                    type="number"
                    step="0.01"
                    value={modelForm.base_rate}
                    onChange={(e) => setModelForm({...modelForm, base_rate: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                {(modelForm.model_type === 'per_check' || modelForm.model_type === 'hybrid') && (
                  <div>
                    <Label htmlFor="per_check_rate">Per Check Rate ($)</Label>
                    <Input
                      id="per_check_rate"
                      type="number"
                      step="0.01"
                      value={modelForm.per_check_rate}
                      onChange={(e) => setModelForm({...modelForm, per_check_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                )}
                
                {(modelForm.model_type === 'per_employee' || modelForm.model_type === 'hybrid') && (
                  <div>
                    <Label htmlFor="per_employee_rate">Per Employee Rate ($)</Label>
                    <Input
                      id="per_employee_rate"
                      type="number"
                      step="0.01"
                      value={modelForm.per_employee_rate}
                      onChange={(e) => setModelForm({...modelForm, per_employee_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="minimum_fee">Minimum Fee ($)</Label>
                  <Input
                    id="minimum_fee"
                    type="number"
                    step="0.01"
                    value={modelForm.minimum_fee}
                    onChange={(e) => setModelForm({...modelForm, minimum_fee: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maximum_fee">Maximum Fee ($)</Label>
                  <Input
                    id="maximum_fee"
                    type="number"
                    step="0.01"
                    value={modelForm.maximum_fee}
                    onChange={(e) => setModelForm({...modelForm, maximum_fee: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="effective_date">Effective Date</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={modelForm.effective_date}
                    onChange={(e) => setModelForm({...modelForm, effective_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expires_date">Expires Date (Optional)</Label>
                  <Input
                    id="expires_date"
                    type="date"
                    value={modelForm.expires_date}
                    onChange={(e) => setModelForm({...modelForm, expires_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={modelForm.is_active}
                  onCheckedChange={(checked) => setModelForm({...modelForm, is_active: checked})}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowModelForm(false);
                    setEditingModel(null);
                    resetModelForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveModel}>
                  {editingModel ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature SKU Form Modal */}
      {showSkuForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Create Feature SKU</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="sku_code">SKU Code</Label>
                  <Input
                    id="sku_code"
                    value={skuForm.sku_code}
                    onChange={(e) => setSkuForm({...skuForm, sku_code: e.target.value})}
                    placeholder="e.g., ADDON-HR-001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="feature_name">Feature Name</Label>
                  <Input
                    id="feature_name"
                    value={skuForm.feature_name}
                    onChange={(e) => setSkuForm({...skuForm, feature_name: e.target.value})}
                    placeholder="e.g., HR Management Module"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={skuForm.description}
                  onChange={(e) => setSkuForm({...skuForm, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="pricing_type">Pricing Type</Label>
                  <Select
                    value={skuForm.pricing_type}
                    onValueChange={(value: any) => setSkuForm({...skuForm, pricing_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One Time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="per_use">Per Use</SelectItem>
                      <SelectItem value="per_employee">Per Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="unit_price">Unit Price ($)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={skuForm.unit_price}
                    onChange={(e) => setSkuForm({...skuForm, unit_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="billing_trigger">Billing Trigger</Label>
                  <Select
                    value={skuForm.billing_trigger}
                    onValueChange={(value: any) => setSkuForm({...skuForm, billing_trigger: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activation">On Activation</SelectItem>
                      <SelectItem value="usage">On Usage</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={skuForm.is_active}
                  onCheckedChange={(checked) => setSkuForm({...skuForm, is_active: checked})}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSkuForm(false);
                    resetSkuForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSku}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};