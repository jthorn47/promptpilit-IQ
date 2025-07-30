import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { StartConversationModal } from '@/components/hali/StartConversationModal';

interface QuickSMSButtonProps {
  pulseCase: {
    id: string;
    employee_name?: string;
    employee_phone?: string;
    client_id?: string;
    client_name?: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const QuickSMSButton = ({ 
  pulseCase, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: QuickSMSButtonProps) => {
  const [showStartConversation, setShowStartConversation] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowStartConversation(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <MessageSquare className="h-4 w-4" />
        Start SMS
      </Button>

      <StartConversationModal
        isOpen={showStartConversation}
        onClose={() => setShowStartConversation(false)}
        pulseCase={pulseCase}
      />
    </>
  );
};