import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Users } from 'lucide-react';
import { EmailComposerModal } from './EmailComposerModal';
import { EmailContext } from '@/hooks/useContextualEmailService';

interface ProfileEmailButtonProps {
  mode: EmailContext;
  companyId?: string;
  contactId?: string;
  prefilledRecipient?: string;
  prefilledSubject?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
}

export const ProfileEmailButton = ({
  mode,
  companyId,
  contactId,
  prefilledRecipient,
  prefilledSubject,
  className,
  variant = 'outline',
  size = 'default',
  disabled = false
}: ProfileEmailButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    // Validate required props based on mode
    if (mode === 'company' && !companyId) {
      console.error('Company ID is required for company mode');
      return;
    }
    if (mode === 'contact' && !contactId) {
      console.error('Contact ID is required for contact mode');
      return;
    }
    if (mode === 'contact' && !prefilledRecipient) {
      console.error('Prefilled recipient is required for contact mode');
      return;
    }

    setModalOpen(true);
  };

  const getButtonText = () => {
    switch (mode) {
      case 'company':
        return 'Send Email';
      case 'contact':
        return 'Send Email';
      case 'direct':
        return 'Compose Email';
      default:
        return 'Send Email';
    }
  };

  const getButtonIcon = () => {
    return mode === 'company' ? Users : Mail;
  };

  const Icon = getButtonIcon();

  // Don't render if required props are missing
  if ((mode === 'company' && !companyId) || 
      (mode === 'contact' && (!contactId || !prefilledRecipient))) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={disabled}
      >
        <Icon className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">{getButtonText()}</span>
        <span className="sm:hidden">{mode === 'direct' ? 'Email' : 'Send'}</span>
      </Button>

      <EmailComposerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        companyId={companyId}
        contactId={contactId}
        prefilledRecipient={prefilledRecipient}
        prefilledSubject={prefilledSubject}
      />
    </>
  );
};