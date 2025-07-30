import { CoreWPVTrainingBuilder } from "./training-builder/CoreWPVTrainingBuilder";
import { EnhancedTrainingBuilder } from "./training-builder/EnhancedTrainingBuilder";

interface TrainingBuilderProps {
  moduleId: string;
  moduleName: string;
  onClose: () => void;
  isNewModule?: boolean;
  clientId?: string;
}

export const TrainingBuilder = (props: TrainingBuilderProps) => {
  // Use dedicated Core WPV builder for WPV training, enhanced builder for everything else
  if (props.moduleName === "Core WPV Training" || props.moduleName.includes("WPV")) {
    return <CoreWPVTrainingBuilder {...props} />;
  }
  
  return <EnhancedTrainingBuilder {...props} />;
};