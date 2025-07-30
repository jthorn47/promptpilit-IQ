import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Search, 
  Filter, 
  Shield, 
  HardHat, 
  Wrench, 
  AlertTriangle,
  Users,
  Building,
  Plus,
  Eye,
  Download
} from 'lucide-react';

interface IndustryTemplate {
  id: string;
  name: string;
  category: 'iipp' | 'state' | 'handbook';
  industry: string;
  description: string;
  sections: string[];
  compliance_frameworks: string[];
  languages: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimated_time: string;
  last_updated: string;
  usage_count: number;
  rating: number;
  preview_url?: string;
}

interface IndustryTemplateLibraryProps {
  onTemplateSelect: (template: IndustryTemplate) => void;
  selectedCategory?: 'iipp' | 'state' | 'handbook';
}

export const IndustryTemplateLibrary = ({ onTemplateSelect, selectedCategory }: IndustryTemplateLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<IndustryTemplate | null>(null);

  const mockTemplates: IndustryTemplate[] = [
    {
      id: '1',
      name: 'Septic Systems IIPP - Basic',
      category: 'iipp',
      industry: 'septic',
      description: 'Basic OSHA-compliant IIPP template for septic system contractors with essential safety policies.',
      sections: ['Program Administration', 'Hazard Assessment', 'PPE Requirements', 'Training Program', 'Record Keeping'],
      compliance_frameworks: ['OSHA', 'Cal/OSHA'],
      languages: ['English', 'Spanish'],
      difficulty: 'basic',
      estimated_time: '2-3 hours',
      last_updated: '2024-01-15',
      usage_count: 245,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Septic Systems IIPP - Comprehensive',
      category: 'iipp',
      industry: 'septic',
      description: 'Comprehensive IIPP template with advanced safety protocols, chemical handling, and emergency response.',
      sections: ['Program Administration', 'Hazard Assessment', 'PPE Requirements', 'Chemical Safety', 'Emergency Response', 'Training Program', 'Incident Investigation', 'Record Keeping'],
      compliance_frameworks: ['OSHA', 'Cal/OSHA', 'EPA'],
      languages: ['English', 'Spanish'],
      difficulty: 'advanced',
      estimated_time: '4-6 hours',
      last_updated: '2024-01-20',
      usage_count: 89,
      rating: 4.9
    },
    {
      id: '3',
      name: 'State-Specific Safety Manual',
      category: 'state',
      industry: 'state',
      description: 'State-specific safety manual covering local regulations and compliance requirements.',
      sections: ['State Regulations', 'Local Requirements', 'Compliance Procedures', 'Safety SOPs', 'Emergency Procedures'],
      compliance_frameworks: ['State Environmental', 'Local Authority'],
      languages: ['English'],
      difficulty: 'intermediate',
      estimated_time: '3-4 hours',
      last_updated: '2024-01-10',
      usage_count: 156,
      rating: 4.7
    },
    {
      id: '4',
      name: 'Septic Industry Employee Handbook',
      category: 'handbook',
      industry: 'septic',
      description: 'Complete employee handbook tailored for septic system service companies.',
      sections: ['Company Policies', 'Safety Requirements', 'Benefits', 'Code of Conduct', 'Training Requirements'],
      compliance_frameworks: ['OSHA', 'DOL', 'State Labor'],
      languages: ['English', 'Spanish'],
      difficulty: 'intermediate',
      estimated_time: '3-5 hours',
      last_updated: '2024-01-25',
      usage_count: 78,
      rating: 4.6
    },
    {
      id: '5',
      name: 'Small Business IIPP Template',
      category: 'iipp',
      industry: 'general',
      description: 'Simplified IIPP template for small businesses with basic safety requirements.',
      sections: ['Program Administration', 'Hazard Assessment', 'PPE Requirements', 'Training Program'],
      compliance_frameworks: ['OSHA'],
      languages: ['English'],
      difficulty: 'basic',
      estimated_time: '1-2 hours',
      last_updated: '2024-01-05',
      usage_count: 342,
      rating: 4.5
    }
  ];

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesIndustry = !selectedIndustry || template.industry === selectedIndustry;
    const matchesDifficulty = !selectedDifficulty || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesIndustry && matchesDifficulty;
  });

  const industries = [...new Set(mockTemplates.map(t => t.industry))];
  const difficulties = ['basic', 'intermediate', 'advanced'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'iipp':
        return <HardHat className="h-5 w-5" />;
      case 'state':
        return <Shield className="h-5 w-5" />;
      case 'handbook':
        return <Users className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Industry Template Library</h2>
          <p className="text-muted-foreground">
            Choose from pre-built templates tailored for your industry
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredTemplates.length} Templates
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Templates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry === 'state' ? 'State Specific' : 
                     industry === 'general' ? 'General Business' : industry}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedIndustry('');
                  setSelectedDifficulty('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {template.category.toUpperCase()}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>★</span>
                  <span>{template.rating}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <span>{template.estimated_time}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage Count:</span>
                  <span>{template.usage_count.toLocaleString()}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Compliance Frameworks:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.compliance_frameworks.map(framework => (
                    <Badge key={framework} variant="secondary" className="text-xs">
                      {framework}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Languages:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.languages.map(language => (
                    <Badge key={language} variant="outline" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{template.name} - Preview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Industry:</Label>
                          <p className="text-sm">{template.industry}</p>
                        </div>
                        <div>
                          <Label>Difficulty:</Label>
                          <p className="text-sm capitalize">{template.difficulty}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Description:</Label>
                        <p className="text-sm mt-1">{template.description}</p>
                      </div>
                      
                      <div>
                        <Label>Included Sections:</Label>
                        <div className="mt-2 space-y-1">
                          {template.sections.map((section, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm">{section}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Sample
                        </Button>
                        <Button onClick={() => onTemplateSelect(template)}>
                          Use This Template
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onTemplateSelect(template)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms to find relevant templates.
          </p>
        </div>
      )}
    </div>
  );
};