import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, X, Play, Shield, Clock, Award } from "lucide-react";

interface TrainingIntroductionScreenProps {
  moduleName: string;
  companyLogo?: string | null;
  companyName?: string | null;
  onClose: () => void;
  onStartBuilding: () => Promise<void>;
}

export const TrainingIntroductionScreen = ({
  moduleName,
  companyLogo,
  companyName,
  onClose,
  onStartBuilding,
}: TrainingIntroductionScreenProps) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background to-muted/30 z-50 min-h-screen">
      {/* Header with ease.learn logo and close button */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <Logo size="md" />
        <Button variant="ghost" onClick={onClose} className="rounded-full hover:bg-muted">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-6 mb-8">
              {/* Company Logo */}
              {companyLogo && (
                <div className="bg-white rounded-xl p-4 shadow-md border">
                  <img 
                    src={companyLogo} 
                    alt={`${companyName || 'Company'} Logo`}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              )}
              
              {/* Connector */}
              <div className="hidden sm:block">
                <div className="w-16 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              {/* Training Module Badge */}
              <div className="bg-primary/10 border border-primary/20 rounded-full px-6 py-2">
                <span className="text-primary font-medium text-sm">Training Module</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome to {companyName ? `${companyName}'s` : ''} Training
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Complete your required training module and earn your certification
            </p>

            {/* Begin Training Button - Above the fold */}
            <Button 
              onClick={onStartBuilding}
              size="lg"
              className="h-14 px-8 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Play className="w-5 h-5 mr-3" />
              Begin Training
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </div>

          {/* Training Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-background/80 backdrop-blur rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Compliance</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Stay compliant with industry regulations and company policies
              </p>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Quick & Easy</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Complete your training in just a few minutes at your own pace
              </p>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Certification</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Receive your certificate upon successful completion
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-background/60 backdrop-blur rounded-xl p-6 border border-border/50">
            <h3 className="font-semibold mb-4 text-center">Training Overview</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="text-sm font-medium">Introduction</span>
              </div>
              
              <div className="w-8 h-px bg-border"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-sm text-muted-foreground">Content</span>
              </div>
              
              <div className="w-8 h-px bg-border"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-sm text-muted-foreground">Assessment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};