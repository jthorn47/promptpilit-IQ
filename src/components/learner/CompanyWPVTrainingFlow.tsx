import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle,
  Home,
  Shield,
  Phone,
  MapPin,
  Play,
  ArrowRight,
  Building2,
  Edit,
  Save
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const CompanyWPVTrainingFlow = () => {
  const { companyId } = useParams();
  const [currentStep, setCurrentStep] = useState<'intro' | 'edit-intro' | 'scorm' | 'ai-slides' | 'complete'>('intro');
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState({
    title: 'Core WPV Training',
    description: 'Essential workplace violence prevention training tailored to your organization\'s policies and procedures.',
    customMessage: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;
      
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('*')
          .eq('id', companyId)
          .single();
          
        if (error) throw error;
        setCompanySettings(data);
        
        // Load any existing custom content
        if (data?.welcome_screen_config && typeof data.welcome_screen_config === 'object') {
          setEditableContent(prev => ({
            ...prev,
            ...(data.welcome_screen_config as any)
          }));
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        toast({
          title: "Error",
          description: "Failed to load company information",
          variant: "destructive"
        });
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const handleSaveIntroContent = async () => {
    if (!companyId) return;
    
    try {
      const { error } = await supabase
        .from('company_settings')
        .update({ 
          welcome_screen_config: editableContent 
        })
        .eq('id', companyId);
        
      if (error) throw error;
      
      setIsEditing(false);
      toast({
        title: "Saved",
        description: "Introduction screen content updated successfully"
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive"
      });
    }
  };

  const handleStartTraining = () => {
    setCurrentStep('scorm');
  };

  const handleScormComplete = () => {
    setCurrentStep('ai-slides');
  };

  const handleTrainingComplete = () => {
    setCurrentStep('complete');
  };

  // Introduction Screen with Edit Capability
  if (currentStep === 'intro' || currentStep === 'edit-intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
          {/* Floating Exit Button */}
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/companies/${companyId}`)}
            className="fixed top-6 left-6 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Company
          </Button>

          {/* Edit Button */}
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(isEditing ? 'intro' : 'edit-intro')}
            className="fixed top-6 right-6 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            {currentStep === 'edit-intro' ? 'Cancel' : 'Edit'}
          </Button>

          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-8">
              {/* Company Logo */}
              {companySettings?.company_logo_url ? (
                <div className="w-32 h-32 mx-auto mb-6 rounded-lg overflow-hidden bg-white/10 border border-white/20 shadow-2xl">
                  <img 
                    src={companySettings.company_logo_url} 
                    alt={companySettings.company_name || "Company Logo"}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
              )}

              {currentStep === 'edit-intro' ? (
                <div className="space-y-4 text-left">
                  <div>
                    <Label htmlFor="title" className="text-white">Training Title</Label>
                    <Input
                      id="title"
                      value={editableContent.title}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={editableContent.description}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customMessage" className="text-white">Custom Message (Optional)</Label>
                    <Textarea
                      id="customMessage"
                      value={editableContent.customMessage}
                      onChange={(e) => setEditableContent(prev => ({ ...prev, customMessage: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Add any company-specific instructions or messages..."
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-4xl font-bold text-white mb-4">
                    {editableContent.title}
                  </CardTitle>
                  <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-4">
                    {editableContent.description}
                  </p>
                  {editableContent.customMessage && (
                    <p className="text-lg text-white/70 max-w-2xl mx-auto mb-4 border border-white/20 rounded-lg p-4 bg-white/5">
                      {editableContent.customMessage}
                    </p>
                  )}
                  {companySettings?.company_name && (
                    <p className="text-lg text-white/70 font-medium">
                      {companySettings.company_name}
                    </p>
                  )}
                </>
              )}
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="text-center pt-4">
                {currentStep === 'edit-intro' ? (
                  <Button 
                    onClick={handleSaveIntroContent}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xl px-12 py-4 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Save className="w-6 h-6 mr-3" />
                    Save Changes
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStartTraining}
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xl px-12 py-4 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Start Training
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // SCORM Video Step
  if (currentStep === 'scorm') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Core Training Video</h1>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/admin/companies/${companyId}`)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8">
              <div className="aspect-video bg-slate-800 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Shield className="w-16 h-16 text-red-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-white">SCORM Training Module</h3>
                  <p className="text-white/70">Interactive workplace violence prevention training content</p>
                  <Button 
                    onClick={handleScormComplete}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play Training Video
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={handleScormComplete}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-3 rounded-xl shadow-lg transition-all duration-300"
                >
                  Continue to Company-Specific Information
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // AI Generated Slides Step (Company-specific WPV Plan)
  if (currentStep === 'ai-slides') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              {companySettings?.company_name} WPV Plan
            </h1>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/admin/companies/${companyId}`)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>

          <div className="space-y-8">
            {/* WPV Plan Content */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Shield className="w-8 h-8 mr-3 text-red-400" />
                  Workplace Violence Prevention Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {companySettings?.wpv_plan_content ? (
                  <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-white/90 text-sm leading-relaxed">
                        {companySettings.wpv_plan_content}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60 mb-4">No WPV plan has been uploaded for this company yet.</p>
                    <Button 
                      onClick={() => navigate('/admin/wpv-plan')}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Upload WPV Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Phone className="w-8 h-8 mr-3 text-red-400" />
                  Emergency Contact Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-300 mb-2">Immediate Emergency</h3>
                    <p className="text-3xl font-bold text-white">911</p>
                    <p className="text-red-200 text-sm">Police, Fire, Medical Emergency</p>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Security Office</h3>
                    <p className="text-2xl font-bold text-white">(555) 123-4567</p>
                    <p className="text-blue-200 text-sm">24/7 Security Hotline</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Complete Training Button */}
            <div className="text-center pt-8">
              <Button 
                onClick={handleTrainingComplete}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xl px-12 py-4 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <CheckCircle className="w-6 h-6 mr-3" />
                Complete Training
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-scale-in">
          <CardContent className="text-center p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4">Training Complete!</h2>
            <p className="text-xl text-white/80 mb-8">
              Congratulations! You have successfully completed the {companySettings?.company_name} WPV Training program.
            </p>

            <div className="space-y-4">
              <Button 
                onClick={() => navigate(`/admin/companies/${companyId}`)}
                className="bg-white text-green-900 hover:bg-white/90 px-8 py-3 rounded-xl w-full"
              >
                Return to Company Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};