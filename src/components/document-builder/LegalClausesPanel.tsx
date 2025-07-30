import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LegalClause } from '@/types/document-builder';

interface LegalClausesPanelProps {
  clauses: LegalClause[];
  onClauseSelect: (clause: LegalClause) => void;
}

export const LegalClausesPanel = ({ clauses, onClauseSelect }: LegalClausesPanelProps) => {
  return (
    <ScrollArea className="h-48">
      <div className="space-y-2">
        {clauses.map((clause) => (
          <Button
            key={clause.id}
            variant="ghost"
            size="sm"
            onClick={() => onClauseSelect(clause)}
            className="w-full justify-start text-xs h-auto p-2"
          >
            <div className="text-left">
              <div className="font-medium">{clause.title}</div>
              <div className="text-muted-foreground truncate">{clause.content}</div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};