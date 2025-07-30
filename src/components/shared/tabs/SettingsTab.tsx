import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Key, 
  Users, 
  Database,
  Globe,
  Lock,
  AlertTriangle
} from "lucide-react";

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  settings: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'switch' | 'button' | 'badge' | 'text';
  value?: any;
  enabled?: boolean;
  dangerous?: boolean;
}

interface SettingsTabProps {
  sections: SettingSection[];
  onSettingChange?: (sectionId: string, settingId: string, value: any) => void;
  onSettingAction?: (sectionId: string, settingId: string) => void;
  readonly?: boolean;
}

export const SettingsTab = ({ 
  sections, 
  onSettingChange, 
  onSettingAction,
  readonly = false 
}: SettingsTabProps) => {
  const getSectionIcon = (iconName: string) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (iconName) {
      case 'shield':
        return <Shield {...iconProps} />;
      case 'bell':
        return <Bell {...iconProps} />;
      case 'palette':
        return <Palette {...iconProps} />;
      case 'key':
        return <Key {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'database':
        return <Database {...iconProps} />;
      case 'globe':
        return <Globe {...iconProps} />;
      case 'lock':
        return <Lock {...iconProps} />;
      default:
        return <Settings {...iconProps} />;
    }
  };

  const renderSettingItem = (section: SettingSection, setting: SettingItem) => {
    switch (setting.type) {
      case 'switch':
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{setting.label}</p>
              {setting.description && (
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              )}
            </div>
            <Switch
              checked={setting.enabled || false}
              disabled={readonly}
              onCheckedChange={(checked) => 
                onSettingChange?.(section.id, setting.id, checked)
              }
            />
          </div>
        );
        
      case 'button':
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{setting.label}</p>
              {setting.description && (
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              )}
            </div>
            <Button
              variant={setting.dangerous ? "destructive" : "outline"}
              size="sm"
              disabled={readonly}
              onClick={() => onSettingAction?.(section.id, setting.id)}
            >
              {setting.dangerous && <AlertTriangle className="h-4 w-4 mr-2" />}
              {setting.value || 'Action'}
            </Button>
          </div>
        );
        
      case 'badge':
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{setting.label}</p>
              {setting.description && (
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              )}
            </div>
            <Badge variant={setting.dangerous ? "destructive" : "secondary"}>
              {setting.value}
            </Badge>
          </div>
        );
        
      case 'text':
        return (
          <div>
            <p className="font-medium">{setting.label}</p>
            {setting.description && (
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            )}
            {setting.value && (
              <p className="text-sm font-mono mt-1 p-2 bg-muted rounded">
                {setting.value}
              </p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getSectionIcon(section.icon)}
              {section.title}
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {section.settings.map((setting) => (
                <div key={setting.id}>
                  {renderSettingItem(section, setting)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {sections.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </CardTitle>
            <CardDescription>Configuration options for this organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No settings available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};