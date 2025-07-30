import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Bot, Shield, Users, BookOpen } from "lucide-react";
import { WPVPlanUpload } from "./WPVPlanUpload";
import { WPVPlansList } from "./WPVPlansList";

interface WPVPlanManagerProps {
  companyId: string;
  companyName: string;
}

export const WPVPlanManager = ({ companyId, companyName }: WPVPlanManagerProps) => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedStep, setSelectedStep] = useState<'upload' | 'plans' | 'introduction' | 'ai-content'>('plans');

  const handleUploadComplete = (planId: string) => {
    setShowUpload(false);
    setSelectedStep('plans');
    // Optionally trigger a refresh of the plans list
  };

  const handleGenerateAIContent = (planId: string) => {
    console.log('Generate AI content for plan:', planId);
    // TODO: Implement AI content generation
    setSelectedStep('ai-content');
  };

  const steps = [
    {
      id: 'upload' as const,
      title: 'Upload WPV Plan',
      description: 'Upload your workplace violence prevention plan document',
      icon: FileText,
      status: 'available'
    },
    {
      id: 'plans' as const,
      title: 'Manage Plans',
      description: 'View and manage your uploaded WPV plans',
      icon: Shield,
      status: 'available'
    },
    {
      id: 'introduction' as const,
      title: 'Introduction Page',
      description: 'Create a custom introduction for your training',
      icon: BookOpen,
      status: 'coming-soon'
    },
    {
      id: 'ai-content' as const,
      title: 'AI Content Generation',
      description: 'Generate training content based on your plan',
      icon: Bot,
      status: 'coming-soon'
    }
  ];

  if (showUpload) {
    return (
      <div className="container mx-auto p-6">
        <WPVPlanUpload
          companyId={companyId}
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WPV Training Builder</h1>
          <p className="text-muted-foreground mt-1">
            Build customized workplace violence prevention training for {companyName}
          </p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          Company Training
        </Badge>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Training Development Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedStep === step.id
                    ? 'border-primary bg-primary/5'
                    : step.status === 'available'
                    ? 'border-border hover:border-primary/50'
                    : 'border-muted bg-muted/20'
                }`}
                onClick={() => step.status === 'available' && setSelectedStep(step.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : step.status === 'available'
                      ? 'bg-muted'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                {step.status === 'coming-soon' && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Coming Soon
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Panel */}
        <div className="lg:col-span-2">
          {selectedStep === 'plans' && (
            <WPVPlansList
              companyId={companyId}
              onGenerateAIContent={handleGenerateAIContent}
            />
          )}

          {selectedStep === 'introduction' && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Introduction Page Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Create a custom introduction page for your WPV training that welcomes learners and sets expectations.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
          )}

          {selectedStep === 'ai-content' && (
            <Card>
              <CardContent className="p-8 text-center">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Content Generation</h3>
                <p className="text-muted-foreground mb-4">
                  Generate customized training scenarios, quizzes, and interactive content based on your uploaded WPV plan.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowUpload(true)}
                className="w-full"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload New WPV Plan
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedStep('plans')}
              >
                <Shield className="w-4 h-4 mr-2" />
                View All Plans
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Training Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium">{companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Training Type:</span>
                <span className="font-medium">WPV Prevention</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Content Source:</span>
                <span className="font-medium">Custom Plan</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};