import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit2,
  CheckCircle,
  Clock,
  Calendar,
  Percent,
  Building,
  Mail
} from "lucide-react";
import { halobillAPI } from "../../../domains/billing/halobill/api";
import type { Partner, Commission } from "../../../domains/billing/halobill/types";

export const PartnerDashboard: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const { toast } = useToast();

  const [partnerForm, setPartnerForm] = useState({
    partner_name: '',
    partner_type: 'broker' as 'broker' | 'referral' | 'reseller' | 'implementation',
    commission_rate: 0,
    payment_schedule: 'monthly' as 'weekly' | 'monthly' | 'quarterly',
    minimum_payout: 100,
    contact_email: '',
    tax_id: '',
    payment_method: 'ach' as 'ach' | 'wire' | 'check',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const now = new Date();
      let periodStart = '';
      let periodEnd = '';

      switch (selectedPeriod) {
        case 'current_month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          break;
        case 'last_month':
          periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
          periodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
          break;
        case 'current_quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          periodStart = new Date(now.getFullYear(), quarterStart, 1).toISOString().split('T')[0];
          periodEnd = new Date(now.getFullYear(), quarterStart + 3, 0).toISOString().split('T')[0];
          break;
      }

      const [partnersData, commissionsData] = await Promise.all([
        halobillAPI.getPartners(),
        halobillAPI.getCommissions({ period_start: periodStart, period_end: periodEnd })
      ]);

      setPartners(partnersData);
      setCommissions(commissionsData);
    } catch (error) {
      console.error('Failed to load partner data:', error);
      toast({
        title: "Error",
        description: "Failed to load partner data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePartner = async () => {
    try {
      // Since we don't have a create partner API method in our current implementation,
      // this would be added to the HALObillAPI class
      toast({
        title: "Coming Soon",
        description: "Partner creation feature will be implemented",
      });

      setShowPartnerForm(false);
      setEditingPartner(null);
      resetPartnerForm();
    } catch (error) {
      console.error('Failed to save partner:', error);
      toast({
        title: "Error",
        description: "Failed to save partner",
        variant: "destructive",
      });
    }
  };

  const resetPartnerForm = () => {
    setPartnerForm({
      partner_name: '',
      partner_type: 'broker' as 'broker' | 'referral' | 'reseller' | 'implementation',
      commission_rate: 0,
      payment_schedule: 'monthly' as 'weekly' | 'monthly' | 'quarterly',
      minimum_payout: 100,
      contact_email: '',
      tax_id: '',
      payment_method: 'ach' as 'ach' | 'wire' | 'check',
      is_active: true
    });
  };

  const editPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setPartnerForm({
      partner_name: partner.partner_name,
      partner_type: partner.partner_type,
      commission_rate: partner.commission_rate,
      payment_schedule: partner.payment_schedule,
      minimum_payout: partner.minimum_payout,
      contact_email: partner.contact_email,
      tax_id: partner.tax_id || '',
      payment_method: partner.payment_method,
      is_active: partner.is_active
    });
    setShowPartnerForm(true);
  };

  const calculatePartnerStats = (partnerId: string) => {
    const partnerCommissions = commissions.filter(c => c.partner_id === partnerId);
    const totalCommission = partnerCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const pendingCommission = partnerCommissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commission_amount, 0);
    const paidCommission = partnerCommissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commission_amount, 0);

    return {
      total: totalCommission,
      pending: pendingCommission,
      paid: paidCommission,
      count: partnerCommissions.length
    };
  };

  const getOverallStats = () => {
    const totalCommissions = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const pendingCommissions = commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commission_amount, 0);
    const paidCommissions = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commission_amount, 0);
    const totalRevenue = commissions.reduce((sum, c) => sum + c.revenue_amount, 0);

    return {
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      totalRevenue,
      averageRate: commissions.length > 0 
        ? commissions.reduce((sum, c) => sum + c.commission_rate, 0) / commissions.length 
        : 0
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'outline';
      case 'disputed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPartnerTypeIcon = (type: string) => {
    switch (type) {
      case 'broker':
        return <Building className="h-4 w-4" />;
      case 'referral':
        return <Users className="h-4 w-4" />;
      case 'reseller':
        return <TrendingUp className="h-4 w-4" />;
      case 'implementation':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const overallStats = getOverallStats();

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
          <h2 className="text-2xl font-bold tracking-tight">Partner Dashboard</h2>
          <p className="text-muted-foreground">
            Manage partner relationships and commission tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="current_quarter">Current Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowPartnerForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overallStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Generated by partners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overallStats.totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg rate: {overallStats.averageRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${overallStats.pendingCommissions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${overallStats.paidCommissions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Partners List */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Partners ({partners.length})
            </CardTitle>
            <CardDescription>
              Manage partner accounts and commission rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {partners.map((partner) => {
                const stats = calculatePartnerStats(partner.id);
                return (
                  <div key={partner.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getPartnerTypeIcon(partner.partner_type)}
                        <div>
                          <h3 className="font-medium">{partner.partner_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {partner.contact_email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={partner.is_active ? "default" : "secondary"}>
                          {partner.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => editPartner(partner)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">{partner.partner_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Commission Rate</p>
                        <p className="font-medium">{partner.commission_rate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Earned</p>
                        <p className="font-medium">${stats.total.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className="font-medium text-warning">${stats.pending.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {partners.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No partners configured yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Commission History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Commissions
            </CardTitle>
            <CardDescription>
              Latest commission calculations and payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commissions.slice(0, 10).map((commission) => (
                <div key={commission.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{commission.partner?.partner_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {commission.client?.company_name}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={getStatusColor(commission.status)}>
                        {commission.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        ${commission.commission_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Revenue: ${commission.revenue_amount.toLocaleString()}</p>
                    <p>Rate: {commission.commission_rate}%</p>
                    <p>Period: {new Date(commission.commission_period_start).toLocaleDateString()} - {new Date(commission.commission_period_end).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              {commissions.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No commissions for selected period
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Form Modal */}
      {showPartnerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="partner_name">Partner Name</Label>
                  <Input
                    id="partner_name"
                    value={partnerForm.partner_name}
                    onChange={(e) => setPartnerForm({...partnerForm, partner_name: e.target.value})}
                    placeholder="e.g., ABC Brokers Inc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="partner_type">Partner Type</Label>
                  <Select
                    value={partnerForm.partner_type}
                    onValueChange={(value: any) => setPartnerForm({...partnerForm, partner_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="referral">Referral Partner</SelectItem>
                      <SelectItem value="reseller">Reseller</SelectItem>
                      <SelectItem value="implementation">Implementation Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={partnerForm.contact_email}
                    onChange={(e) => setPartnerForm({...partnerForm, contact_email: e.target.value})}
                    placeholder="partner@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tax_id">Tax ID (Optional)</Label>
                  <Input
                    id="tax_id"
                    value={partnerForm.tax_id}
                    onChange={(e) => setPartnerForm({...partnerForm, tax_id: e.target.value})}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={partnerForm.commission_rate}
                    onChange={(e) => setPartnerForm({...partnerForm, commission_rate: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="minimum_payout">Minimum Payout ($)</Label>
                  <Input
                    id="minimum_payout"
                    type="number"
                    step="0.01"
                    value={partnerForm.minimum_payout}
                    onChange={(e) => setPartnerForm({...partnerForm, minimum_payout: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment_schedule">Payment Schedule</Label>
                  <Select
                    value={partnerForm.payment_schedule}
                    onValueChange={(value: any) => setPartnerForm({...partnerForm, payment_schedule: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={partnerForm.payment_method}
                  onValueChange={(value: any) => setPartnerForm({...partnerForm, payment_method: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ach">ACH Transfer</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={partnerForm.is_active}
                  onCheckedChange={(checked) => setPartnerForm({...partnerForm, is_active: checked})}
                />
                <Label>Active Partner</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPartnerForm(false);
                    setEditingPartner(null);
                    resetPartnerForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePartner}>
                  {editingPartner ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};