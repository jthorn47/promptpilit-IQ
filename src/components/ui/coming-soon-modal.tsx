import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Rocket, Zap } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  description?: string;
  expectedRelease?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  featureName,
  description = "This feature is currently under development and will be available soon.",
  expectedRelease = "Q2 2024"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {featureName}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Coming Soon</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Expected: {expectedRelease}</span>
            </Badge>
          </div>
          
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground text-center">
              Stay tuned for updates! We're working hard to bring you this exciting new feature.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={onClose} className="w-full">
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};