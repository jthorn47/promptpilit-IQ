import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Save, 
  Eye, 
  Download, 
  ChevronDown,
  ChevronRight,
  Plus,
  Lock,
  Unlock,
  FileText,
  Users,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RichTextEditor } from './RichTextEditor';
import { DynamicFieldsPanel } from './DynamicFieldsPanel';
import { LegalClausesPanel } from './LegalClausesPanel';
import { DocumentSectionsManager } from './DocumentSectionsManager';
import { DocumentPreview } from './DocumentPreview';
import { useDocumentBuilder } from '@/hooks/useDocumentBuilder';
import type { Document, DocumentSection, EditorContent } from '@/types/document-builder';

interface DocumentBuilderProps {
  documentId?: string;
  documentTypeId?: string;
  onSave?: (document: Document) => void;
  onClose?: () => void;
}

export const DocumentBuilder = ({ 
  documentId, 
  documentTypeId, 
  onSave, 
  onClose 
}: DocumentBuilderProps) => {
  const {
    documents,
    documentTypes,
    templates,
    dynamicFields,
    legalClauses,
    loading,
    loadTemplates,
    loadLegalClauses,
    createDocument,
    updateDocument,
    loadDocumentSections,
    saveDocumentSections,
    getCompanyData
  } = useDocumentBuilder();

  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDynamicFields, setShowDynamicFields] = useState(false);
  const [showLegalClauses, setShowLegalClauses] = useState(false);
  const [companyData, setCompanyData] = useState<Record<string, any>>({});
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentStatus, setDocumentStatus] = useState<'draft' | 'review' | 'published' | 'archived'>('draft');

  // Load existing document or create new one
  useEffect(() => {
    if (documentId) {
      const doc = documents.find(d => d.id === documentId);
      if (doc) {
        setCurrentDocument(doc);
        setDocumentTitle(doc.title);
        setDocumentStatus(doc.status);
        loadSections();
      }
    } else if (documentTypeId) {
      // Create new document
      initializeNewDocument();
    }
  }, [documentId, documentTypeId, documents]);

  // Load company data for dynamic fields
  useEffect(() => {
    getCompanyData().then(setCompanyData);
  }, []);

  const loadSections = async () => {
    if (!documentId) return;
    const sectionData = await loadDocumentSections(documentId);
    setSections(sectionData);
    if (sectionData.length > 0) {
      setActiveSection(sectionData[0].id);
    }
  };

  const initializeNewDocument = async () => {
    if (!documentTypeId) return;

    const docType = documentTypes.find(dt => dt.id === documentTypeId);
    if (!docType) return;

    const newDoc: Partial<Document> = {
      document_type_id: documentTypeId,
      title: `New ${docType.name}`,
      content: {},
      dynamic_fields: {},
      status: 'draft',
      version: '1.0',
      is_locked: false,
      metadata: {}
    };

    setDocumentTitle(newDoc.title!);
    loadTemplates(documentTypeId);
    loadLegalClauses(docType.category);
  };

  // Save document
  const handleSave = async () => {
    if (!currentDocument && !documentTypeId) return;

    try {
      let savedDoc: Document;

      if (currentDocument) {
        // Update existing document
        savedDoc = await updateDocument(currentDocument.id, {
          title: documentTitle,
          status: documentStatus,
          content: { sections: sections.map(s => s.section_content) },
          dynamic_fields: companyData
        }) as Document;
      } else {
        // Create new document
        savedDoc = await createDocument({
          document_type_id: documentTypeId!,
          title: documentTitle,
          status: documentStatus,
          content: { sections: sections.map(s => s.section_content) },
          dynamic_fields: companyData
        });
      }

      // Save sections
      if (sections.length > 0) {
        await saveDocumentSections(savedDoc.id, sections);
      }

      setCurrentDocument(savedDoc);
      onSave?.(savedDoc);

      toast({
        title: "Success",
        description: "Document saved successfully"
      });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // Add new section
  const addSection = () => {
    const newSection: DocumentSection = {
      id: Date.now().toString(),
      document_id: currentDocument?.id || '',
      section_title: 'New Section',
      section_content: {
        editorContent: []
      },
      section_order: sections.length,
      is_required: false,
      is_collapsed: false,
      is_locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  // Update section content
  const updateSectionContent = (sectionId: string, content: EditorContent[]) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            section_content: { 
              ...section.section_content, 
              editorContent: content 
            },
            updated_at: new Date().toISOString()
          }
        : section
    ));
  };

  // Toggle section lock
  const toggleSectionLock = (sectionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, is_locked: !section.is_locked }
        : section
    ));
  };

  // Get document type info
  const documentType = documentTypes.find(dt => dt.id === (currentDocument?.document_type_id || documentTypeId));

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-lg font-semibold border-none p-0 h-auto bg-transparent"
                placeholder="Document Title"
              />
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{documentType?.name}</Badge>
                <Badge variant={documentStatus === 'published' ? 'default' : 'outline'}>
                  {documentStatus}
                </Badge>
                {currentDocument?.is_locked && (
                  <Badge variant="destructive">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={loading}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Document info */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          {currentDocument && (
            <>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Created by: {currentDocument.created_by}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last modified: {new Date(currentDocument.updated_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Version: {currentDocument.version}
              </div>
            </>
          )}
          {documentType?.compliance_framework.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Compliance: {documentType.compliance_framework.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/30 flex flex-col">
          {/* Sections manager */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Document Sections</h3>
              <Button size="sm" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <ScrollArea className="h-64">
              <DocumentSectionsManager
                sections={sections}
                activeSection={activeSection}
                onSectionSelect={setActiveSection}
                onSectionUpdate={(updatedSections) => setSections(updatedSections)}
                onToggleLock={toggleSectionLock}
              />
            </ScrollArea>
          </div>

          {/* Dynamic fields panel */}
          <div className="p-4 border-b">
            <Collapsible open={showDynamicFields} onOpenChange={setShowDynamicFields}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0">
                  <span className="font-semibold">Dynamic Fields</span>
                  {showDynamicFields ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <DynamicFieldsPanel
                  fields={dynamicFields}
                  values={companyData}
                  onFieldValueChange={(fieldName, value) => 
                    setCompanyData(prev => ({ ...prev, [fieldName]: value }))
                  }
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Legal clauses panel */}
          <div className="p-4">
            <Collapsible open={showLegalClauses} onOpenChange={setShowLegalClauses}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0">
                  <span className="font-semibold">Legal Clauses</span>
                  {showLegalClauses ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <LegalClausesPanel
                  clauses={legalClauses}
                  onClauseSelect={(clause) => {
                    // Insert clause into active section
                    if (activeSection) {
                      const newContent: EditorContent = {
                        id: Date.now().toString(),
                        type: 'legal_clause',
                        content: {
                          clause_id: clause.id,
                          title: clause.title,
                          content: clause.content
                        },
                        order: 0
                      };
                      
                      const activeDoc = sections.find(s => s.id === activeSection);
                      if (activeDoc) {
                        const currentContent = activeDoc.section_content.editorContent || [];
                        updateSectionContent(activeSection, [...currentContent, newContent]);
                      }
                    }
                  }}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col">
          {activeSection ? (
            <div className="flex-1 p-6">
              <div className="mb-4">
                <Label>Section Title</Label>
                <Input
                  value={sections.find(s => s.id === activeSection)?.section_title || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSections(sections.map(section => 
                      section.id === activeSection 
                        ? { ...section, section_title: value }
                        : section
                    ));
                  }}
                  className="mt-1"
                />
              </div>

              <RichTextEditor
                content={sections.find(s => s.id === activeSection)?.section_content.editorContent || []}
                onChange={(content) => updateSectionContent(activeSection, content)}
                onInsertDynamicField={() => setShowDynamicFields(true)}
                onInsertLegalClause={() => setShowLegalClauses(true)}
                className="flex-1"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Section Selected</h3>
                <p>Select a section from the sidebar or create a new one to start editing.</p>
                <Button onClick={addSection} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Section
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <DocumentPreview
          document={currentDocument}
          sections={sections}
          dynamicFieldValues={companyData}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Legal disclaimer */}
      {documentType?.legal_disclaimer && (
        <div className="border-t bg-muted/50 p-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p>{documentType.legal_disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};