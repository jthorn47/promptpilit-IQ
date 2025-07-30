import React, { useState, useCallback } from 'react';
import { Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IQBarModal } from './IQBarModal';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export const IQBar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Register Cmd+K / Ctrl+K shortcut
  useKeyboardShortcut('cmd+k', openModal);
  useKeyboardShortcut('ctrl+k', openModal);

  const getShortcutText = () => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return isMac ? 'Cmd+K' : 'Ctrl+K';
  };

  return (
    <>
      {/* IQ Bar Trigger */}
      <div className="relative min-w-[300px] max-w-md">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground h-9 px-3 font-normal"
          onClick={openModal}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left">Type to search or press {getShortcutText()}</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">{getShortcutText()}</span>
          </kbd>
        </Button>
      </div>

      {/* IQ Bar Modal */}
      <IQBarModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};