import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";

interface TrainingAssignment {
  id: string;
  training_module_id: string;
  due_date: string | null;
  status: string | null;
  priority: string | null;
  training_modules: {
    title: string;
    description: string | null;
  } | null;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id: string;
}

export default function TrainingLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [assignment, setAssignment] = useState<TrainingAssignment | null>(null);
  const [learner, setLearner] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  
  const learnerId = searchParams.get("learner");
  const assignmentId = searchParams.get("assignment");

  useEffect(() => {
    if (learnerId && assignmentId) {
      verifyAssignment();
    } else {
      setError("Invalid training link. Please contact your administrator.");
      setVerifying(false);
    }
  }, [learnerId, assignmentId]);

  const verifyAssignment = async () => {
    try {
      setVerifying(true);
      setError("");

      // Fetch the training assignment and learner details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("training_assignments")
        .select(`
          *,
          training_modules(title, description)
        `)
        .eq("id", assignmentId)
        .eq("employee_id", learnerId)
        .single();

      if (assignmentError) {
        throw new Error("Training assignment not found or access denied.");
      }

      const { data: learnerData, error: learnerError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", learnerId)
        .single();

      if (learnerError) {
        throw new Error("Learner not found.");
      }

      setAssignment(assignmentData);
      setLearner(learnerData);
      setEmail(learnerData.email);
      
    } catch (error: any) {
      console.error("Error verifying assignment:", error);
      setError(error.message || "Failed to verify training assignment.");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learner || !assignment) return;

    setLoading(true);
    setError("");

    try {
      // Verify the email matches the learner's email
      if (email.toLowerCase() !== learner.email.toLowerCase()) {
        throw new Error("Email address does not match the assigned learner.");
      }

      toast({
        title: "Access Granted",
        description: "Starting your training session...",
        duration: 1000,
      });

      // Redirect to the learner portal with the specific assignment
      navigate(`/learner/${learner.id}?assignment=${assignment.id}`);
      
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Failed to start training session.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-white">Verifying training assignment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
            <Logo size="sm" />
          </div>
          <CardTitle className="text-white text-xl">Training Access</CardTitle>
          {assignment && (
            <div className="text-center mt-4 p-4 bg-white/10 rounded-lg">
              <h3 className="text-white font-semibold">{assignment.training_modules?.title}</h3>
              {assignment.training_modules?.description && (
                <p className="text-gray-300 text-sm mt-2">{assignment.training_modules.description}</p>
              )}
              {assignment.priority && (
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    assignment.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                    assignment.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {assignment.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {error ? (
            <Alert className="mb-4 bg-red-500/20 border-red-500/50">
              <AlertCircle className="h-4 w-4 text-red-300" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Confirm your email to access training
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Start Training"}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Having trouble accessing your training? Contact your administrator for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}