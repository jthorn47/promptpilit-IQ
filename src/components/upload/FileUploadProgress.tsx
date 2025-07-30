import React from 'react';

interface FileUploadProgressProps {
  progress: number;
}

export const FileUploadProgress = ({ progress }: FileUploadProgressProps) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};