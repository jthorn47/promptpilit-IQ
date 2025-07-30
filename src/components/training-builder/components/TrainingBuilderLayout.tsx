import { Button } from "@/components/ui/button";
import { X, FileText } from "lucide-react";

interface TrainingBuilderLayoutProps {
  moduleName: string;
  lastSaved: string;
  onClose: () => void;
  onBackToIntroduction?: () => void;
  showBackButton?: boolean;
  extraHeaderActions?: React.ReactNode;
  children: React.ReactNode;
}

export const TrainingBuilderLayout = ({
  moduleName,
  lastSaved,
  onClose,
  onBackToIntroduction,
  showBackButton = false,
  extraHeaderActions,
  children,
}: TrainingBuilderLayoutProps) => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close Builder
          </Button>
          <h1 className="text-2xl font-bold">{moduleName}</h1>
          <div className="flex items-center gap-2">
            {extraHeaderActions}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable with proper height */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};