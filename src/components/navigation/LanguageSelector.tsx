import React from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/modules/HaaLO.Shared/hooks/useLocalStorage';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

export const LanguageSelector: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<string>('preferred-language', 'en');

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Here you would typically integrate with your i18n library
    // For now, we'll just store the preference
    console.log('Language changed to:', languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline text-sm">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
          <span className="sm:hidden text-sm">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              selectedLanguage === language.code ? 'bg-muted' : ''
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};