import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useFocusTrap, useAnnouncement } from '@/hooks/useKeyboardNavigation';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const announce = useAnnouncement();

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      announce(`Dialog opened: ${title}`, 'assertive');
    } else if (previousActiveElement.current) {
      // Return focus to the previously focused element when modal closes
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen, title, announce]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        announce('Dialog closed', 'polite');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose, announce]);

  // Focus trap
  useFocusTrap(isOpen);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${sizeClasses[size]} ${className}`}
        onPointerDownOutside={closeOnOverlayClick ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle id="modal-title" className="text-lg font-semibold">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {description && (
            <DialogDescription id="modal-description" className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Confirmation modal with accessible focus management
interface AccessibleConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const AccessibleConfirmModal: React.FC<AccessibleConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const announce = useAnnouncement();

  // Focus the confirm button when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    announce('Action confirmed', 'polite');
  };

  const handleCancel = () => {
    onClose();
    announce('Action cancelled', 'polite');
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      description={message}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm">{message}</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            className="min-w-[80px]"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </AccessibleModal>
  );
};