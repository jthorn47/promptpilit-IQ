import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, GripVertical } from 'lucide-react';
import type { DocumentSection } from '@/types/document-builder';

interface DocumentSectionsManagerProps {
  sections: DocumentSection[];
  activeSection: string | null;
  onSectionSelect: (sectionId: string) => void;
  onSectionUpdate: (sections: DocumentSection[]) => void;
  onToggleLock: (sectionId: string) => void;
}

export const DocumentSectionsManager = ({ 
  sections, 
  activeSection, 
  onSectionSelect, 
  onToggleLock 
}: DocumentSectionsManagerProps) => {
  return (
    <div className="space-y-1">
      {sections.map((section) => (
        <div
          key={section.id}
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${
            activeSection === section.id ? 'bg-primary/10' : ''
          }`}
          onClick={() => onSectionSelect(section.id)}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 text-sm">{section.section_title}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(section.id);
            }}
            className="h-6 w-6 p-0"
          >
            {section.is_locked ? 
              <Lock className="h-3 w-3" /> : 
              <Unlock className="h-3 w-3" />
            }
          </Button>
        </div>
      ))}
    </div>
  );
};