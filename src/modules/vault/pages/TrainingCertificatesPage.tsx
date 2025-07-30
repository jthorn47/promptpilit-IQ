import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, Eye, Calendar, User, BookOpen, Filter, Search, ArrowLeft } from 'lucide-react';
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


interface Certificate {
  id: string;
  employee_name: string;
  employee_id: string;
  training_course: string;
  course_type: string;
  completion_date: string;
  expiry_date?: string;
  certificate_url?: string;
  score?: number;
  status: 'valid' | 'expired' | 'expiring_soon';
  issued_by: string;
  certificate_number?: string;
}

export const TrainingCertificatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [viewerDocument, setViewerDocument] = useState<any>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast } = useToast();
  const { files, loading, error, refetch, downloadFile, canManage } = useVaultFiles();
  const { isAdmin, isSuperAdmin } = useAuth();

  // Filter files for training certificates
  const certificateFiles = files.filter(file => 
    file.folder_path?.includes('training') || 
    file.folder_path?.includes('certificates') ||
    file.folder_path?.includes('certificate') ||
    file.name.toLowerCase().includes('certificate') ||
    file.name.toLowerCase().includes('training')
  );

  // Transform vault files to match display interface
  const transformedCertificates: Certificate[] = certificateFiles.map(file => {
    return {
      id: file.id,
      employee_name: file.uploaded_by || 'Unknown Employee',
      employee_id: file.uploaded_by || 'Unknown',
      training_course: file.name,
      course_type: 'Training Certificate',
      completion_date: file.created_at,
      score: 100,
      status: 'valid' as const,
      issued_by: 'Training System',
      certificate_number: file.id.slice(0, 8)
    };
  });

  const filteredCertificates = transformedCertificates.filter(cert => {
    const matchesSearch = cert.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.training_course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.course_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = selectedCourse === 'all' || cert.course_type === selectedCourse;
    const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const completionDate = new Date(cert.completion_date);
      const now = new Date();
      const timeDiff = now.getTime() - completionDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      switch (dateFilter) {
        case 'last_30':
          matchesDate = daysDiff <= 30;
          break;
        case 'last_90':
          matchesDate = daysDiff <= 90;
          break;
        case 'last_year':
          matchesDate = daysDiff <= 365;
          break;
      }
    }
    
    return matchesSearch && matchesCourse && matchesStatus && matchesDate;
  });

  const courseTypes = [...new Set(transformedCertificates.map(c => c.course_type))];

  const handleDownload = async (certificate: Certificate) => {
    try {
      await logVaultDownload('certificate', certificate.id, certificate.training_course);
      
      // Find the original file
      const originalFile = files.find(f => f.id === certificate.id);
      if (originalFile) {
        const downloadUrl = await downloadFile(originalFile);
        window.open(downloadUrl, '_blank');
        toast({
          title: "Download Started",
          description: `Downloading ${certificate.training_course}`,
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download certificate",
        variant: "destructive",
      });
    }
  };

  const handleView = async (certificate: Certificate) => {
    await logVaultView('certificate', certificate.id, certificate.training_course);
    setViewerDocument({
      id: certificate.id,
      title: `${certificate.training_course} - ${certificate.employee_name}`,
      mime_type: 'application/pdf',
      document_type: 'Training Certificate',
      created_at: certificate.completion_date,
      tags: ['certificate', 'training', certificate.course_type.toLowerCase()]
    });
  };

  const handleUploadSuccess = async () => {
    await logVaultUpload('certificate', 'Training certificate uploaded');
    setUploadModalOpen(false);
    refetch();
    toast({
      title: "Upload Successful",
      description: "Certificate has been uploaded successfully.",
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
      case 'valid': return 'text-green-600 bg-green-50 border-green-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'expiring_soon': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid': return 'Valid';
      case 'expired': return 'Expired';
      case 'expiring_soon': return 'Expiring Soon';
      default: return status;
    }
  };

  return (
    <StandardPageLayout
      title="Training Certificates"
      subtitle="Employee training records and certification management"
      badge="Learning & Development"
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
              placeholder="Search by employee name or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Course Types</SelectItem>
              {courseTypes.map(type => (
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
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last_30">Last 30 Days</SelectItem>
              <SelectItem value="last_90">Last 90 Days</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `${filteredCertificates.length} certificate${filteredCertificates.length !== 1 ? 's' : ''} found`}
        </p>
        <div className="flex gap-2">
          {canManage && (
            <Button variant="default" size="sm" onClick={() => setUploadModalOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Upload Certificate
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Certificates Grid */}
      <VaultErrorBoundary>
        {loading ? (
          <DocumentGridSkeleton count={6} />
        ) : error ? (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading certificates</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredCertificates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No certificates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCourse !== 'all' || selectedStatus !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'No training certificates have been issued yet'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight mb-2">{certificate.training_course}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{certificate.course_type}</Badge>
                      <Badge className={`${getStatusColor(certificate.status)} border`}>
                        {getStatusLabel(certificate.status)}
                      </Badge>
                    </div>
                  </div>
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{certificate.employee_name}</span>
                    <span className="text-muted-foreground">({certificate.employee_id})</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Completed: {formatDate(certificate.completion_date)}</span>
                  </div>
                  
                  {certificate.expiry_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Expires: {formatDate(certificate.expiry_date)}</span>
                    </div>
                  )}
                  
                  {certificate.score && (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>Score: <span className="font-medium">{certificate.score}%</span></span>
                    </div>
                  )}
                  
                  {certificate.certificate_number && (
                    <div className="text-xs text-muted-foreground">
                      Certificate #{certificate.certificate_number}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(certificate)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(certificate)}>
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
        uploadType="document"
        title="Upload Training Certificate"
      />
    </StandardPageLayout>
  );
};