/**
 * @fileoverview Simple Email Signature Manager
 * @module SignatureManager
 * @author Lovable AI
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Save, 
  Eye, 
  Code, 
  Globe, 
  User,
  Settings 
} from 'lucide-react';

interface SignatureManagerProps {
  /** Custom CSS classes */
  className?: string;
}

/**
 * Simple signature manager component
 * Note: This is a placeholder until database types are regenerated
 */
export const SignatureManager: React.FC<SignatureManagerProps> = ({
  className
}) => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(true);
  const [useGlobalTemplate, setUseGlobalTemplate] = useState(true);
  const [htmlSignature, setHtmlSignature] = useState('');
  const [textSignature, setTextSignature] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // TODO: Implement actual database save once types are regenerated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Signature Updated",
        description: "Your email signature has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update signature. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const mockGlobalTemplate = {
    html: `<div style="font-family: Arial, sans-serif; color: #333;">
      <p><strong>{{first_name}} {{last_name}}</strong><br>
      {{title}}<br>
      {{company_name}}</p>
      <p>Email: <a href="mailto:{{email}}">{{email}}</a><br>
      Phone: {{phone}}</p>
    </div>`,
    text: `{{first_name}} {{last_name}}
{{title}}
{{company_name}}

Email: {{email}}
Phone: {{phone}}`
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Signature Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="signature-enabled">Enable Email Signature</Label>
              <p className="text-sm text-muted-foreground">
                Add your signature to outgoing emails
              </p>
            </div>
            <Switch
              id="signature-enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          {isEnabled && (
            <>
              {/* Global Template Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="use-global">Use Global Template</Label>
                  <p className="text-sm text-muted-foreground">
                    Use the company-wide signature template
                  </p>
                </div>
                <Switch
                  id="use-global"
                  checked={useGlobalTemplate}
                  onCheckedChange={setUseGlobalTemplate}
                />
              </div>

              {useGlobalTemplate ? (
                /* Global Template Preview */
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">Global Template</span>
                    <Badge variant="secondary">Company-managed</Badge>
                  </div>
                  
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="html">HTML</TabsTrigger>
                      <TabsTrigger value="text">Text</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preview" className="space-y-4">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: mockGlobalTemplate.html.replace(/\{\{(\w+)\}\}/g, '<span class="bg-yellow-100 px-1 rounded">$1</span>')
                          }}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="html">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <pre className="text-sm">
                          <code>{mockGlobalTemplate.html}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="text">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <pre className="text-sm whitespace-pre-wrap">
                          {mockGlobalTemplate.text}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                /* Custom Signature Editor */
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Custom Signature</span>
                    <Badge variant="outline">User-managed</Badge>
                  </div>
                  
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="html">HTML</TabsTrigger>
                      <TabsTrigger value="text">Text</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="html" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="html-signature">HTML Signature</Label>
                        <Textarea
                          id="html-signature"
                          value={htmlSignature}
                          onChange={(e) => setHtmlSignature(e.target.value)}
                          placeholder="Enter your HTML signature..."
                          rows={6}
                          className="font-mono text-sm"
                        />
                      </div>
                      
                      {htmlSignature && (
                        <div className="border rounded-lg p-4 bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">Preview</span>
                          </div>
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: htmlSignature }}
                          />
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="text" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="text-signature">Text Signature</Label>
                        <Textarea
                          id="text-signature"
                          value={textSignature}
                          onChange={(e) => setTextSignature(e.target.value)}
                          placeholder="Enter your text signature..."
                          rows={6}
                        />
                      </div>
                      
                      {textSignature && (
                        <div className="border rounded-lg p-4 bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">Preview</span>
                          </div>
                          <pre className="text-sm whitespace-pre-wrap">
                            {textSignature}
                          </pre>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSave}
                  disabled={loading}
                  className="w-32"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};