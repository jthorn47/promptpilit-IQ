import { Button } from "@/components/ui/button";

interface TrainingActionBarProps {
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

export const TrainingActionBar = ({
  onSaveDraft,
  onPreview,
  onPublish,
}: TrainingActionBarProps) => {
  return (
    <div className="border-t p-4 bg-background">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onSaveDraft}>
          Save Draft
        </Button>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={onPreview}>
            Preview Training
          </Button>
          <Button 
            onClick={onPublish} 
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};