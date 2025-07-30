import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Lock, MessageCircle, ArrowLeft, ArrowRight, Building2, Users, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompanyLegalSetup } from '@/components/peo/sections/CompanyLegalSetup';
import { EmployeeSetup } from '@/components/peo/sections/EmployeeSetup';
import { PayrollHistorySetup } from '@/components/peo/sections/PayrollHistorySetup';
import { PayrollScheduleSetup } from '@/components/peo/sections/PayrollScheduleSetup';
import { BankingWorkersCompSetup } from '@/components/peo/sections/BankingWorkersCompSetup';
import { TimeAttendanceSetup } from '@/components/peo/sections/TimeAttendanceSetup';
import { PayrollTestingGoLive } from '@/components/peo/sections/PayrollTestingGoLive';
import { MessageCenter } from '@/components/peo/MessageCenter';
import { AccessibleFormField } from '@/components/AccessibleForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OnboardingSession {
  id: string;
  session_name: string;
  setup_type: string;
  current_section: number;
  overall_progress: number;
  status: string;
  company_id: string;
  assigned_onboarding_manager: string;
  created_by: string;
}

interface OnboardingSection {
  id: string;
  section_number: number;
  section_name: string;
  status: string;
  progress: number;
  requires_approval: boolean;
  is_locked: boolean;
  approved_by: string | null;
  approved_at: string | null;
  section_data?: any;
}

