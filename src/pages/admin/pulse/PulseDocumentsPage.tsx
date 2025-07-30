import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Search, FileText, File, Shield, Eye, Download, Share, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { format } from 'date-fns';
import { useCaseDocuments } from '@/hooks/useCaseDocuments';
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const PulseDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deleteDocument, setDeleteDocument] = useState<string | null>(null);
  
  const { 
    documents, 
    loading, 
    uploadDocument, 
    downloadDocument, 
    viewDocument, 
    deleteDocument: performDelete 
  } = useCaseDocuments();
  const { toast } = useToast();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.case_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      'verified': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'under_review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      'pending': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const handleDelete = async () => {
    if (!deleteDocument) return;
    await performDelete(deleteDocument);
    setDeleteDocument(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get unique document types for filter
  const documentTypes = Array.from(new Set(documents.map(d => d.document_type)));

  return (
    <StandardPageLayout
      title="Documents & Evidence"
      subtitle="Centralized secure storage for case-related documents"
      badge="Active"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/halo-iq/pulse')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pulse
        </Button>
        {/* Upload and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name or case ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Type Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            All Types
          </Button>
          {documentTypes.map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type)}
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Storage Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confidential</p>
                  <p className="text-2xl font-bold">{documents.filter(d => d.is_confidential).length}</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold">
                    {formatFileSize(documents.reduce((total, doc) => total + doc.file_size, 0))}
                  </p>
                </div>
                <File className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">
                    {documents.filter(d => {
                      const uploadDate = new Date(d.uploaded_at);
                      const now = new Date();
                      return uploadDate.getMonth() === now.getMonth() && 
                             uploadDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Upload className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
            <CardDescription>
              All case-related documents with secure access controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading documents...</p>
                </div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No documents found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || typeFilter !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'Upload your first document to get started'}
                </p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.file_name}</span>
                          {doc.is_confidential && (
                            <Shield className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.document_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{doc.case_id}</TableCell>
                      <TableCell>{doc.uploaded_by}</TableCell>
                      <TableCell>{format(new Date(doc.uploaded_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(doc.status)}>
                          {doc.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => viewDocument(doc)}
                            title="View document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => downloadDocument(doc)}
                            title="Download document"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setDeleteDocument(doc.id)}
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <DocumentUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteDocument} onOpenChange={(open) => !open && setDeleteDocument(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document? This action cannot be undone and will permanently remove the file from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Document
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StandardPageLayout>
  );
};