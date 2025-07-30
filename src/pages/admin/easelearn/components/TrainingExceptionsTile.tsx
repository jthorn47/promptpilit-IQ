import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users, BookOpen, Settings, ArrowRight } from "lucide-react";
import { useTrainingExceptions } from "../hooks/useTrainingExceptions";
import { useNavigate } from "react-router-dom";

export const TrainingExceptionsTile = () => {
  const { data: exceptions, isLoading } = useTrainingExceptions();
  const navigate = useNavigate();

  const exceptionTypes = [
    {
      key: 'no_learners',
      title: "Haven't Added Learners",
      description: "Clients with zero employees in their system",
      count: exceptions?.noLearners?.length || 0,
      icon: Users,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-200',
      tooltip: 'Clients who need to add employees to start training. Click to help them set up learners.',
      action: () => navigate('/admin/companies?filter=no_learners')
    },
    {
      key: 'no_modules_assigned',
      title: "Haven't Assigned Modules",
      description: "Clients without any training assignments",
      count: exceptions?.noModulesAssigned?.length || 0,
      icon: BookOpen,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-200',
      tooltip: 'Clients who have learners but no training modules assigned. Click to set up training paths.',
      action: () => navigate('/admin/companies?filter=no_modules')
    },
    {
      key: 'incomplete_onboarding',
      title: "Haven't Completed Onboarding",
      description: "Clients stuck in onboarding process",
      count: exceptions?.incompleteOnboarding?.length || 0,
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-200',
      tooltip: 'Clients who started but didn\'t finish the onboarding wizard. Click to resume their setup.',
      action: () => navigate('/admin/companies?filter=incomplete_onboarding')
    }
  ];

  const totalExceptions = exceptionTypes.reduce((sum, type) => sum + type.count, 0);

  const handleViewDetails = (exceptionType: string) => {
    console.log('View details for:', exceptionType);
    // Navigate to filtered list based on exception type
  };

  const handleQuickFix = (exceptionType: string) => {
    console.log('Quick fix for:', exceptionType);
    // Implement quick fix actions
  };

  return (
    <Card className="shadow-elegant border-0 bg-gradient-to-br from-amber-50/30 via-card to-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Training Status Exceptions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Clients requiring immediate attention
              </p>
            </div>
          </div>
          <Badge 
            variant={totalExceptions > 0 ? "destructive" : "outline"} 
            className={totalExceptions > 0 ? "bg-red-500/10 text-red-700 border-red-200" : ""}
          >
            {totalExceptions} Issues
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : totalExceptions > 0 ? (
          <div className="space-y-3">
            {exceptionTypes.map((exception) => (
              <div
                key={exception.key}
                className={`group p-4 rounded-xl border-2 transition-all duration-200 ${exception.bgColor} ${exception.borderColor} hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 ${exception.bgColor} rounded-lg`}>
                      <exception.icon className={`h-4 w-4 ${exception.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{exception.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {exception.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${exception.bgColor} ${exception.color} border-current`}
                    >
                      {exception.count}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exception.action()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {exception.count > 0 && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-current/10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(exception.key)}
                      className="text-xs"
                    >
                      View List
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickFix(exception.key)}
                      className="text-xs"
                    >
                      Quick Fix
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Alert className="border-emerald-200 bg-emerald-50/50">
            <AlertTriangle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">
              All clients are properly configured! No training exceptions found.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Summary Actions */}
        {totalExceptions > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/clients?filter=all_exceptions')}
            >
              View All Issues
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => console.log('Export exceptions report')}
            >
              Export Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};