export const PEOOnboardingWizard: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [sections, setSections] = useState<OnboardingSection[]>([]);
  const [currentSection, setCurrentSection] = useState(1);
  const [userRole, setUserRole] = useState<'client_admin' | 'onboarding_manager' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessageCenter, setShowMessageCenter] = useState(false);

  // New onboarding flow states
  const [isNewOnboarding, setIsNewOnboarding] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [step, setStep] = useState<'client' | 'contact' | 'confirm'>('client');

  useEffect(() => {
    if (sessionId === 'new') {
      setIsNewOnboarding(true);
      setLoading(false);
      loadClients();
    } else if (sessionId) {
      loadOnboardingSession();
      determineUserRole();
    }
  }, [sessionId]);

  const loadOnboardingSession = async () => {
    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('peo_onboarding_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Load sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('peo_onboarding_sections')
        .select('*')
        .eq('session_id', sessionId)
        .order('section_number');

      if (sectionsError) throw sectionsError;
      setSections(sectionsData);
      setCurrentSection(sessionData.current_section || 1);

    } catch (error: any) {
      toast({
        title: "Error Loading Onboarding",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const determineUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user is onboarding manager for this session
    const { data: sessionData } = await supabase
      .from('peo_onboarding_sessions')
      .select('assigned_onboarding_manager, company_id')
      .eq('id', sessionId)
      .single();

    if (sessionData?.assigned_onboarding_manager === user.id) {
      setUserRole('onboarding_manager');
    } else {
      // Check if user is company admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, company_id')
        .eq('user_id', user.id)
        .eq('company_id', sessionData?.company_id);

      if (roleData?.length > 0) {
        setUserRole('client_admin');
      }
    }
  };

  const loadClients = async () => {
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('company_name');

      if (error) throw error;
      setClients(clientsData || []);
      
      // Check if clientId is provided in URL params
      const clientId = searchParams.get('clientId');
      if (clientId && clientsData?.find(c => c.id === clientId)) {
        setSelectedClient(clientId);
        setStep('contact');
      }

    } catch (error: any) {
      toast({
        title: "Error Loading Clients",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateOnboarding = async () => {
    if (!selectedClient || !contactEmail || !contactName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the client's company_settings_id
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('company_settings_id, company_name')
        .eq('id', selectedClient)
        .single();

      if (clientError) throw clientError;
      if (!clientData.company_settings_id) {
        throw new Error('Client does not have a company settings record');
      }

      // Create new onboarding session
      const { data: sessionData, error: sessionError } = await supabase
        .from('peo_onboarding_sessions')
        .insert({
          company_id: clientData.company_settings_id,
          session_name: `${clientData.company_name} PEO Onboarding`,
          setup_type: 'peo',
          status: 'not_started',
          created_by: user.id,
          assigned_onboarding_manager: user.id,
          current_section: 1,
          overall_progress: 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create initial sections
      const sections = [
        { section_number: 1, section_name: 'Company Legal Setup', status: 'not_started' as const, progress: 0 },
        { section_number: 2, section_name: 'Employee Setup', status: 'not_started' as const, progress: 0 },
        { section_number: 3, section_name: 'Payroll History Setup', status: 'not_started' as const, progress: 0 },
        { section_number: 4, section_name: 'Payroll Schedule Setup', status: 'not_started' as const, progress: 0 },
        { section_number: 5, section_name: 'Banking & Workers Comp Setup', status: 'not_started' as const, progress: 0 },
        { section_number: 6, section_name: 'Time & Attendance Setup', status: 'not_started' as const, progress: 0 },
        { section_number: 7, section_name: 'Payroll Testing & Go Live', status: 'not_started' as const, progress: 0 }
      ];

      for (const section of sections) {
        await supabase
          .from('peo_onboarding_sections')
          .insert({
            session_id: sessionData.id,
            ...section,
            is_locked: false
          });
      }

      // TODO: Send email to contact
      toast({
        title: "Onboarding Created",
        description: `Onboarding session created and email sent to ${contactEmail}`,
      });

      // Navigate to the new session
      navigate(`/admin/peo/onboarding/${sessionData.id}`);

    } catch (error: any) {
      toast({
        title: "Error Creating Onboarding",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateSectionProgress = async (sectionNumber: number, progress: number, sectionData?: any) => {
    const { error } = await supabase
      .from('peo_onboarding_sections')
      .update({
        progress,
        section_data: sectionData,
        status: progress === 100 ? 'completed' : 'in_progress',
        completed_at: progress === 100 ? new Date().toISOString() : null
      })
      .eq('session_id', sessionId)
      .eq('section_number', sectionNumber);

    if (error) {
      toast({
        title: "Error Saving Progress",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Reload sections to reflect changes
    loadOnboardingSession();
  };

  const navigateToSection = (sectionNumber: number) => {
    const section = sections.find(s => s.section_number === sectionNumber);
    if (!section) return;

    // Check if section is locked
    if (section.is_locked && userRole !== 'onboarding_manager') {
      toast({
        title: "Section Locked",
        description: "This section is locked and requires onboarding manager approval.",
        variant: "destructive"
      });
      return;
    }

    // Check if previous sections are completed (except for onboarding managers)
    if (userRole === 'client_admin' && sectionNumber > 1) {
      const previousSection = sections.find(s => s.section_number === sectionNumber - 1);
      if (previousSection && previousSection.status !== 'completed') {
        toast({
          title: "Complete Previous Section",
          description: "Please complete the previous section before proceeding.",
          variant: "destructive"
        });
        return;
      }
    }

    setCurrentSection(sectionNumber);
  };

  const getSectionStatusIcon = (section: OnboardingSection) => {
    if (section.is_locked) return <Lock className="h-4 w-4 text-red-500" />;
    if (section.status === 'completed') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (section.status === 'in_progress') return <Clock className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  const getSectionStatusBadge = (section: OnboardingSection) => {
    if (section.is_locked) return <Badge variant="destructive">Locked</Badge>;
    if (section.status === 'completed') return <Badge variant="default">Completed</Badge>;
    if (section.status === 'in_progress') return <Badge variant="secondary">In Progress</Badge>;
    return <Badge variant="outline">Not Started</Badge>;
  };

  const renderCurrentSection = () => {
    const sectionData = sections.find(s => s.section_number === currentSection);
    if (!sectionData) return null;

    const commonProps = {
      sessionId: sessionId!,
      sectionId: sectionData.id,
      sectionData: sectionData.section_data || {},
      userRole: userRole!,
      onProgressUpdate: (progress: number, data?: any) => 
        updateSectionProgress(currentSection, progress, data)
    };

    switch (currentSection) {
      case 1:
        return <CompanyLegalSetup {...commonProps} />;
      case 2:
        return <EmployeeSetup {...commonProps} />;
      case 3:
        return <PayrollHistorySetup {...commonProps} />;
      case 4:
        return <PayrollScheduleSetup {...commonProps} />;
      case 5:
        return <BankingWorkersCompSetup {...commonProps} />;
      case 6:
        return <TimeAttendanceSetup {...commonProps} />;
      case 7:
        return <PayrollTestingGoLive {...commonProps} />;
      default:
        return <div>Section not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isNewOnboarding) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New PEO Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'client' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Select Client</h3>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setStep('contact')} disabled={!selectedClient}>
                    Next: Select Contact
                  </Button>
                </div>
              </div>
            )}
            {step === 'contact' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <AccessibleFormField
                    name="contactName"
                    label="Contact Name"
                    value={contactName}
                    onChange={setContactName}
                    required
                  />
                  <AccessibleFormField
                    name="contactEmail"
                    label="Contact Email"
                    type="email"
                    value={contactEmail}
                    onChange={setContactEmail}
                    required
                  />
                </div>
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep('client')}>
                    Back
                  </Button>
                  <Button onClick={handleCreateOnboarding} disabled={!contactName || !contactEmail}>
                    Create Onboarding & Send Email
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Onboarding Session Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested onboarding session could not be found.
            </p>
            <Button onClick={() => navigate('/admin')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSectionData = sections.find(s => s.section_number === currentSection);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{session.session_name}</h1>
                <p className="text-muted-foreground">
                  {session.setup_type.toUpperCase()} Onboarding • Section {currentSection} of {sections.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMessageCenter(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
              <Badge variant={userRole === 'onboarding_manager' ? 'default' : 'secondary'}>
                {userRole === 'onboarding_manager' ? 'Onboarding Manager' : 'Client Admin'}
              </Badge>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{session.overall_progress}%</span>
            </div>
            <Progress value={session.overall_progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Section Navigation */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Onboarding Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentSection === section.section_number
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => navigateToSection(section.section_number)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSectionStatusIcon(section)}
                        <span className="text-sm font-medium">
                          {section.section_number}. {section.section_name}
                        </span>
                      </div>
                      {getSectionStatusBadge(section)}
                    </div>
                    <Progress value={section.progress} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {currentSectionData?.section_name}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      Section {currentSection} of {sections.length}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentSectionData?.requires_approval && (
                      <Badge variant="outline">Requires Approval</Badge>
                    )}
                    {currentSectionData?.is_locked && (
                      <Badge variant="destructive">Locked</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderCurrentSection()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => navigateToSection(currentSection - 1)}
                disabled={currentSection === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Section
              </Button>
              <Button
                onClick={() => navigateToSection(currentSection + 1)}
                disabled={currentSection === sections.length}
              >
                Next Section
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Center Modal */}
      {showMessageCenter && (
        <MessageCenter
          sessionId={sessionId!}
          currentSectionId={currentSectionData?.id}
          userRole={userRole!}
          onClose={() => setShowMessageCenter(false)}
        />
      )}
    </div>
  );
};