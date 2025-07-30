import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  CheckSquare, 
  Calendar, 
  UserCheck 
} from 'lucide-react';

export type ActionType = 'task' | 'calendar' | 'approval';

interface EmailActionDropdownProps {
  onAction: (action: ActionType) => void;
  className?: string;
}

export function EmailActionDropdown({ onAction, className }: EmailActionDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleAction = (action: ActionType) => {
    onAction(action);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleAction('task')}
          className="cursor-pointer"
        >
          <CheckSquare className="w-4 h-4 mr-2" />
          Turn into Task
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction('calendar')}
          className="cursor-pointer"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction('approval')}
          className="cursor-pointer"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Mark for Approval
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}