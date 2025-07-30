import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Edit, Trash2, FileText, MapPin, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDocumentBuilder } from '@/hooks/useDocumentBuilder';
import type { RegulationRule, Jurisdiction } from '@/types/document-builder';

interface RegulationManagerProps {
  jurisdictions: Jurisdiction[];
  onRegulationUpdate?: () => void;
}

export const RegulationManager = ({ jurisdictions, onRegulationUpdate }: RegulationManagerProps) => {
  const { regulationRules, loadRegulationRules } = useDocumentBuilder();
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RegulationRule | null>(null);

  const [newRule, setNewRule] = useState({
    title: '',
    content: '',
    rule_type: '',
    document_category: 'septic',
    effective_date: '',
    tags: [] as string[],
    source_url: '',
    compliance_requirements: {}
  });

  useEffect(() => {
    loadRegulationRules(selectedJurisdiction, selectedCategory);
  }, [selectedJurisdiction, selectedCategory, loadRegulationRules]);

  const filteredRules = regulationRules.filter(rule =>
    rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateRule = () => {
    // Mock implementation - will be replaced with actual API call
    console.log('Creating new regulation rule:', newRule);
    setIsCreateDialogOpen(false);
    setNewRule({
      title: '',
      content: '',
      rule_type: '',
      document_category: 'septic',
      effective_date: '',
      tags: [],
      source_url: '',
      compliance_requirements: {}
    });
    onRegulationUpdate?.();
  };

  const handleEditRule = (rule: RegulationRule) => {
    setEditingRule(rule);
  };

  const handleDeleteRule = (ruleId: string) => {
    // Mock implementation - will be replaced with actual API call
    console.log('Deleting regulation rule:', ruleId);
    onRegulationUpdate?.();
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !newRule.tags.includes(tag.trim())) {
      setNewRule(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewRule(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Regulation Management</h2>
          <p className="text-muted-foreground">
            Manage state and county-specific regulations for compliance handbooks
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Regulation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Regulation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map(jurisdiction => (
                        <SelectItem key={jurisdiction.id} value={jurisdiction.id}>
                          {jurisdiction.name} ({jurisdiction.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Document Category</Label>
                  <Select value={newRule.document_category} onValueChange={(value) => setNewRule(prev => ({ ...prev, document_category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="septic">Septic Systems</SelectItem>
                      <SelectItem value="iipp">IIPP Safety</SelectItem>
                      <SelectItem value="handbook">Employee Handbook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Regulation Title</Label>
                <Input
                  id="title"
                  value={newRule.title}
                  onChange={(e) => setNewRule(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Septic Tank Pumping Requirements"
                />
              </div>
              
              <div>
                <Label htmlFor="rule_type">Rule Type</Label>
                <Input
                  id="rule_type"
                  value={newRule.rule_type}
                  onChange={(e) => setNewRule(prev => ({ ...prev, rule_type: e.target.value }))}
                  placeholder="e.g., maintenance, inspection, safety"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Regulation Content</Label>
                <Textarea
                  id="content"
                  value={newRule.content}
                  onChange={(e) => setNewRule(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the full regulation text..."
                  rows={6}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effective_date">Effective Date</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={newRule.effective_date}
                    onChange={(e) => setNewRule(prev => ({ ...prev, effective_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="source_url">Source URL</Label>
                  <Input
                    id="source_url"
                    value={newRule.source_url}
                    onChange={(e) => setNewRule(prev => ({ ...prev, source_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {newRule.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule}>
                  Create Regulation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search Regulations</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, content, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Jurisdiction</Label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="All jurisdictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All jurisdictions</SelectItem>
                  {jurisdictions.map(jurisdiction => (
                    <SelectItem key={jurisdiction.id} value={jurisdiction.id}>
                      {jurisdiction.name} ({jurisdiction.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  <SelectItem value="septic">Septic Systems</SelectItem>
                  <SelectItem value="iipp">IIPP Safety</SelectItem>
                  <SelectItem value="handbook">Employee Handbook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regulations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Regulations ({filteredRules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredRules.map((rule) => (
                <Card key={rule.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{rule.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {jurisdictions.find(j => j.id === rule.jurisdiction_id)?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {rule.effective_date ? new Date(rule.effective_date).toLocaleDateString() : 'No date'}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {rule.rule_type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRule(rule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm mt-3 leading-relaxed">
                          {rule.content.length > 200 
                            ? `${rule.content.substring(0, 200)}...` 
                            : rule.content
                          }
                        </p>
                        
                        {rule.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {rule.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {rule.source_url && (
                          <a 
                            href={rule.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary text-sm hover:underline mt-2 inline-block"
                          >
                            View Source →
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredRules.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No regulations found matching your criteria.</p>
                  <p className="text-sm mt-1">Try adjusting your filters or add new regulations.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};