import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import type { Document, DocumentSection } from '@/types/document-builder';

interface DocumentPreviewProps {
  document: Document | null;
  sections: DocumentSection[];
  dynamicFieldValues: Record<string, any>;
  onClose: () => void;
}

export const DocumentPreview = ({ document, sections, dynamicFieldValues, onClose }: DocumentPreviewProps) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Document Preview: {document?.title}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-white p-8 border">
          <div className="max-w-none prose">
            <h1>{document?.title}</h1>
            {sections.map((section) => (
              <div key={section.id} className="mb-6">
                <h2>{section.section_title}</h2>
                <div dangerouslySetInnerHTML={{ 
                  __html: JSON.stringify(section.section_content) 
                }} />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};