import { 
  DollarSign, 
  Calendar, 
  Shield, 
  Settings, 
  FileText, 
  Users,
  Heart,
  Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  useClientPayrollSettings, 
  usePayGroups,
  useEarningsTypes,
  useDeductionTypes,
  useWorkersCompCodes,
  usePtoPolicies
} from "@/hooks/useClientPayrollSettings";
import { SettingsCard, SettingsField } from "@/components/shared/SettingsCard";
import { BenefitsAdministration } from "@/domains/payroll/components/BenefitsAdministration";
import { OrgStructureTab } from "@/components/org-structure/OrgStructureTab";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HaloPayrollTabProps {
  clientId: string;
  companyId?: string;
  readonly?: boolean;
}

export const HaloPayrollTab = ({ clientId, companyId, readonly = false }: HaloPayrollTabProps) => {
  const navigate = useNavigate();
  const { data: settings, isLoading: loading, error, updateSettings, isUpdating } = useClientPayrollSettings(clientId);
  const { data: payGroups = [] } = usePayGroups();
  const { data: earningsTypes = [] } = useEarningsTypes();
  const { data: deductionTypes = [] } = useDeductionTypes();
  const { data: workersCompCodes = [] } = useWorkersCompCodes();
  const { data: ptoPolicies = [] } = usePtoPolicies();
  const [showOrgStructure, setShowOrgStructure] = useState(false);

  const handleBasicSettingsClick = () => {
    navigate(`/payroll/basic-settings?clientId=${clientId}`);
  };

  const handleTaxConfigClick = () => {
    navigate(`/payroll/tax-config?clientId=${clientId}`);
  };

  const handleEarningsDeductionsClick = () => {
    navigate(`/payroll/earnings-deductions?clientId=${clientId}`);
  };

  const handleWorkersCompClick = () => {
    navigate(`/payroll/workers-comp?clientId=${clientId}`);
  };

  const handlePoliciesClick = () => {
    navigate(`/payroll/policies?clientId=${clientId}`);
  };

  const handleContactInfoClick = () => {
    navigate(`/payroll/contact-info?clientId=${clientId}`);
  };

  const handleBenefitsClick = () => {
    console.log('Benefits card clicked!'); // Debug log
    navigate(`/payroll/benefits?clientId=${clientId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading Halo Payroll settings...</div>
      </div>
    );
  }

  // Transform data for dropdowns
  const payGroupOptions = payGroups.map(pg => ({ value: pg.id, label: pg.name }));
  const earningsOptions = earningsTypes.map(et => ({ value: et.id, label: et.name }));
  const deductionOptions = deductionTypes.map(dt => ({ value: dt.id, label: dt.name }));
  const workersCompOptions = workersCompCodes.map(wc => ({ value: wc.id, label: `${wc.code} - ${wc.description}` }));
  const ptoPolicyOptions = ptoPolicies.map(pp => ({ value: pp.id, label: pp.name }));

  const payFrequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi_weekly', label: 'Bi-Weekly' },
    { value: 'semi_monthly', label: 'Semi-Monthly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const deliveryMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'print', label: 'Print' },
    { value: 'portal', label: 'Portal' },
    { value: 'both', label: 'Email & Print' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Basic Settings */}
      <SettingsCard
        title="Basic Settings"
        description="Pay frequency and group configuration"
        icon={<Calendar className="h-5 w-5 text-primary" />}
        readonly={readonly}
        isLoading={isUpdating}
        clickable={true}
        onClick={handleBasicSettingsClick}
      >
        <div className="text-center py-4">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to manage pay frequency and group settings
          </p>
        </div>
      </SettingsCard>

      {/* Tax Configuration */}
      <SettingsCard
        title="Tax Configuration"
        description="FEIN and SUTA account setup"
        icon={<FileText className="h-5 w-5 text-primary" />}
        readonly={readonly}
        isLoading={isUpdating}
        clickable={true}
        onClick={handleTaxConfigClick}
      >
        <div className="text-center py-4">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to manage FEIN and SUTA account setup
          </p>
        </div>
      </SettingsCard>

      {/* Earnings & Deductions */}
      <SettingsCard
        title="Earnings & Deductions"
        description="Default earnings and deduction selections"
        icon={<DollarSign className="h-5 w-5 text-primary" />}
        readonly={readonly}
        isLoading={isUpdating}
        clickable={true}
        onClick={handleEarningsDeductionsClick}
      >
        <div className="text-center py-4">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to manage earnings and deductions
          </p>
        </div>
      </SettingsCard>

      {/* Workers' Comp */}
      <SettingsCard
        title="Workers' Compensation"
        description="Assigned workers' comp codes"
        icon={<Shield className="h-5 w-5 text-primary" />}
        readonly={readonly}
        isLoading={isUpdating}
        clickable={true}
        onClick={handleWorkersCompClick}
      >
        <div className="text-center py-4">
          <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to manage workers' compensation codes
          </p>
        </div>
      </SettingsCard>

      {/* Policies */}
      <SettingsCard
        title="Policies"
        description="Direct deposit and PTO settings"
        icon={<Settings className="h-5 w-5 text-primary" />}
        readonly={readonly}
        isLoading={isUpdating}
        clickable={true}
        onClick={handlePoliciesClick}
      >
        <div className="text-center py-4">
          <Settings className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to manage policies and settings
          </p>
        </div>
      </SettingsCard>

      {/* Contact Information */}
      <SettingsCard
        title="Contact Information"
        description="Payroll contact details"
        icon={<Users className="h-5 w-5 text-primary" />}
        readonly={readonly}
        isLoading={isUpdating}
        clickable={true}
        onClick={handleContactInfoClick}
      >
        <div className="text-center py-4">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to manage contact information
          </p>
        </div>
      </SettingsCard>

      {/* Benefits Administration */}
      <SettingsCard
        title="Benefits Administration"
        description="Manage client-specific benefit plans and settings"
        icon={<Heart className="h-5 w-5 text-primary" />}
        readonly={readonly}
        isLoading={false}
        clickable={true}
        onClick={handleBenefitsClick}
      >
        <BenefitsAdministration clientId={clientId} />
      </SettingsCard>

      {/* BenefitsIQ */}
      <SettingsCard
        title="BenefitsIQ"
        description="Manage your company's benefit plans, costs, and compliance"
        icon={<Heart className="h-5 w-5 text-primary" />}
        readonly={readonly}
        isLoading={false}
        clickable={true}
        onClick={() => navigate(`/client/benefitsiq`)}
      >
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Active Plans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-muted-foreground">Compliance</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Health Plan</span>
              <span className="font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dental Plan</span>
              <span className="font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Vision Plan</span>
              <span className="font-medium">Active</span>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-2 border-t">
            Click to open full BenefitsIQ interface
          </div>
        </div>
      </SettingsCard>

      {/* Organizational Structure */}
      <SettingsCard
        title="Organizational Structure"
        description="Manage divisions, departments, and locations"
        icon={<Building2 className="h-5 w-5 text-primary" />}
        readonly={readonly}
        isLoading={false}
        clickable={true}
        onClick={() => setShowOrgStructure(true)}
      >
        <div className="text-center py-4">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to manage organizational structure
          </p>
        </div>
      </SettingsCard>

      {/* Organizational Structure Dialog */}
      <Dialog open={showOrgStructure} onOpenChange={setShowOrgStructure}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Organizational Structure</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {companyId && (
              <OrgStructureTab companyId={companyId} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};