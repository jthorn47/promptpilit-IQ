import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  HardHat, 
  AlertTriangle, 
  Users, 
  FileText, 
  Wrench,
  Building2,
  GripVertical,
  Eye,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Languages,
  Globe
} from 'lucide-react';

interface ContentBlock {
  id: string;
  type: 'text' | 'list' | 'checklist' | 'form' | 'image' | 'separator';
  title: string;
  content: any;
  isRequired: boolean;
  isEditable: boolean;
  languages: Record<string, any>;
  category: string;
  icon: React.ReactNode;
  description: string;
}

interface ModularContentBlocksProps {
  selectedBlocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
  language: 'en' | 'es' | 'bilingual';
  onLanguageChange: (language: 'en' | 'es' | 'bilingual') => void;
}

export const ModularContentBlocks = ({ 
  selectedBlocks, 
  onBlocksChange, 
  language, 
  onLanguageChange 
}: ModularContentBlocksProps) => {
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const availableBlocks: ContentBlock[] = [
    // Safety & PPE Blocks
    {
      id: 'ppe-requirements',
      type: 'checklist',
      title: 'Personal Protective Equipment Requirements',
      content: {
        items: [
          'Hard hat or safety helmet',
          'Safety glasses or goggles',
          'High-visibility clothing',
          'Steel-toed boots',
          'Work gloves',
          'Respiratory protection when required'
        ]
      },
      isRequired: true,
      isEditable: true,
      languages: {
        en: { 
          title: 'Personal Protective Equipment Requirements',
          items: [
            'Hard hat or safety helmet',
            'Safety glasses or goggles',
            'High-visibility clothing',
            'Steel-toed boots',
            'Work gloves',
            'Respiratory protection when required'
          ]
        },
        es: { 
          title: 'Requisitos de Equipo de Protección Personal',
          items: [
            'Casco o casco de seguridad',
            'Gafas de seguridad o gafas protectoras',
            'Ropa de alta visibilidad',
            'Botas con puntera de acero',
            'Guantes de trabajo',
            'Protección respiratoria cuando sea necesario'
          ]
        }
      },
      category: 'safety',
      icon: <Shield className="h-5 w-5" />,
      description: 'Required personal protective equipment for septic system work'
    },
    {
      id: 'hazard-assessment',
      type: 'text',
      title: 'Workplace Hazard Assessment',
      content: {
        text: 'Regular workplace hazard assessments must be conducted to identify potential safety risks and implement appropriate control measures.'
      },
      isRequired: true,
      isEditable: true,
      languages: {
        en: { 
          title: 'Workplace Hazard Assessment',
          text: 'Regular workplace hazard assessments must be conducted to identify potential safety risks and implement appropriate control measures.'
        },
        es: { 
          title: 'Evaluación de Riesgos en el Lugar de Trabajo',
          text: 'Se deben realizar evaluaciones regulares de los riesgos en el lugar de trabajo para identificar posibles riesgos de seguridad e implementar medidas de control apropiadas.'
        }
      },
      category: 'safety',
      icon: <AlertTriangle className="h-5 w-5" />,
      description: 'Assessment procedures for identifying workplace hazards'
    },
    {
      id: 'emergency-procedures',
      type: 'list',
      title: 'Emergency Response Procedures',
      content: {
        items: [
          'Emergency contact numbers',
          'Evacuation procedures',
          'First aid protocols',
          'Spill response procedures',
          'Fire safety procedures'
        ]
      },
      isRequired: true,
      isEditable: true,
      languages: {
        en: { 
          title: 'Emergency Response Procedures',
          items: [
            'Emergency contact numbers',
            'Evacuation procedures',
            'First aid protocols',
            'Spill response procedures',
            'Fire safety procedures'
          ]
        },
        es: { 
          title: 'Procedimientos de Respuesta de Emergencia',
          items: [
            'Números de contacto de emergencia',
            'Procedimientos de evacuación',
            'Protocolos de primeros auxilios',
            'Procedimientos de respuesta a derrames',
            'Procedimientos de seguridad contra incendios'
          ]
        }
      },
      category: 'emergency',
      icon: <AlertTriangle className="h-5 w-5" />,
      description: 'Emergency response and evacuation procedures'
    },
    // Septic-Specific Blocks
    {
      id: 'septic-inspection',
      type: 'form',
      title: 'Septic System Inspection Checklist',
      content: {
        fields: [
          { label: 'System Type', type: 'select', options: ['Conventional', 'Advanced', 'Lagoon'] },
          { label: 'Tank Condition', type: 'select', options: ['Good', 'Fair', 'Poor'] },
          { label: 'Liquid Level', type: 'text' },
          { label: 'Pump Function', type: 'select', options: ['Working', 'Not Working', 'N/A'] },
          { label: 'Notes', type: 'textarea' }
        ]
      },
      isRequired: false,
      isEditable: true,
      languages: {
        en: { 
          title: 'Septic System Inspection Checklist',
          fields: [
            { label: 'System Type', type: 'select', options: ['Conventional', 'Advanced', 'Lagoon'] },
            { label: 'Tank Condition', type: 'select', options: ['Good', 'Fair', 'Poor'] },
            { label: 'Liquid Level', type: 'text' },
            { label: 'Pump Function', type: 'select', options: ['Working', 'Not Working', 'N/A'] },
            { label: 'Notes', type: 'textarea' }
          ]
        },
        es: { 
          title: 'Lista de Verificación de Inspección del Sistema Séptico',
          fields: [
            { label: 'Tipo de Sistema', type: 'select', options: ['Convencional', 'Avanzado', 'Laguna'] },
            { label: 'Condición del Tanque', type: 'select', options: ['Bueno', 'Regular', 'Malo'] },
            { label: 'Nivel de Líquido', type: 'text' },
            { label: 'Función de la Bomba', type: 'select', options: ['Funcionando', 'No Funcionando', 'N/A'] },
            { label: 'Notas', type: 'textarea' }
          ]
        }
      },
      category: 'septic',
      icon: <Wrench className="h-5 w-5" />,
      description: 'Inspection checklist for septic system components'
    },
    {
      id: 'maintenance-schedule',
      type: 'text',
      title: 'Maintenance Schedule',
      content: {
        text: 'Regular maintenance schedules must be established and followed to ensure proper system operation and compliance with regulations.'
      },
      isRequired: false,
      isEditable: true,
      languages: {
        en: { 
          title: 'Maintenance Schedule',
          text: 'Regular maintenance schedules must be established and followed to ensure proper system operation and compliance with regulations.'
        },
        es: { 
          title: 'Horario de Mantenimiento',
          text: 'Se deben establecer y seguir horarios de mantenimiento regulares para garantizar el funcionamiento adecuado del sistema y el cumplimiento de las regulaciones.'
        }
      },
      category: 'septic',
      icon: <Wrench className="h-5 w-5" />,
      description: 'Maintenance scheduling and tracking procedures'
    },
    // HR & Administrative Blocks
    {
      id: 'company-policies',
      type: 'text',
      title: 'Company Policies',
      content: {
        text: 'This section outlines the key policies and procedures that govern workplace conduct and operations.'
      },
      isRequired: false,
      isEditable: true,
      languages: {
        en: { 
          title: 'Company Policies',
          text: 'This section outlines the key policies and procedures that govern workplace conduct and operations.'
        },
        es: { 
          title: 'Políticas de la Empresa',
          text: 'Esta sección describe las políticas y procedimientos clave que rigen la conducta y las operaciones en el lugar de trabajo.'
        }
      },
      category: 'hr',
      icon: <Building2 className="h-5 w-5" />,
      description: 'General company policies and procedures'
    },
    {
      id: 'training-requirements',
      type: 'checklist',
      title: 'Training Requirements',
      content: {
        items: [
          'Safety orientation training',
          'Equipment operation training',
          'Emergency response training',
          'Regulatory compliance training',
          'Continuing education requirements'
        ]
      },
      isRequired: true,
      isEditable: true,
      languages: {
        en: { 
          title: 'Training Requirements',
          items: [
            'Safety orientation training',
            'Equipment operation training',
            'Emergency response training',
            'Regulatory compliance training',
            'Continuing education requirements'
          ]
        },
        es: { 
          title: 'Requisitos de Capacitación',
          items: [
            'Capacitación de orientación de seguridad',
            'Capacitación en operación de equipos',
            'Capacitación de respuesta de emergencia',
            'Capacitación de cumplimiento regulatorio',
            'Requisitos de educación continua'
          ]
        }
      },
      category: 'training',
      icon: <Users className="h-5 w-5" />,
      description: 'Required training for all employees'
    }
  ];

  const getCurrentContent = (block: ContentBlock) => {
    if (language === 'bilingual') {
      return block.languages;
    }
    return block.languages[language] || block.languages.en;
  };

  const handleAddBlock = (block: ContentBlock) => {
    if (!selectedBlocks.find(b => b.id === block.id)) {
      onBlocksChange([...selectedBlocks, { ...block }]);
    }
  };

  const handleRemoveBlock = (blockId: string) => {
    onBlocksChange(selectedBlocks.filter(b => b.id !== blockId));
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    onBlocksChange(selectedBlocks.map(b => 
      b.id === blockId ? { ...b, ...updates } : b
    ));
  };

  const handleReorderBlocks = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...selectedBlocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    onBlocksChange(newBlocks);
  };

  const renderContentBlock = (block: ContentBlock, isPreview: boolean = false) => {
    const content = getCurrentContent(block);
    
    switch (block.type) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none">
            <p>{content.text}</p>
          </div>
        );
      
      case 'list':
        return (
          <ul className="space-y-2">
            {content.items.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        );
      
      case 'checklist':
        return (
          <div className="space-y-2">
            {content.items.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <input type="checkbox" className="rounded" disabled={isPreview} />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        );
      
      case 'form':
        return (
          <div className="space-y-4">
            {content.fields.map((field: any, index: number) => (
              <div key={index}>
                <Label className="text-sm font-medium">{field.label}</Label>
                {field.type === 'select' ? (
                  <select className="w-full p-2 border rounded-md text-sm" disabled={isPreview}>
                    <option value="">Select...</option>
                    {field.options.map((option: string) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <Textarea className="text-sm" disabled={isPreview} />
                ) : (
                  <Input className="text-sm" disabled={isPreview} />
                )}
              </div>
            ))}
          </div>
        );
      
      default:
        return <div className="text-sm text-muted-foreground">Content block</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Language Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <Label>Content Language:</Label>
            </div>
            <Tabs value={language} onValueChange={onLanguageChange}>
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="es">Español</TabsTrigger>
                <TabsTrigger value="bilingual">Bilingual</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Blocks */}
        <Card>
          <CardHeader>
            <CardTitle>Available Content Blocks</CardTitle>
            <p className="text-sm text-muted-foreground">
              Drag and drop blocks or click to add them to your handbook
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="safety" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="safety">Safety</TabsTrigger>
                <TabsTrigger value="septic">Septic</TabsTrigger>
                <TabsTrigger value="hr">HR</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
              </TabsList>
              
              {['safety', 'septic', 'hr', 'training'].map(category => (
                <TabsContent key={category} value={category}>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {availableBlocks
                        .filter(block => block.category === category)
                        .map(block => (
                          <Card key={block.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {block.icon}
                                <div>
                                  <h4 className="font-medium text-sm">{block.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {block.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {block.type}
                                    </Badge>
                                    {block.isRequired && (
                                      <Badge variant="destructive" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddBlock(block)}
                                disabled={selectedBlocks.some(b => b.id === block.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Selected Blocks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Selected Content Blocks</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="preview-mode" className="text-sm">Preview Mode</Label>
                <Switch
                  id="preview-mode"
                  checked={previewMode}
                  onCheckedChange={setPreviewMode}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {selectedBlocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content blocks selected</p>
                  <p className="text-sm">Add blocks from the left panel to build your handbook</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedBlocks.map((block, index) => (
                    <Card key={block.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          {block.icon}
                          <h4 className="font-medium text-sm">
                            {language === 'bilingual' ? 
                              `${block.languages.en.title} / ${block.languages.es.title}` :
                              getCurrentContent(block).title
                            }
                          </h4>
                        </div>
                        <div className="flex items-center gap-1">
                          {!previewMode && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingBlock(block.id)}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveBlock(block.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {language === 'bilingual' ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-medium text-blue-600">English</Label>
                            <div className="mt-1">
                              {renderContentBlock({...block, languages: {en: block.languages.en}}, previewMode)}
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <Label className="text-xs font-medium text-green-600">Español</Label>
                            <div className="mt-1">
                              {renderContentBlock({...block, languages: {es: block.languages.es}}, previewMode)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        renderContentBlock(block, previewMode)
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};