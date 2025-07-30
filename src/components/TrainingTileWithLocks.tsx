import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, CheckCircle, BookOpen, Users, Clock, Plus } from "lucide-react";
import { useTrainingAccess } from "@/hooks/useTrainingAccess";
import { SeatUpsellModal } from "./SeatUpsellModal";

interface TrainingTileWithLocksProps {
  training: {
    id: string;
    title: string;
    description: string;
    duration?: string;
    assignedEmployees?: number;
    completedEmployees?: number;
  };
  onAssignTraining?: (trainingId: string) => void;
  onViewDetails?: (trainingId: string) => void;
  className?: string;
}

export const TrainingTileWithLocks = ({
  training,
  onAssignTraining,
  onViewDetails,
  className = ""
}: TrainingTileWithLocksProps) => {
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const { checkTrainingAccess, logAccessAttempt, refetch } = useTrainingAccess();
  
  const accessInfo = checkTrainingAccess(training.id);
  const isLocked = !accessInfo.hasAccess;

  const handleTrainingAction = async (action: 'assign' | 'view') => {
    if (isLocked) {
      // Log the access attempt
      await logAccessAttempt(training.id, false, accessInfo.reason);
      
      // Show upsell modal if additional seats can be purchased
      if (accessInfo.canPurchaseAdditionalSeat) {
        setShowUpsellModal(true);
      }
    } else {
      // Log successful access
      await logAccessAttempt(training.id, true);
      
      if (action === 'assign' && onAssignTraining) {
        onAssignTraining(training.id);
      } else if (action === 'view' && onViewDetails) {
        onViewDetails(training.id);
      }
    }
  };

  const handleUpsellSuccess = () => {
    refetch();
    setShowUpsellModal(false);
    // Automatically proceed with the action after purchase
    if (onAssignTraining) {
      onAssignTraining(training.id);
    }
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${isLocked ? 'opacity-75' : ''} ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${isLocked ? 'bg-gray-100' : 'bg-blue-100'}`}>
                {isLocked ? (
                  <Lock className="h-5 w-5 text-gray-500" />
                ) : (
                  <BookOpen className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight">{training.title}</CardTitle>
                {training.duration && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {training.duration}
                  </div>
                )}
              </div>
            </div>
            
            {isLocked ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a seat to access this course</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Badge variant="default" className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Unlocked
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {training.description}
          </p>

          {/* Progress Info (if unlocked) */}
          {!isLocked && training.assignedEmployees !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {training.assignedEmployees} assigned
              </div>
              {training.completedEmployees !== undefined && (
                <div className="text-green-600">
                  {training.completedEmployees} completed
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {isLocked ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleTrainingAction('assign')}
                      disabled={!accessInfo.canPurchaseAdditionalSeat}
                    >
                      {accessInfo.canPurchaseAdditionalSeat ? (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Seat to Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {accessInfo.canPurchaseAdditionalSeat 
                        ? `Purchase additional seat for $${accessInfo.seatPrice}`
                        : "Additional seats not available for this plan"
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTrainingAction('view')}
                >
                  View Details
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleTrainingAction('assign')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upsell Modal */}
      <SeatUpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        trainingTitle={training.title}
        trainingDescription={training.description}
        seatPrice={accessInfo.seatPrice || 0}
        onPurchaseSuccess={handleUpsellSuccess}
      />
    </>
  );
};