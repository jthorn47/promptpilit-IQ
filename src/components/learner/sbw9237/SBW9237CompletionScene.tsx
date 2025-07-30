import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, Home, Award } from "lucide-react";
import { useCertificateGeneration } from "@/hooks/useCertificateGeneration";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SBW9237CompletionSceneProps {
  assignment: any;
  companySettings: any;
  onReturnToDashboard: () => void;
}

export const SBW9237CompletionScene = ({ 
  assignment, 
  companySettings, 
  onReturnToDashboard 
}: SBW9237CompletionSceneProps) => {
  const [isLoggingCompletion, setIsLoggingCompletion] = useState(false);
  const [completionLogged, setCompletionLogged] = useState(false);
  const { generateCertificate, isGenerating } = useCertificateGeneration();
  const { toast } = useToast();

  useEffect(() => {
    logTrainingCompletion();
  }, []);

  const logTrainingCompletion = async () => {
    if (completionLogged) return;

    try {
      setIsLoggingCompletion(true);

      // Check if completion already exists
      const { data: existingCompletion } = await supabase
        .from("training_completions")
        .select("id")
        .eq("assignment_id", assignment.id)
        .eq("employee_id", assignment.employee_id)
        .maybeSingle();

      if (existingCompletion) {
        setCompletionLogged(true);
        return;
      }

      // Log the completion
      const { error: completionError } = await supabase
        .from("training_completions")
        .insert({
          assignment_id: assignment.id,
          employee_id: assignment.employee_id,
          training_module_id: assignment.training_module_id,
          completed_at: new Date().toISOString(),
          completion_score: 100, // SBW-9237 is pass/fail, so 100% on completion
          completion_metadata: {
            training_type: "SBW-9237",
            completion_method: "sequential_flow",
            scorm_completed: true,
            plan_reviewed: true,
            plan_certified: true
          }
        });

      if (completionError) throw completionError;

      // Update assignment status
      await supabase
        .from("training_assignments")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", assignment.id);

      setCompletionLogged(true);

      toast({
        title: "Training Completed!",
        description: "Your SB 553 training has been successfully recorded.",
      });

    } catch (error: any) {
      console.error("Error logging SBW-9237 completion:", error);
      toast({
        title: "Completion Error",
        description: "There was an issue recording your completion. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingCompletion(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      await generateCertificate(
        assignment.id,
        assignment.employee_id,
        assignment.training_module_id
      );
    } catch (error) {
      console.error("Error generating SBW-9237 certificate:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50/30">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-green-900">
              Congratulations!
            </h1>
            <h2 className="text-2xl font-semibold text-green-700 mb-2">
              You've Completed Your SB 553 Training
            </h2>
            <p className="text-lg text-muted-foreground">
              Workplace Violence Prevention Training for {companySettings.company_name}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Training Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Training Summary</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Training Module:</span>
                  <span className="font-medium">SBW-9237</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completion Date:</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{companySettings.company_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-600">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What You Accomplished */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">What You Accomplished</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Completed SB 553 core training video</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Reviewed company-specific WPV plan</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Certified understanding of policies</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Met California SB 553 requirements</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificate and Actions */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Your Certificate is Ready</h3>
            <p className="text-muted-foreground mb-6">
              Download your official Certificate of Completion for your records.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleDownloadCertificate}
                disabled={isGenerating || isLoggingCompletion}
                size="lg"
                className="px-8"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Generating Certificate...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </>
                )}
              </Button>
              
              <Button
                onClick={onReturnToDashboard}
                variant="outline"
                size="lg"
                className="px-8"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mt-6 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Your completion has been automatically recorded in the system</p>
              <p>• This certificate serves as proof of SB 553 compliance training</p>
              <p>• Keep your certificate for your employment records</p>
              <p>• Additional training may be required based on your role and workplace changes</p>
            </div>
          </CardContent>
        </Card>

        {isLoggingCompletion && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Recording your completion...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};