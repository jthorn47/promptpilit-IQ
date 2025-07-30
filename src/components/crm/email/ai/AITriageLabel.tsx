import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, DollarSign, Mail, X } from 'lucide-react';

export type TriageType = 'needs-reply' | 'fyi' | 'transactional' | 'newsletter' | 'ignore';

interface AITriageLabelProps {
  type: TriageType;
  className?: string;
}

const triageConfig = {
  'needs-reply': {
    label: 'Needs Reply',
    icon: AlertCircle,
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  },
  'fyi': {
    label: 'Just FYI',
    icon: Info,
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
  },
  'transactional': {
    label: 'Transactional',
    icon: DollarSign,
    variant: 'outline' as const,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
  },
  'newsletter': {
    label: 'Newsletter',
    icon: Mail,
    variant: 'secondary' as const,
    className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
  },
  'ignore': {
    label: 'Ignore',
    icon: X,
    variant: 'outline' as const,
    className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
  }
};

export function AITriageLabel({ type, className }: AITriageLabelProps) {
  const config = triageConfig[type];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} text-xs font-medium px-2 py-1 flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}