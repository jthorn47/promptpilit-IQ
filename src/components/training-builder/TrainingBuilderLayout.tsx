import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Eye, HelpCircle, CheckCircle } from "lucide-react";

interface TrainingBuilderLayoutProps {
  children: ReactNode;
  moduleName: string;
  currentSceneIndex: number;
  totalScenes: number;
  isPreviewMode: boolean;
  showQuestions: boolean;
  isCompletionScene: boolean;
  onClose: () => void;
  onTogglePreview: () => void;
  onToggleQuestions: () => void;
  onMarkAsLast: () => void;
}

export const TrainingBuilderLayout = ({
  children,
  moduleName,
  currentSceneIndex,
  totalScenes,
  isPreviewMode,
  showQuestions,
  isCompletionScene,
  onClose,
  onTogglePreview,
  onToggleQuestions,
  onMarkAsLast,
}: TrainingBuilderLayoutProps) => {
  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Close Builder
              </Button>
              <h1 className="text-2xl font-bold">{moduleName}</h1>
              {totalScenes > 0 && (
                <Badge variant="outline">
                  Scene {currentSceneIndex + 1} of {totalScenes}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onTogglePreview}
                className={isPreviewMode ? "bg-primary text-primary-foreground" : ""}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? "Exit Preview" : "Learner View"}
              </Button>
              {!isPreviewMode && (
                <>
                  <Button
                    variant="outline"
                    onClick={onToggleQuestions}
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Questions
                  </Button>
                  <Button
                    variant={isCompletionScene ? "default" : "outline"}
                    onClick={onMarkAsLast}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Last
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};