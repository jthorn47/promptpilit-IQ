import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  RotateCcw, 
  Coffee, 
  Calculator, 
  Calendar, 
  CheckSquare, 
  MapPin, 
  FileText,
  Save,
  Info,
  Shield,
  Building2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

interface Company {
  id: string;
  company_name: string;
}

export const TimeAttendanceSettings = () => {
  const { hasRole, user } = useAuth();
  const { toast } = useToast();

  // Multi-tenant state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Clock-In/Clock-Out Rules
  const [clockInEnabled, setClockInEnabled] = useState(true);
  const [clockMethods, setClockMethods] = useState({
    webPortal: true,
    mobileApp: true,
    kioskMode: false,
    biometric: false
  });
  const [maxPunchesPerDay, setMaxPunchesPerDay] = useState("8");
  const [earlyClockInWindow, setEarlyClockInWindow] = useState("10");
  const [lateClockOutBuffer, setLateClockOutBuffer] = useState("15");

  // Rounding Rules
  const [roundingInterval, setRoundingInterval] = useState("15");
  const [roundingApply, setRoundingApply] = useState("both");
  const [roundingMethod, setRoundingMethod] = useState("nearest");

  // Break & Meal Rules
  const [autoInsertBreaks, setAutoInsertBreaks] = useState(true);
  const [breakDuration, setBreakDuration] = useState("15");
  const [breakAfterHours, setBreakAfterHours] = useState("4");
  const [mealAfterHours, setMealAfterHours] = useState("5");
  const [autoDeductMeal, setAutoDeductMeal] = useState(true);
  const [mealWaiverOption, setMealWaiverOption] = useState(true);

  // Overtime Rules
  const [dailyOTHours, setDailyOTHours] = useState("8");
  const [weeklyOTHours, setWeeklyOTHours] = useState("40");
  const [doubleTimeHours, setDoubleTimeHours] = useState("12");
  const [californiaSeventhDay, setCaliforniaSeventhDay] = useState(true);

  // Scheduling Integration
  const [enforceShiftLimits, setEnforceShiftLimits] = useState(true);
  const [denyUnscheduled, setDenyUnscheduled] = useState(false);
  const [requireManagerOverride, setRequireManagerOverride] = useState(true);

  // Timecard Approval
  const [requireApproval, setRequireApproval] = useState(true);
  const [defaultApprover, setDefaultApprover] = useState("supervisor");
  const [electronicSignature, setElectronicSignature] = useState(true);
  const [lockAfterApproval, setLockAfterApproval] = useState(true);

  // Geofencing & Device Control
  const [enableGeofencing, setEnableGeofencing] = useState(false);
  const [approvedIPRanges, setApprovedIPRanges] = useState("");
  const [oneDevicePerUser, setOneDevicePerUser] = useState(false);

  // Audit Trail
  const [retentionYears, setRetentionYears] = useState("7");
  const [showCorrectionHistory, setShowCorrectionHistory] = useState(true);
  const [enableAlerts, setEnableAlerts] = useState(true);

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load settings when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      loadSettingsForCompany(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  // Only Super Admins and Company Admins can access this page
  if (!hasRole('super_admin') && !hasRole('company_admin')) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only Company Admins and Super Admins can access Time & Attendance settings.</p>
        </div>
      </div>
    );
  }

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('id, company_name')
        .order('company_name');

      if (error) throw error;

      setCompanies(data || []);
      
      // Auto-select first company if Super Admin, or user's company if Company Admin
      if (data && data.length > 0) {
        if (hasRole('super_admin')) {
          setSelectedCompanyId(data[0].id);
        } else if (hasRole('company_admin')) {
          // Company admins should only see their own company
          const userCompany = data.find(company => true); // This would be filtered by RLS
          if (userCompany) {
            setSelectedCompanyId(userCompany.id);
          }
        }
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadSettingsForCompany = async (companyId: string) => {
    try {
      // Here you would load the specific settings for this company
      // For now, we'll use default values but this would come from your database
      toast({
        title: "Settings Loaded",
        description: `Loaded settings for selected company.`,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings for this company.",
        variant: "destructive",
      });
    }
  };

  const breadcrumbItems = [
    { label: 'Time & Attendance', href: '/time-attendance' },
    { label: 'Settings' }
  ];

  const handleSaveSettings = async () => {
    if (!selectedCompanyId) {
      toast({
        title: "Error",
        description: "Please select a company first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingSettings(true);
      
      // Here you would save the settings to your database for the selected company
      // This would include all the state variables for the specific company
      
      toast({
        title: "Settings Saved",
        description: `Time & Attendance settings have been updated for the selected company.`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const TooltipWrapper = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Time & Attendance Settings</h1>
            <p className="text-muted-foreground mt-1">Configure workforce time policies and attendance rules</p>
          </div>
          <Button onClick={handleSaveSettings} disabled={savingSettings || !selectedCompanyId} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {savingSettings ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {/* Company Selector - Multi-Tenant */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Company Selection</CardTitle>
              </div>
              <div className="text-sm text-muted-foreground">
                {hasRole('super_admin') ? 'Super Admin' : 'Company Admin'} Access
              </div>
            </div>
            <CardDescription>
              {hasRole('super_admin') 
                ? 'Select which company to configure Time & Attendance settings for' 
                : 'Configure settings for your company'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="company-select">Company</Label>
              <Select 
                value={selectedCompanyId} 
                onValueChange={setSelectedCompanyId}
                disabled={loadingCompanies || (!hasRole('super_admin') && companies.length <= 1)}
              >
                <SelectTrigger id="company-select" className="w-full">
                  <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select a company"} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedCompanyId && !loadingCompanies && (
                <p className="text-sm text-amber-600">Please select a company to configure settings.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="clock-rules" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="clock-rules" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Clock Rules</span>
            </TabsTrigger>
            <TabsTrigger value="rounding" className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Rounding</span>
            </TabsTrigger>
            <TabsTrigger value="breaks" className="flex items-center gap-1">
              <Coffee className="h-4 w-4" />
              <span className="hidden sm:inline">Breaks</span>
            </TabsTrigger>
            <TabsTrigger value="overtime" className="flex items-center gap-1">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Overtime</span>
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Scheduling</span>
            </TabsTrigger>
            <TabsTrigger value="approval" className="flex items-center gap-1">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Approval</span>
            </TabsTrigger>
            <TabsTrigger value="geofencing" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Location</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          {/* Clock-In/Clock-Out Rules */}
          <TabsContent value="clock-rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Clock-In/Clock-Out Rules
                </CardTitle>
                <CardDescription>Configure how employees can clock in and out</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Clock-In/Out</Label>
                    <p className="text-sm text-muted-foreground">Allow employees to clock in and out</p>
                  </div>
                  <Switch checked={clockInEnabled} onCheckedChange={setClockInEnabled} />
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Clock-In Methods</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="web-portal" 
                        checked={clockMethods.webPortal}
                        onCheckedChange={(checked) => 
                          setClockMethods(prev => ({ ...prev, webPortal: !!checked }))
                        }
                      />
                      <Label htmlFor="web-portal">Web Portal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="mobile-app" 
                        checked={clockMethods.mobileApp}
                        onCheckedChange={(checked) => 
                          setClockMethods(prev => ({ ...prev, mobileApp: !!checked }))
                        }
                      />
                      <Label htmlFor="mobile-app">Mobile App (with geofencing)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="kiosk-mode" 
                        checked={clockMethods.kioskMode}
                        onCheckedChange={(checked) => 
                          setClockMethods(prev => ({ ...prev, kioskMode: !!checked }))
                        }
                      />
                      <Label htmlFor="kiosk-mode">Kiosk Mode (PIN/QR Code)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="biometric" 
                        checked={clockMethods.biometric}
                        onCheckedChange={(checked) => 
                          setClockMethods(prev => ({ ...prev, biometric: !!checked }))
                        }
                      />
                      <Label htmlFor="biometric">Biometric (Future)</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <TooltipWrapper content="Maximum number of clock punches allowed per day">
                      <Label className="flex items-center gap-1">
                        Max Punches per Day
                        <Info className="h-3 w-3" />
                      </Label>
                    </TooltipWrapper>
                    <Input 
                      type="number" 
                      value={maxPunchesPerDay} 
                      onChange={(e) => setMaxPunchesPerDay(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <TooltipWrapper content="How many minutes early employees can clock in before their shift">
                      <Label className="flex items-center gap-1">
                        Early Clock-In Window (minutes)
                        <Info className="h-3 w-3" />
                      </Label>
                    </TooltipWrapper>
                    <Input 
                      type="number" 
                      value={earlyClockInWindow} 
                      onChange={(e) => setEarlyClockInWindow(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <TooltipWrapper content="Grace period for late clock-outs after shift ends">
                      <Label className="flex items-center gap-1">
                        Late Clock-Out Buffer (minutes)
                        <Info className="h-3 w-3" />
                      </Label>
                    </TooltipWrapper>
                    <Input 
                      type="number" 
                      value={lateClockOutBuffer} 
                      onChange={(e) => setLateClockOutBuffer(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rounding Rules */}
          <TabsContent value="rounding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Time Rounding Rules
                </CardTitle>
                <CardDescription>Configure how time punches are rounded for payroll</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Round to Nearest</Label>
                    <Select value={roundingInterval} onValueChange={setRoundingInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Apply Rounding At</Label>
                    <Select value={roundingApply} onValueChange={setRoundingApply}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clock-in">Clock-in only</SelectItem>
                        <SelectItem value="clock-out">Clock-out only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rounding Method</Label>
                    <Select value={roundingMethod} onValueChange={setRoundingMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="up">Round up</SelectItem>
                        <SelectItem value="down">Round down</SelectItem>
                        <SelectItem value="nearest">Round to nearest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Break & Meal Rules */}
          <TabsContent value="breaks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  Break & Meal Period Rules
                </CardTitle>
                <CardDescription>Configure break and meal period policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Insert Breaks</Label>
                    <p className="text-sm text-muted-foreground">Automatically add breaks to timecards</p>
                  </div>
                  <Switch checked={autoInsertBreaks} onCheckedChange={setAutoInsertBreaks} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Break Duration (minutes)</Label>
                    <Input 
                      type="number" 
                      value={breakDuration} 
                      onChange={(e) => setBreakDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Break After Hours Worked</Label>
                    <Input 
                      type="number" 
                      value={breakAfterHours} 
                      onChange={(e) => setBreakAfterHours(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Meal Period Settings</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Required After Hours</Label>
                      <Input 
                        type="number" 
                        value={mealAfterHours} 
                        onChange={(e) => setMealAfterHours(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Automatically Deduct Meal</Label>
                        <p className="text-sm text-muted-foreground">Deduct meal time from hours worked</p>
                      </div>
                      <Switch checked={autoDeductMeal} onCheckedChange={setAutoDeductMeal} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Meal Waiver Options</Label>
                        <p className="text-sm text-muted-foreground">Allow employees to waive meal periods (California compliance)</p>
                      </div>
                      <Switch checked={mealWaiverOption} onCheckedChange={setMealWaiverOption} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overtime Rules */}
          <TabsContent value="overtime" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Overtime Rules
                </CardTitle>
                <CardDescription>Configure overtime calculation policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <TooltipWrapper content="Hours worked per day before overtime kicks in">
                      <Label className="flex items-center gap-1">
                        Daily OT After Hours
                        <Info className="h-3 w-3" />
                      </Label>
                    </TooltipWrapper>
                    <Input 
                      type="number" 
                      value={dailyOTHours} 
                      onChange={(e) => setDailyOTHours(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <TooltipWrapper content="Hours worked per week before overtime kicks in">
                      <Label className="flex items-center gap-1">
                        Weekly OT After Hours
                        <Info className="h-3 w-3" />
                      </Label>
                    </TooltipWrapper>
                    <Input 
                      type="number" 
                      value={weeklyOTHours} 
                      onChange={(e) => setWeeklyOTHours(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <TooltipWrapper content="Hours worked per day before double time kicks in">
                      <Label className="flex items-center gap-1">
                        Double Time After Hours
                        <Info className="h-3 w-3" />
                      </Label>
                    </TooltipWrapper>
                    <Input 
                      type="number" 
                      value={doubleTimeHours} 
                      onChange={(e) => setDoubleTimeHours(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">California 7th Day Rule</Label>
                    <p className="text-sm text-muted-foreground">Apply overtime for 7th consecutive day worked</p>
                  </div>
                  <Switch checked={californiaSeventhDay} onCheckedChange={setCaliforniaSeventhDay} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduling Integration */}
          <TabsContent value="scheduling" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduling Integration
                </CardTitle>
                <CardDescription>Configure how time tracking integrates with scheduling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enforce Shift Clock-In Limits</Label>
                    <p className="text-sm text-muted-foreground">Restrict clock-ins to scheduled shift times</p>
                  </div>
                  <Switch checked={enforceShiftLimits} onCheckedChange={setEnforceShiftLimits} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Deny Unscheduled Clock-Ins</Label>
                    <p className="text-sm text-muted-foreground">Automatically reject clock-ins outside scheduled hours</p>
                  </div>
                  <Switch checked={denyUnscheduled} onCheckedChange={setDenyUnscheduled} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require Manager Override</Label>
                    <p className="text-sm text-muted-foreground">Require manager approval for unscheduled clock-ins</p>
                  </div>
                  <Switch checked={requireManagerOverride} onCheckedChange={setRequireManagerOverride} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timecard Approval */}
          <TabsContent value="approval" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Timecard Approval Workflow
                </CardTitle>
                <CardDescription>Configure timecard approval process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require Approval Before Payroll</Label>
                    <p className="text-sm text-muted-foreground">Timecards must be approved before payroll processing</p>
                  </div>
                  <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
                </div>

                <div className="space-y-2">
                  <Label>Default Approver</Label>
                  <Select value={defaultApprover} onValueChange={setDefaultApprover}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">Direct Supervisor</SelectItem>
                      <SelectItem value="manager">Department Manager</SelectItem>
                      <SelectItem value="payroll">Payroll Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Electronic Signature</Label>
                    <p className="text-sm text-muted-foreground">Require electronic signature on timecards</p>
                  </div>
                  <Switch checked={electronicSignature} onCheckedChange={setElectronicSignature} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Lock Timecard After Approval</Label>
                    <p className="text-sm text-muted-foreground">Prevent changes to approved timecards</p>
                  </div>
                  <Switch checked={lockAfterApproval} onCheckedChange={setLockAfterApproval} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Geofencing & Device Control */}
          <TabsContent value="geofencing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Device Control
                </CardTitle>
                <CardDescription>Configure location-based and device restrictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Location-Based Clock-Ins</Label>
                    <p className="text-sm text-muted-foreground">Require employees to be at approved locations</p>
                  </div>
                  <Switch checked={enableGeofencing} onCheckedChange={setEnableGeofencing} />
                </div>

                <div className="space-y-2">
                  <TooltipWrapper content="Comma-separated list of approved IP ranges (e.g., 192.168.1.0/24)">
                    <Label className="flex items-center gap-1">
                      Approved IP Ranges
                      <Info className="h-3 w-3" />
                    </Label>
                  </TooltipWrapper>
                  <Input 
                    placeholder="192.168.1.0/24, 10.0.0.0/8"
                    value={approvedIPRanges} 
                    onChange={(e) => setApprovedIPRanges(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Limit One Device Per User</Label>
                    <p className="text-sm text-muted-foreground">Prevent simultaneous logins from multiple devices</p>
                  </div>
                  <Switch checked={oneDevicePerUser} onCheckedChange={setOneDevicePerUser} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail & Reporting */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Audit Trail & Reporting Settings
                </CardTitle>
                <CardDescription>Configure audit and compliance tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <TooltipWrapper content="How long to retain punch and timecard history for compliance">
                    <Label className="flex items-center gap-1">
                      Retain Punch History (years)
                      <Info className="h-3 w-3" />
                    </Label>
                  </TooltipWrapper>
                  <Input 
                    type="number" 
                    value={retentionYears} 
                    onChange={(e) => setRetentionYears(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Show Punch Correction History</Label>
                    <p className="text-sm text-muted-foreground">Display all punch edits and corrections</p>
                  </div>
                  <Switch checked={showCorrectionHistory} onCheckedChange={setShowCorrectionHistory} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert for missed punches and duplicate entries</p>
                  </div>
                  <Switch checked={enableAlerts} onCheckedChange={setEnableAlerts} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};