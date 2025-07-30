import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

interface UploadedFileDisplayProps {
  fileName: string;
  onRemove: () => void;
}

export const UploadedFileDisplay = ({ fileName, onRemove }: UploadedFileDisplayProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-700">
          {fileName}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-600 hover:text-red-700"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};