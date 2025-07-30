// Employee Documents Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Eye, Search, Upload, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: 'w2' | 'w4' | 'handbook' | 'policy' | 'form' | 'certificate' | 'paystub' | 'benefits';
  category: 'tax_documents' | 'hr_documents' | 'benefits' | 'policies' | 'personal';
  size: number;
  uploadDate: string;
  lastAccessed?: string;
  downloadUrl: string;
  isRequired?: boolean;
  status?: 'pending' | 'approved' | 'expired';
  expirationDate?: string;
}

export const EmployeeDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: '2023 W-2 Tax Form',
        type: 'w2',
        category: 'tax_documents',
        size: 245760,
        uploadDate: '2024-01-15',
        downloadUrl: '/documents/w2-2023.pdf',
        isRequired: false,
        status: 'approved'
      },
      {
        id: '2',
        name: 'W-4 Employee Withholding',
        type: 'w4',
        category: 'tax_documents',
        size: 156432,
        uploadDate: '2023-11-10',
        lastAccessed: '2024-01-08',
        downloadUrl: '/documents/w4-current.pdf',
        isRequired: true,
        status: 'approved'
      },
      {
        id: '3',
        name: 'Employee Handbook 2024',
        type: 'handbook',
        category: 'hr_documents',
        size: 2048576,
        uploadDate: '2024-01-01',
        lastAccessed: '2024-01-12',
        downloadUrl: '/documents/handbook-2024.pdf',
        isRequired: true,
        status: 'approved'
      },
      {
        id: '4',
        name: 'Safety Training Certificate',
        type: 'certificate',
        category: 'personal',
        size: 89452,
        uploadDate: '2024-01-10',
        downloadUrl: '/documents/safety-cert.pdf',
        expirationDate: '2025-01-10',
        status: 'approved'
      },
      {
        id: '5',
        name: 'Benefits Enrollment Form',
        type: 'benefits',
        category: 'benefits',
        size: 198756,
        uploadDate: '2023-12-01',
        downloadUrl: '/documents/benefits-enrollment.pdf',
        isRequired: true,
        status: 'pending'
      },
      {
        id: '6',
        name: 'Anti-Harassment Policy',
        type: 'policy',
        category: 'policies',
        size: 567890,
        uploadDate: '2024-01-01',
        lastAccessed: '2024-01-14',
        downloadUrl: '/documents/anti-harassment-policy.pdf',
        isRequired: true,
        status: 'approved'
      }
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDownload = (document: Document) => {
    toast({
      title: "Download Started",
      description: `Downloading "${document.name}"`
    });
    // Implement actual download
  };

  const handleView = (document: Document) => {
    toast({
      title: "Opening Document",
      description: `Viewing "${document.name}"`
    });
    // Update last accessed
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, lastAccessed: new Date().toISOString().split('T')[0] }
          : doc
      )
    );
  };

  const getTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'w2':
      case 'w4':
        return '📋';
      case 'handbook':
        return '📖';
      case 'policy':
        return '📜';
      case 'certificate':
        return '🏆';
      case 'benefits':
        return '🏥';
      case 'paystub':
        return '💰';
      default:
        return '📄';
    }
  };

  const getStatusBadge = (status?: Document['status']) => {
    if (!status) return null;
    
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const documentsByCategory = {
    tax_documents: documents.filter(d => d.category === 'tax_documents').length,
    hr_documents: documents.filter(d => d.category === 'hr_documents').length,
    benefits: documents.filter(d => d.category === 'benefits').length,
    policies: documents.filter(d => d.category === 'policies').length,
    personal: documents.filter(d => d.category === 'personal').length
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="text-muted-foreground">
            Access your personal documents, forms, and company policies
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Document Categories */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory('tax_documents')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-sm">Tax Documents</h3>
            <p className="text-xs text-muted-foreground">{documentsByCategory.tax_documents} files</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory('hr_documents')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-sm">HR Documents</h3>
            <p className="text-xs text-muted-foreground">{documentsByCategory.hr_documents} files</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory('benefits')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🏥</div>
            <h3 className="font-semibold text-sm">Benefits</h3>
            <p className="text-xs text-muted-foreground">{documentsByCategory.benefits} files</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory('policies')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📜</div>
            <h3 className="font-semibold text-sm">Policies</h3>
            <p className="text-xs text-muted-foreground">{documentsByCategory.policies} files</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory('personal')}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibold text-sm">Personal</h3>
            <p className="text-xs text-muted-foreground">{documentsByCategory.personal} files</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => setSelectedCategory('all')}>
              All Documents
            </Button>
          </div>

          {/* Documents Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getTypeIcon(document.type)}</span>
                        <div>
                          <div className="font-medium">{document.name}</div>
                          {document.isRequired && (
                            <div className="flex items-center text-xs text-red-600">
                              <Shield className="h-3 w-3 mr-1" />
                              Required
                            </div>
                          )}
                          {document.expirationDate && (
                            <div className="flex items-center text-xs text-yellow-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              Expires: {new Date(document.expirationDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{document.category.replace('_', ' ')}</TableCell>
                    <TableCell>{formatFileSize(document.size)}</TableCell>
                    <TableCell>{new Date(document.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(document.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(document)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};