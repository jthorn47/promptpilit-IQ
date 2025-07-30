import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Document, DocumentType, DocumentTemplate, DocumentSection, DynamicField, LegalClause, Jurisdiction, RegulationRule, QuizQuestion, ComplianceForm } from '@/types/document-builder';

export const useDocumentBuilder = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [legalClauses, setLegalClauses] = useState<LegalClause[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [regulationRules, setRegulationRules] = useState<RegulationRule[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [complianceForms, setComplianceForms] = useState<ComplianceForm[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load document types
  const loadDocumentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDocumentTypes(data || []);
    } catch (error) {
      console.error('Error loading document types:', error);
      toast({
        title: "Error",
        description: "Failed to load document types",
        variant: "destructive",
      });
    }
  };

  // Load templates
  const loadTemplates = async (documentTypeId?: string) => {
    try {
      let query = supabase.from('document_templates').select('*');
      
      if (documentTypeId) {
        query = query.eq('document_type_id', documentTypeId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      
      // Add California handbook template for employee handbook type
      const templatesData = data || [];
      const docType = documentTypes.find(dt => dt.id === documentTypeId);
      if (docType?.category === 'handbook') {
        const { californiaHandbookTemplate } = await import('@/components/document-builder/templates/CaliforniaHandbookTemplate');
        templatesData.unshift({
          ...californiaHandbookTemplate,
          document_type_id: documentTypeId,
          company_id: '',
          created_by: '',
          description: californiaHandbookTemplate.description || 'California Employee Handbook Template'
        } as any);
      }
      
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    }
  };

  // Load documents
  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_types(name, category),
          document_templates(name)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []).map(doc => ({
        ...doc,
        content: doc.content as any,
        dynamic_fields: doc.dynamic_fields as Record<string, any>,
        metadata: doc.metadata as any,
        status: doc.status as 'draft' | 'review' | 'published' | 'archived'
      })));
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  // Load dynamic fields
  const loadDynamicFields = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_fields')
        .select('*')
        .order('field_label');

      if (error) throw error;
      setDynamicFields((data || []).map(field => ({
        ...field,
        field_type: field.field_type as 'text' | 'number' | 'date' | 'select' | 'company_data',
        validation_rules: field.validation_rules as any
      })));
    } catch (error) {
      console.error('Error loading dynamic fields:', error);
    }
  };

  // Load legal clauses
  const loadLegalClauses = async (documentCategory?: string) => {
    try {
      let query = supabase
        .from('legal_clauses')
        .select('*')
        .eq('is_active', true);

      if (documentCategory) {
        query = query.contains('applicable_documents', [documentCategory]);
      }

      const { data, error } = await query.order('title');

      if (error) throw error;
      setLegalClauses(data || []);
    } catch (error) {
      console.error('Error loading legal clauses:', error);
    }
  };

  // Create new document
  const createDocument = async (documentData: Partial<Document>) => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.user.id)
        .single();

      if (!profile?.company_id) throw new Error('User company not found');

      if (!documentData.document_type_id || !documentData.title) {
        throw new Error('Document type and title are required');
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          document_type_id: documentData.document_type_id,
          title: documentData.title,
          template_id: documentData.template_id || null,
          status: documentData.status || 'draft',
          version: documentData.version || '1.0',
          is_locked: documentData.is_locked || false,
          company_id: profile.company_id,
          created_by: user.user.id,
          content: documentData.content || {},
          dynamic_fields: documentData.dynamic_fields || {},
          metadata: documentData.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document created successfully",
      });

      await loadDocuments();
      return {
        ...data,
        content: data.content as any,
        dynamic_fields: data.dynamic_fields as Record<string, any>,
        metadata: data.metadata as any
      } as Document;
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update document
  const updateDocument = async (documentId: string, updates: Partial<Document>) => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          last_modified_by: user.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document updated successfully",
      });

      await loadDocuments();
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load document sections
  const loadDocumentSections = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_sections')
        .select('*')
        .eq('document_id', documentId)
        .order('section_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading document sections:', error);
      return [];
    }
  };

  // Save document sections
  const saveDocumentSections = async (documentId: string, sections: Partial<DocumentSection>[]) => {
    try {
      // Delete existing sections
      await supabase
        .from('document_sections')
        .delete()
        .eq('document_id', documentId);

      // Insert new sections
      const sectionsToInsert = sections
        .filter(section => section.section_title) // Only insert sections with titles
        .map((section, index) => ({
          document_id: documentId,
          section_title: section.section_title!,
          section_content: section.section_content || {},
          section_order: index,
          is_required: section.is_required || false,
          is_collapsed: section.is_collapsed || false,
          is_locked: section.is_locked || false,
        }));

      if (sectionsToInsert.length > 0) {
        const { error } = await supabase
          .from('document_sections')
          .insert(sectionsToInsert);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Document sections saved successfully",
      });
    } catch (error) {
      console.error('Error saving document sections:', error);
      toast({
        title: "Error",
        description: "Failed to save document sections",
        variant: "destructive",
      });
    }
  };

  // Get company data for dynamic fields
  const getCompanyData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return {};

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.user.id)
        .single();

      if (!profile?.company_id) return {};

      const { data: company } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      return company || {};
    } catch (error) {
      console.error('Error loading company data:', error);
      return {};
    }
  };

  // Load jurisdictions (mock data until types are updated)
  const loadJurisdictions = async () => {
    try {
      // Mock data for now
      const mockJurisdictions: Jurisdiction[] = [
        { id: '1', name: 'California', type: 'state', abbreviation: 'CA', fips_code: '06', regulations_last_updated: new Date().toISOString(), contact_info: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', name: 'Texas', type: 'state', abbreviation: 'TX', fips_code: '48', regulations_last_updated: new Date().toISOString(), contact_info: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '3', name: 'Florida', type: 'state', abbreviation: 'FL', fips_code: '12', regulations_last_updated: new Date().toISOString(), contact_info: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '4', name: 'New York', type: 'state', abbreviation: 'NY', fips_code: '36', regulations_last_updated: new Date().toISOString(), contact_info: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '5', name: 'Washington', type: 'state', abbreviation: 'WA', fips_code: '53', regulations_last_updated: new Date().toISOString(), contact_info: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      setJurisdictions(mockJurisdictions);
    } catch (error) {
      console.error('Error loading jurisdictions:', error);
    }
  };

  // Load regulation rules (mock data until types are updated)
  const loadRegulationRules = async (jurisdictionId?: string, documentCategory?: string) => {
    try {
      // Mock data for now
      const mockRules: RegulationRule[] = [
        {
          id: '1',
          jurisdiction_id: '1',
          document_category: 'septic',
          rule_type: 'maintenance',
          title: 'Septic Tank Pumping Requirements',
          content: 'Septic tanks shall be pumped and inspected at minimum every three (3) years for residential systems and annually for commercial systems.',
          effective_date: '2024-01-01',
          compliance_requirements: { inspection_frequency: 'annual', record_retention: '5_years' },
          tags: ['pumping', 'inspection', 'maintenance'],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setRegulationRules(mockRules.filter(rule => 
        (!jurisdictionId || rule.jurisdiction_id === jurisdictionId) &&
        (!documentCategory || rule.document_category === documentCategory)
      ));
    } catch (error) {
      console.error('Error loading regulation rules:', error);
    }
  };

  // Load quiz questions for a document section (mock for now)
  const loadQuizQuestions = async (documentSectionId: string) => {
    try {
      // Mock data - will be replaced with actual DB call later
      return [];
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      return [];
    }
  };

  // Save quiz questions for a document section (mock for now)
  const saveQuizQuestions = async (documentSectionId: string, questions: Partial<QuizQuestion>[]) => {
    try {
      // Mock implementation - will be replaced with actual DB call later
      console.log('Saving quiz questions:', questions);
    } catch (error) {
      console.error('Error saving quiz questions:', error);
      throw error;
    }
  };

  // Load compliance forms for a document section (mock for now)
  const loadComplianceForms = async (documentSectionId: string) => {
    try {
      // Mock data - will be replaced with actual DB call later
      return [];
    } catch (error) {
      console.error('Error loading compliance forms:', error);
      return [];
    }
  };

  // Save compliance forms for a document section (mock for now)
  const saveComplianceForms = async (documentSectionId: string, forms: Partial<ComplianceForm>[]) => {
    try {
      // Mock implementation - will be replaced with actual DB call later
      console.log('Saving compliance forms:', forms);
    } catch (error) {
      console.error('Error saving compliance forms:', error);
      throw error;
    }
  };

  // Get states for jurisdiction selection
  const getStates = () => {
    return jurisdictions.filter(j => j.type === 'state');
  };

  // Get counties for a state
  const getCounties = (stateId: string) => {
    return jurisdictions.filter(j => j.type === 'county' && j.parent_jurisdiction_id === stateId);
  };

  useEffect(() => {
    loadDocumentTypes();
    loadDynamicFields();
    loadDocuments();
    loadJurisdictions();
  }, []);

  return {
    documents,
    documentTypes,
    templates,
    dynamicFields,
    legalClauses,
    jurisdictions,
    regulationRules,
    quizQuestions,
    complianceForms,
    loading,
    loadDocumentTypes,
    loadTemplates,
    loadDocuments,
    loadDynamicFields,
    loadLegalClauses,
    loadJurisdictions,
    loadRegulationRules,
    loadQuizQuestions,
    saveQuizQuestions,
    loadComplianceForms,
    saveComplianceForms,
    createDocument,
    updateDocument,
    deleteDocument,
    loadDocumentSections,
    saveDocumentSections,
    getCompanyData,
    getStates,
    getCounties,
  };
};