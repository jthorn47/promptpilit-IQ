import React, { useState, useEffect } from 'react';
import { Lock, Upload, Share, Search, FileText, Shield, Plus, FolderOpen, Scale, Award, Book, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { FileUploader } from '../components/FileUploader/FileUploader';
import { VaultFileList } from '../components/VaultFileList/VaultFileList';
import { VaultSearch } from '../components/VaultSearch/VaultSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { microservicesClient } from '@/services/api/microservices';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { useNavigate } from 'react-router-dom';
import { useVaultFiles } from '../hooks/useVaultFiles';
import type { VaultFile as VaultFileFromHook } from '../hooks/useVaultFiles';
import type { VaultStats, VaultSearchFilter } from '../types';

export const VaultHomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [files, setFiles] = useState<VaultFileFromHook[]>([]);
  const [stats, setStats] = useState<VaultStats>({ totalFiles: 0, totalSize: 0, sharedFiles: 0, recentUploads: 0 });
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState<VaultSearchFilter>({});
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canManage, deleteFile, downloadFile } = useVaultFiles();

  const loadFiles = async (filter: VaultSearchFilter = {}) => {
    try {
      setLoading(true);
      console.log('🗂️ Loading vault files via microservice...', filter);
      
      const response = await microservicesClient.getVaultFiles(filter);
      const data = response.data || [];
      console.log('🗂️ Vault files microservice result:', { data });

      // Transform data to match our VaultFile interface
      const transformedFiles: VaultFileFromHook[] = data.map((file: any) => ({
        id: file.id,
        name: file.name,
        original_name: file.original_name,
        file_path: file.file_path,
        file_size: file.file_size,
        mime_type: file.mime_type,
        uploaded_by: file.uploaded_by || 'Unknown',
        company_id: file.company_id || '',
        folder_path: file.folder_path || '/',
        checksum: file.checksum || '',
        created_at: file.created_at,
        updated_at: file.updated_at,
        version: file.version || 1,
        is_shared: file.is_shared || false,
        download_count: file.download_count || 0,
        last_accessed_at: file.last_accessed_at,
        tags: file.tags || [],
        description: file.description || ''
      }));

      setFiles(transformedFiles);

      // Load stats from microservice
      const statsResponse = await microservicesClient.getVaultStats();
      const statsData = statsResponse.data;
      
      setStats({
        totalFiles: statsData.total_files,
        totalSize: statsData.total_size,
        sharedFiles: statsData.shared_files,
        recentUploads: statsData.recent_uploads
      });

      console.log('🗂️ Vault stats from microservice:', statsData);

    } catch (error) {
      console.error('❌ Error loading vault files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🗂️ VaultHomePage mounted, loading files...');
    loadFiles();
  }, []);

  const handleUploadComplete = (files: any[]) => {
    console.log('📤 Upload completed:', files);
    loadFiles(); // Refresh the file list
    toast({
      title: "Upload Complete",
      description: "Files have been uploaded successfully",
    });
  };

  const handleSearch = (filter: VaultSearchFilter) => {
    console.log('🔍 Search filter applied:', filter);
    setSearchFilter(filter);
    loadFiles(filter);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileDownload = async (file: VaultFileFromHook) => {
    try {
      await downloadFile(file);
      toast({
        title: "Download Started",
        description: `${file.name} is being downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the file",
        variant: "destructive",
      });
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const success = await deleteFile(fileId);
      if (success) {
        toast({
          title: "File Deleted",
          description: "File has been permanently deleted",
        });
        loadFiles(); // Refresh the list
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the file",
        variant: "destructive",
      });
    }
    setDeleteFileId(null);
  };

  console.log('🗂️ VaultHomePage render - activeTab:', activeTab, 'loading:', loading, 'files:', files.length);

  return (
    <StandardPageLayout
      title="HALO Vault"
      subtitle="Secure document storage and sharing for your organization"
      badge="Enterprise Ready"
      headerActions={
        <Button 
          variant="outline" 
          onClick={() => navigate('/halo-iq')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Halo IQ
        </Button>
      }
    >

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Browse Files
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            Shared
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificates
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Vault Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              console.log('🏠 VaultHomePage: Navigating to policy archive');
              navigate('/halo-iq/vault/policy-archive');
            }}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Policy Archive</CardTitle>
                <CardDescription>
                  Access company policies and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Browse Policies
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              console.log('🏠 VaultHomePage: Navigating to training certificates');
              navigate('/halo-iq/vault/training-certificates');
            }}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Training Certificates</CardTitle>
                <CardDescription>
                  Employee training records and certificates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Certificates
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              console.log('🏠 VaultHomePage: Navigating to legal notices');
              navigate('/halo-iq/vault/legal-notices');
            }}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Legal Notices</CardTitle>
                <CardDescription>
                  Legal documents and compliance notices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Notices
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('upload')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Upload Files</CardTitle>
                <CardDescription>
                  Securely upload documents, images, and other files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Start Upload
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('shared')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <Share className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Share Files</CardTitle>
                <CardDescription>
                  Create secure links and manage file permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Manage Sharing
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('browse')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Search Files</CardTitle>
                <CardDescription>
                  Find documents quickly with advanced search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Search Vault
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Organized file structure</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Version control and history</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Bulk operations support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Advanced metadata tagging</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Role-based permissions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Secure file sharing links</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Audit trail and logging</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Enterprise-grade encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{stats.totalFiles}</div>
                <p className="text-sm text-muted-foreground">Total Files</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{formatFileSize(stats.totalSize)}</div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{stats.sharedFiles}</div>
                <p className="text-sm text-muted-foreground">Shared Files</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{stats.recentUploads}</div>
                <p className="text-sm text-muted-foreground">Recent Uploads</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Upload Documents</h2>
              <p className="text-muted-foreground">
                Upload files securely to your organization's vault. All uploads are encrypted and access-controlled.
              </p>
            </div>
            
            <FileUploader 
              onUploadComplete={handleUploadComplete}
              maxFileSize={100 * 1024 * 1024} // 100MB
              folderPath="/"
            />
          </div>
        </TabsContent>

        {/* Browse Files Tab */}
        <TabsContent value="browse" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Browse Files</h2>
                <p className="text-muted-foreground">
                  Manage and search through your uploaded documents
                </p>
              </div>
              <Button onClick={() => setActiveTab('upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
            
            <VaultSearch onSearch={handleSearch} />
            
            <VaultFileList 
              files={files} 
              loading={loading}
              onFileSelect={(file) => console.log('Selected file:', file)}
              onShareUpdate={loadFiles}
              onFileDownload={handleFileDownload}
              onFileDelete={(fileId) => setDeleteFileId(fileId)}
              canManage={canManage}
            />
          </div>
        </TabsContent>

        {/* Shared Tab */}
        <TabsContent value="shared" className="space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Shared Files</h2>
              <p className="text-muted-foreground">
                Files that have been shared with external collaborators
              </p>
            </div>
            
            <VaultFileList 
              files={files.filter(file => file.is_shared)} 
              loading={loading}
              onFileSelect={(file) => console.log('Selected shared file:', file)}
              onShareUpdate={loadFiles}
              onFileDownload={handleFileDownload}
              onFileDelete={(fileId) => setDeleteFileId(fileId)}
              canManage={canManage}
            />
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Policy Archive</h2>
            <p className="text-muted-foreground mb-4">
              Loading Policy Archive...
            </p>
            <Button onClick={() => navigate('/halo/vault/policy-archive')}>
              Go to Policy Archive
            </Button>
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Training Certificates</h2>
            <p className="text-muted-foreground mb-4">
              Loading Training Certificates...
            </p>
            <Button onClick={() => navigate('/halo/vault/training-certificates')}>
              Go to Training Certificates
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFileId} onOpenChange={() => setDeleteFileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteFileId && handleFileDelete(deleteFileId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StandardPageLayout>
  );
};