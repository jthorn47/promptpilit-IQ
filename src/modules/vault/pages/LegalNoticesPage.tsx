import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Download, Eye, Calendar, AlertTriangle, Building, Search, Filter, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useVaultFiles } from '../hooks/useVaultFiles';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { FileUploadModal } from '../components/FileUploadModal';
import { DocumentGridSkeleton } from '../components/LoadingSkeletons';
import { VaultErrorBoundary } from '../components/VaultErrorBoundary';
import { logVaultView, logVaultDownload, logVaultUpload } from '../utils/auditLogger';


interface LegalNotice {
  id: string;
  title: string;
  document_type: string;
  effective_date: string;
  expiry_date?: string;
  jurisdiction: string;
  description?: string;
  document_url?: string;
  compliance_status: 'compliant' | 'pending' | 'expired';
  priority: 'high' | 'medium' | 'low';
  issuing_authority: string;
  notice_number?: string;
  tags: string[];
}

export const LegalNoticesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [viewerDocument, setViewerDocument] = useState<any>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast } = useToast();
  const { files, loading, error, refetch, downloadFile, canManage } = useVaultFiles();
  const { isAdmin, isSuperAdmin } = useAuth(); // Fixed permission check

  // Filter files for legal notices
  const legalFiles = files.filter(file => 
    file.folder_path?.includes('legal') || 
    file.folder_path?.includes('notices') ||
    file.folder_path?.includes('notice') ||
    file.name.toLowerCase().includes('legal') ||
    file.name.toLowerCase().includes('notice')
  );

  // Transform vault files to match display interface
  const transformedNotices: LegalNotice[] = legalFiles.map(file => ({
    id: file.id,
    title: file.name,
    document_type: 'Legal Notice',
    effective_date: file.created_at,
    jurisdiction: 'Unknown',
    description: `File size: ${(file.file_size / 1024).toFixed(1)} KB • Uploaded by: ${file.uploaded_by}`,
    compliance_status: 'compliant' as const,
    priority: 'medium' as const,
    issuing_authority: 'Legal Department',
    tags: ['legal', 'notice']
  }));

  const filteredNotices = transformedNotices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || notice.document_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || notice.compliance_status === selectedStatus;
    const matchesJurisdiction = selectedJurisdiction === 'all' || notice.jurisdiction === selectedJurisdiction;
    
    return matchesSearch && matchesType && matchesStatus && matchesJurisdiction;
  });

  const documentTypes = [...new Set(transformedNotices.map(n => n.document_type))];
  const jurisdictions = [...new Set(transformedNotices.map(n => n.jurisdiction))];

  const handleDownload = async (notice: LegalNotice) => {
    try {
      await logVaultDownload('legal_notice', notice.id, notice.title);
      
      // Find the original file
      const originalFile = files.find(f => f.id === notice.id);
      if (originalFile) {
        const downloadUrl = await downloadFile(originalFile);
        window.open(downloadUrl, '_blank');
        toast({
          title: "Download Started",
          description: `Downloading ${notice.title}`,
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleView = async (notice: LegalNotice) => {
    await logVaultView('legal_notice', notice.id, notice.title);
    setViewerDocument({
      id: notice.id,
      title: notice.title,
      content: notice.description,
      document_type: 'Legal Notice',
      created_at: notice.effective_date,
      tags: notice.tags
    });
  };

  const handleUploadSuccess = async () => {
    await logVaultUpload('legal_notice', 'Legal notice uploaded');
    setUploadModalOpen(false);
    refetch();
    toast({
      title: "Upload Successful",
      description: "Legal notice has been uploaded successfully.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <StandardPageLayout
      title="Legal Notices"
      subtitle="Regulatory compliance documents and legal notifications"
      badge="Legal Compliance"
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
              placeholder="Search notices, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Document Types</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Jurisdictions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jurisdictions</SelectItem>
              {jurisdictions.map(jurisdiction => (
                <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `${filteredNotices.length} notice${filteredNotices.length !== 1 ? 's' : ''} found`}
        </p>
        <div className="flex gap-2">
          {canManage && (
            <Button variant="default" size="sm" onClick={() => setUploadModalOpen(true)}>
              <Scale className="h-4 w-4 mr-2" />
              Upload Notice
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Compliance Report
          </Button>
        </div>
      </div>

      {/* Legal Notices Grid */}
      <VaultErrorBoundary>
        {loading ? (
          <DocumentGridSkeleton count={6} />
        ) : error ? (
          <Card>
            <CardContent className="text-center py-12">
              <Scale className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading legal notices</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredNotices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No legal notices found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'No legal notices have been added yet'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.map((notice) => (
            <Card key={notice.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight mb-2">{notice.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{notice.document_type}</Badge>
                      <Badge className={`${getStatusColor(notice.compliance_status)} border`}>
                        {notice.compliance_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className={`h-5 w-5 ${getPriorityColor(notice.priority)}`} />
                    <Scale className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {notice.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{notice.jurisdiction}</span>
                    <span className="text-muted-foreground">• {notice.issuing_authority}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Effective: {formatDate(notice.effective_date)}</span>
                  </div>
                  
                  {notice.expiry_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Expires: {formatDate(notice.expiry_date)}</span>
                    </div>
                  )}
                  
                  {notice.notice_number && (
                    <div className="text-xs text-muted-foreground">
                      Notice #{notice.notice_number}
                    </div>
                  )}
                  
                  {notice.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {notice.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {notice.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{notice.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(notice)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(notice)}>
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
        onSuccess={handleUploadSuccess}
        uploadType="legal_notice"
        title="Upload Legal Notice"
      />
    </StandardPageLayout>
  );
};