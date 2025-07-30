import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle,
  Home,
  Shield,
  Phone,
  MapPin,
  Play,
  ArrowRight,
  Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CustomScormPlayer } from "@/components/ui/custom-scorm-player";

export const WPVLearnerFlow = () => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'scorm' | 'ai-slides' | 'complete'>('intro');
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [scormProgress, setScormProgress] = useState(0);
  const [wpvModule, setWpvModule] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company settings
        const { data: companyData } = await supabase
          .from('company_settings')
          .select('*')
          .maybeSingle();
        setCompanySettings(companyData);

        // Fetch Core WPV Training module
        const { data: moduleData } = await supabase
          .from('training_modules')
          .select('*')
          .eq('title', 'Core WPV Training')
          .maybeSingle();
        setWpvModule(moduleData);
        console.log('🎮 Fetched WPV Module:', moduleData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleStartTraining = () => {
    setCurrentStep('scorm');
  };

  const handleScormComplete = () => {
    setCurrentStep('ai-slides');
  };

  const handleTrainingComplete = () => {
    setCurrentStep('complete');
  };

  // Introduction Screen with Company Logo
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">

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

              <CardTitle className="text-4xl font-bold text-white mb-4">
                Core WPV Training
              </CardTitle>
              <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-4">
                Essential workplace violence prevention training tailored to your organization's policies and procedures.
              </p>
              {companySettings?.company_name && (
                <p className="text-lg text-white/70 font-medium">
                  {companySettings.company_name}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="text-center pt-4">
                <Button 
                  onClick={handleStartTraining}
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xl px-12 py-4 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start Training
                </Button>
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
              onClick={() => window.location.href = '/'}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8">
              <CustomScormPlayer
                scormPackageUrl={wpvModule?.scorm_file_path || "https://xfamotequcavggiqndfj.supabase.co/storage/v1/object/public/training-files/training-files/scorm_1752327071386_414acf74-7798-42b5-a169-996ef69ed633.zip"}
                moduleName="Core WPV Training"
                onComplete={(score, duration) => {
                  console.log('SCORM training completed:', { score, duration });
                  handleScormComplete();
                }}
                onProgress={(progress) => {
                  setScormProgress(progress);
                }}
                className="w-full"
              />
              
              <div className="text-center mt-6">
                <div className="mb-4">
                  <p className="text-white/70 text-sm mb-2">Training Progress</p>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scormProgress}%` }}
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-1">{Math.round(scormProgress)}% Complete</p>
                </div>
                
                <Button 
                  onClick={handleScormComplete}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-3 rounded-xl shadow-lg transition-all duration-300"
                  disabled={scormProgress < 80}
                >
                  Continue to Learning Materials
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {scormProgress < 80 && (
                  <p className="text-white/60 text-sm mt-2">Complete at least 80% of the training to continue</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // AI Generated Slides Step
  if (currentStep === 'ai-slides') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Emergency Procedures & Contact Information</h1>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>

          <div className="space-y-8">
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

            {/* Safe Areas */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <MapPin className="w-8 h-8 mr-3 text-green-400" />
                  Designated Safe Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-green-300 mb-2">Conference Room A</h3>
                    <p className="text-white/80">2nd Floor, East Wing</p>
                    <p className="text-green-200 text-sm mt-2">Reinforced doors, no windows</p>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-green-300 mb-2">Supply Closet B</h3>
                    <p className="text-white/80">1st Floor, Central</p>
                    <p className="text-green-200 text-sm mt-2">Interior room, lockable</p>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-green-300 mb-2">Break Room</h3>
                    <p className="text-white/80">3rd Floor, West Wing</p>
                    <p className="text-green-200 text-sm mt-2">Multiple exit points</p>
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
              Congratulations! You have successfully completed the Core WPV Training program.
            </p>

            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-white text-green-900 hover:bg-white/90 px-8 py-3 rounded-xl w-full"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};