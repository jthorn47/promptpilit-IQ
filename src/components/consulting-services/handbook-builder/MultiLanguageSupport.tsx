import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Languages, 
  Volume2, 
  FileText, 
  Download, 
  Play, 
  Pause,
  Settings,
  Check,
  AlertCircle
} from 'lucide-react';

interface MultiLanguageSupportProps {
  selectedLanguages: string[];
  onLanguageChange: (languages: string[]) => void;
  content: any;
  onContentUpdate: (content: any) => void;
}

export const MultiLanguageSupport = ({ 
  selectedLanguages, 
  onLanguageChange, 
  content, 
  onContentUpdate 
}: MultiLanguageSupportProps) => {
  const [activeLanguage, setActiveLanguage] = useState<string>('en');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<Record<string, 'complete' | 'partial' | 'missing'>>({});

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' }
  ];

  const handleLanguageToggle = (languageCode: string) => {
    const newLanguages = selectedLanguages.includes(languageCode)
      ? selectedLanguages.filter(lang => lang !== languageCode)
      : [...selectedLanguages, languageCode];
    
    onLanguageChange(newLanguages);
  };

  const handleAutoTranslate = async (fromLanguage: string, toLanguage: string) => {
    setTranslationStatus(prev => ({ ...prev, [toLanguage]: 'partial' }));
    
    // Mock auto-translation - in production, integrate with Google Translate API or similar
    setTimeout(() => {
      setTranslationStatus(prev => ({ ...prev, [toLanguage]: 'complete' }));
    }, 2000);
  };

  const renderLanguageTab = (language: any) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{language.flag}</span>
          <div>
            <h3 className="font-semibold">{language.name}</h3>
            <p className="text-sm text-muted-foreground">{language.native}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {translationStatus[language.code] === 'complete' && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
          {translationStatus[language.code] === 'partial' && (
            <Badge variant="secondary">
              <Settings className="h-3 w-3 mr-1" />
              In Progress
            </Badge>
          )}
          {translationStatus[language.code] === 'missing' && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Missing
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Title</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={2}
              placeholder={`Enter title in ${language.native}`}
              value={content[language.code]?.title || ''}
              onChange={(e) => {
                onContentUpdate({
                  ...content,
                  [language.code]: {
                    ...content[language.code],
                    title: e.target.value
                  }
                });
              }}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={2}
              placeholder={`Enter company info in ${language.native}`}
              value={content[language.code]?.companyInfo || ''}
              onChange={(e) => {
                onContentUpdate({
                  ...content,
                  [language.code]: {
                    ...content[language.code],
                    companyInfo: e.target.value
                  }
                });
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Safety Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={6}
            placeholder={`Enter safety instructions in ${language.native}`}
            value={content[language.code]?.safetyInstructions || ''}
            onChange={(e) => {
              onContentUpdate({
                ...content,
                [language.code]: {
                  ...content[language.code],
                  safetyInstructions: e.target.value
                }
              });
            }}
          />
        </CardContent>
      </Card>
      
      {language.code !== 'en' && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleAutoTranslate('en', language.code)}
            disabled={translationStatus[language.code] === 'partial'}
          >
            <Languages className="h-4 w-4 mr-2" />
            Auto-translate from English
          </Button>
          
          <Button variant="outline" size="sm">
            <Volume2 className="h-4 w-4 mr-2" />
            Text-to-Speech
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Multi-Language Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-translate">Enable Auto-Translation</Label>
              <Switch
                id="auto-translate"
                checked={autoTranslate}
                onCheckedChange={setAutoTranslate}
              />
            </div>
            
            {autoTranslate && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Auto-translation is enabled. Content will be automatically translated when you switch languages.
                  Please review all translations for accuracy.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableLanguages.map((language) => (
              <div
                key={language.code}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedLanguages.includes(language.code)
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground'
                }`}
                onClick={() => handleLanguageToggle(language.code)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <div className="font-medium text-sm">{language.name}</div>
                    <div className="text-xs text-muted-foreground">{language.native}</div>
                  </div>
                </div>
                {selectedLanguages.includes(language.code) && (
                  <Check className="h-4 w-4 text-primary mt-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedLanguages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Content Translation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
              <TabsList className="grid w-full grid-cols-auto">
                {selectedLanguages.map((langCode) => {
                  const language = availableLanguages.find(l => l.code === langCode);
                  return (
                    <TabsTrigger key={langCode} value={langCode} className="flex items-center gap-2">
                      <span>{language?.flag}</span>
                      <span>{language?.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {selectedLanguages.map((langCode) => {
                const language = availableLanguages.find(l => l.code === langCode);
                return (
                  <TabsContent key={langCode} value={langCode} className="mt-6">
                    {language && renderLanguageTab(language)}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Export Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF (Recommended)</SelectItem>
                  <SelectItem value="docx">Word Document</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="combined">All Languages Combined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Include Audio</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex gap-2">
              <Button className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download All Languages
              </Button>
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Preview Combined
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};