import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Users, Settings, FileText, ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ReviewCycleData {
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  type: string;
  templateId: string;
  participants: string[];
  settings: {
    allowSelfReview: boolean;
    enablePeerReview: boolean;
    requireManagerApproval: boolean;
    sendReminders: boolean;
  };
}

export const ReviewCycleBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [reviewCycle, setReviewCycle] = useState<ReviewCycleData>({
    name: "",
    description: "",
    startDate: undefined,
    endDate: undefined,
    type: "",
    templateId: "",
    participants: [],
    settings: {
      allowSelfReview: true,
      enablePeerReview: false,
      requireManagerApproval: true,
      sendReminders: true,
    }
  });

  const steps = [
    { id: 1, title: "Basic Information", icon: FileText },
    { id: 2, title: "Timeline & Settings", icon: Settings },
    { id: 3, title: "Participants", icon: Users },
    { id: 4, title: "Review & Launch", icon: Save }
  ];

  const reviewTypes = [
    { value: "annual", label: "Annual Review" },
    { value: "quarterly", label: "Quarterly Review" },
    { value: "probation", label: "Probation Review" },
    { value: "promotion", label: "Promotion Review" },
    { value: "custom", label: "Custom Review" }
  ];

  const templates = [
    { id: "1", name: "Standard Performance Review", description: "Basic performance evaluation template" },
    { id: "2", name: "Leadership Assessment", description: "For management and senior roles" },
    { id: "3", name: "New Employee Review", description: "Probation and onboarding evaluation" }
  ];

  const mockEmployees = [
    { id: "1", name: "John Smith", role: "Software Engineer", department: "Engineering" },
    { id: "2", name: "Sarah Johnson", role: "Product Manager", department: "Product" },
    { id: "3", name: "Mike Davis", role: "Sales Manager", department: "Sales" },
    { id: "4", name: "Lisa Chen", role: "Designer", department: "Design" }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log("Saving review cycle:", reviewCycle);
    navigate("/admin/performance");
  };

  const toggleParticipant = (employeeId: string) => {
    setReviewCycle(prev => ({
      ...prev,
      participants: prev.participants.includes(employeeId)
        ? prev.participants.filter(id => id !== employeeId)
        : [...prev.participants, employeeId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary-muted/10 p-4 space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 blur-3xl" />
        <div className="relative bg-gradient-card rounded-2xl p-6 shadow-soft border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/admin/performance")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Create Review Cycle
                </h1>
                <p className="text-muted-foreground">
                  Set up a new performance evaluation cycle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isActive ? "border-primary bg-primary text-primary-foreground" :
                    isCompleted ? "border-green-500 bg-green-500 text-white" :
                    "border-muted-foreground/30 bg-background"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="ml-3">
                    <p className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-16 h-0.5 mx-4",
                      isCompleted ? "bg-green-500" : "bg-muted-foreground/30"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Basic Information</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Review Cycle Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Q4 2024 Performance Review"
                      value={reviewCycle.name}
                      onChange={(e) => setReviewCycle(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Review Type</Label>
                    <Select
                      value={reviewCycle.type}
                      onValueChange={(value) => setReviewCycle(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select review type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reviewTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose and goals of this review cycle..."
                    value={reviewCycle.description}
                    onChange={(e) => setReviewCycle(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <Label>Evaluation Template</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-muted/50",
                          reviewCycle.templateId === template.id ? "border-primary bg-primary/5" : ""
                        )}
                        onClick={() => setReviewCycle(prev => ({ ...prev, templateId: template.id }))}
                      >
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <CardTitle>Timeline & Settings</CardTitle>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reviewCycle.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reviewCycle.startDate ? format(reviewCycle.startDate, "PPP") : "Pick a start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={reviewCycle.startDate}
                        onSelect={(date) => setReviewCycle(prev => ({ ...prev, startDate: date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reviewCycle.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reviewCycle.endDate ? format(reviewCycle.endDate, "PPP") : "Pick an end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={reviewCycle.endDate}
                        onSelect={(date) => setReviewCycle(prev => ({ ...prev, endDate: date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Review Settings</Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowSelfReview"
                      checked={reviewCycle.settings.allowSelfReview}
                      onCheckedChange={(checked) => 
                        setReviewCycle(prev => ({
                          ...prev,
                          settings: { ...prev.settings, allowSelfReview: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="allowSelfReview">Allow self-review</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enablePeerReview"
                      checked={reviewCycle.settings.enablePeerReview}
                      onCheckedChange={(checked) => 
                        setReviewCycle(prev => ({
                          ...prev,
                          settings: { ...prev.settings, enablePeerReview: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="enablePeerReview">Enable peer reviews</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireManagerApproval"
                      checked={reviewCycle.settings.requireManagerApproval}
                      onCheckedChange={(checked) => 
                        setReviewCycle(prev => ({
                          ...prev,
                          settings: { ...prev.settings, requireManagerApproval: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="requireManagerApproval">Require manager approval</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendReminders"
                      checked={reviewCycle.settings.sendReminders}
                      onCheckedChange={(checked) => 
                        setReviewCycle(prev => ({
                          ...prev,
                          settings: { ...prev.settings, sendReminders: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="sendReminders">Send email reminders</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <CardTitle>Select Participants</CardTitle>
                <Badge variant="secondary">
                  {reviewCycle.participants.length} selected
                </Badge>
              </div>
              
              <div className="space-y-4">
                {mockEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
                      reviewCycle.participants.includes(employee.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                    onClick={() => toggleParticipant(employee.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={reviewCycle.participants.includes(employee.id)}
                        onChange={() => toggleParticipant(employee.id)}
                      />
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {employee.role} • {employee.department}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <CardTitle>Review & Launch</CardTitle>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{reviewCycle.name}</CardTitle>
                    <CardDescription>{reviewCycle.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {reviewTypes.find(t => t.value === reviewCycle.type)?.label}
                      </div>
                      <div>
                        <span className="font-medium">Template:</span> {templates.find(t => t.id === reviewCycle.templateId)?.name}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span> {reviewCycle.startDate ? format(reviewCycle.startDate, "PPP") : "Not set"}
                      </div>
                      <div>
                        <span className="font-medium">End Date:</span> {reviewCycle.endDate ? format(reviewCycle.endDate, "PPP") : "Not set"}
                      </div>
                      <div>
                        <span className="font-medium">Participants:</span> {reviewCycle.participants.length} employees
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
          Previous
        </Button>
        
        {currentStep < 4 ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSave} className="gradient-button">
            <Save className="w-4 h-4 mr-2" />
            Create Review Cycle
          </Button>
        )}
      </div>
    </div>
  );
};