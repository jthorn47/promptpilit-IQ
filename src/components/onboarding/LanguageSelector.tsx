import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageSelectorProps {
  language: 'en' | 'es';
  onLanguageChange: (language: 'en' | 'es') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
}) => {
  const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    es: { name: 'Español', flag: '🇪🇸' }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span>{languages[language].flag}</span>
          <span>{languages[language].name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onLanguageChange('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇺🇸</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onLanguageChange('es')}
          className={language === 'es' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇪🇸</span>
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;