import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Calendar, Tag, Search, Filter, Plus, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { useToast } from '@/hooks/use-toast';
import { useVaultPolicies } from '../hooks/useVaultPolicies';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { FileUploadModal } from '../components/FileUploadModal';
import { VaultPageSkeleton } from '../components/LoadingSkeletons';
import { VaultErrorBoundary } from '../components/VaultErrorBoundary';

import { logVaultView, logVaultDownload, logVaultSearch } from '../utils/auditLogger';

interface PolicyDocument {
  id: string;
  title: string;
  category?: string;
  upload_date: string;
  file_url?: string;
  description?: string;
  version?: number;
  tags?: string[];
  status?: 'active' | 'draft' | 'archived';
  updated_by?: string;
  body?: string;
  change_summary?: string;
}

export const PolicyArchivePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewerDocument, setViewerDocument] = useState<any>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast } = useToast();
  const { policies, loading, error, refetch, canManage } = useVaultPolicies();

  console.log('📋 PolicyArchivePage: Rendered with', {
    policiesCount: policies.length,
    loading,
    error,
    canManage
  });

  // Transform vault policies to match display interface
  const transformedPolicies: PolicyDocument[] = policies.map(policy => ({
    id: policy.id,
    title: policy.title,
    category: 'Policy Document',
    upload_date: policy.created_at,
    description: `Version ${policy.version} • Created by: ${policy.created_by || 'System'}`,
    version: policy.version || 1,
    tags: ['policy', 'document'],
    status: 'active' as const,
    body: policy.body,
    change_summary: policy.change_summary || 'Policy document'
  }));

  const filteredPolicies = transformedPolicies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         policy.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         policy.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || policy.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || policy.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(transformedPolicies.map(p => p.category))];

  const handleDownload = async (policy: PolicyDocument) => {
    try {
      // Log download for audit
      await logVaultDownload('policy', policy.id, policy.title);
      
      // Create downloadable content from policy body
      const content = policy.body || policy.title;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${policy.title}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading ${policy.title}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleView = async (policy: PolicyDocument) => {
    // Log view for audit
    await logVaultView('policy', policy.id, policy.title);
    
    setViewerDocument({
      id: policy.id,
      title: policy.title,
      file_url: `data:text/plain;charset=utf-8,${encodeURIComponent(policy.body || '')}`,
      mime_type: 'text/plain',
      document_type: policy.category,
      created_at: policy.upload_date,
      tags: policy.tags
    });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      await logVaultSearch(query, { category: selectedCategory, status: selectedStatus }, filteredPolicies.length);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <StandardPageLayout
      title="Policy Archive"
      subtitle="Access and manage company policy documents"
      badge="Document Library"
      onRefresh={refetch}
      isRefreshing={loading}
      headerActions={
        <Button 
          variant="outline" 
          onClick={() => navigate('/halo-iq/vault')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vault
        </Button>
      }
    >
      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `${filteredPolicies.length} document${filteredPolicies.length !== 1 ? 's' : ''} found`}
        </p>
        {canManage && (
          <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Policy
          </Button>
        )}
      </div>

      {/* Policy Documents Grid */}
      <VaultErrorBoundary>
        {loading ? (
          <VaultPageSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading policies: {error}</p>
            <Button onClick={refetch} className="mt-4">Try Again</Button>
          </div>
        ) : filteredPolicies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No policies found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'No policy documents have been uploaded yet'
              }
            </p>
            <Button variant="outline" onClick={() => setUploadModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload First Policy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight mb-2">{policy.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{policy.category}</Badge>
                      <Badge 
                        variant={policy.status === 'active' ? 'default' : policy.status === 'draft' ? 'secondary' : 'outline'}
                      >
                        {policy.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {policy.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(policy.upload_date)}
                    {policy.version && (
                      <>
                        <span>•</span>
                        <span>v{policy.version}</span>
                      </>
                    )}
                  </div>
                  
                   {policy.tags && policy.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                       {policy.tags.slice(0, 3).map((tag) => (
                         <Badge key={tag} variant="outline" className="text-xs">
                           <Tag className="h-3 w-3 mr-1" />
                           {tag}
                         </Badge>
                       ))}
                       {policy.tags.length > 3 && (
                         <Badge variant="outline" className="text-xs">
                           +{policy.tags.length - 3}
                         </Badge>
                       )}
                     </div>
                   )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(policy)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(policy)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </VaultErrorBoundary>

      <DocumentViewerModal
        isOpen={!!viewerDocument}
        onClose={() => setViewerDocument(null)}
        document={viewerDocument}
        onDownload={handleDownload}
      />

      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={refetch}
        uploadType="policy"
        title="Upload Policy Document"
      />
    </StandardPageLayout>
  );
};