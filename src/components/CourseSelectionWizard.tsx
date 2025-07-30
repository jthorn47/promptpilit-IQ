import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useCourseSelection } from "@/hooks/useCourseSelection";
import { useNavigate } from "react-router-dom";

interface CourseSelectionWizardProps {
  onComplete?: () => void;
  redirectTo?: string;
}

export const CourseSelectionWizard = ({ onComplete, redirectTo = "/dashboard" }: CourseSelectionWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  
  const {
    availableCourses,
    selectedCourseIds,
    companyAllocation,
    availableSlots,
    hasCompanyPlan,
    loading,
    submitting,
    toggleCourseSelection,
    submitCourseSelection
  } = useCourseSelection();

  const steps = ["Select Courses", "Confirm Selection"];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const success = await submitCourseSelection();
    if (success) {
      if (onComplete) {
        onComplete();
      } else {
        navigate(redirectTo);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading course selection...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasCompanyPlan) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No Active Plan</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Seat-Based Plan Found</h3>
            <p className="text-muted-foreground mb-4">
              You need an active seat-based plan to access course selection.
            </p>
            <Button onClick={() => navigate("/pricing")}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Course Selection</h1>
        <p className="text-muted-foreground">
          You have {availableSlots} seat{availableSlots !== 1 ? 's' : ''} available. Select up to {availableSlots} training{availableSlots !== 1 ? 's' : ''} to unlock for your team.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {steps.map((step, index) => (
            <span 
              key={step}
              className={`${index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {step}
            </span>
          ))}
        </div>
        <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{steps[currentStep]}</CardTitle>
            <Badge variant="outline">
              {selectedCourseIds.length} of {availableSlots} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <div className="space-y-4">
              {availableCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
                  <p className="text-muted-foreground">
                    No courses are currently available for licensing.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {availableCourses.map((course) => {
                    const isSelected = selectedCourseIds.includes(course.id);
                    const canSelect = selectedCourseIds.length < availableSlots || isSelected;
                    
                    return (
                      <Card 
                        key={course.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        } ${!canSelect ? 'opacity-50' : ''}`}
                        onClick={() => canSelect && toggleCourseSelection(course.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Checkbox 
                              checked={isSelected}
                              disabled={!canSelect}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <h3 className="font-medium leading-none">{course.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {course.description}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {course.license_category}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">Ready to Unlock Courses</h3>
                <p className="text-muted-foreground">
                  You've selected {selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? 's' : ''} to unlock for your team.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Selected Courses:</h4>
                {selectedCourseIds.map((courseId) => {
                  const course = availableCourses.find(c => c.id === courseId);
                  return course ? (
                    <div key={courseId} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <h5 className="font-medium">{course.title}</h5>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Selected courses will be unlocked for your team</li>
                  <li>• Company admins can assign these courses to employees</li>
                  <li>• You can purchase additional seats later if needed</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext}
            disabled={selectedCourseIds.length === 0}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleComplete}
            disabled={submitting || selectedCourseIds.length === 0}
          >
            {submitting ? "Unlocking..." : "Unlock Courses"}
          </Button>
        )}
      </div>
    </div>
  );
};