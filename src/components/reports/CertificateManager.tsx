import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Download, Search, Calendar, Filter, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  certificateNumber: string;
  employeeName: string;
  trainingModule: string;
  completionDate: string;
  expiryDate: string | null;
  status: 'active' | 'expired' | 'expiring_soon';
  pdfUrl: string | null;
}

interface CertificateManagerProps {
  companyId?: string;
}

export function CertificateManager({ companyId }: CertificateManagerProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCertificates();
  }, [companyId, statusFilter]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('certificates')
        .select(`
          id,
          certificate_number,
          issued_at,
          expires_at,
          status,
          pdf_url,
          employees(first_name, last_name),
          training_modules(title)
        `);

      if (companyId) {
        query = query.eq('employees.company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedCertificates: Certificate[] = data?.map(cert => {
        const now = new Date();
        const expiryDate = cert.expires_at ? new Date(cert.expires_at) : null;
        let status: 'active' | 'expired' | 'expiring_soon' = 'active';

        if (expiryDate) {
          if (expiryDate < now) {
            status = 'expired';
          } else if (expiryDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) { // 30 days
            status = 'expiring_soon';
          }
        }

        return {
          id: cert.id,
          certificateNumber: cert.certificate_number,
          employeeName: `${cert.employees?.first_name} ${cert.employees?.last_name}`,
          trainingModule: cert.training_modules?.title || 'Unknown Module',
          completionDate: cert.issued_at,
          expiryDate: cert.expires_at,
          status,
          pdfUrl: cert.pdf_url
        };
      }) || [];

      // Apply status filter
      const filteredCertificates = statusFilter === 'all' 
        ? processedCertificates 
        : processedCertificates.filter(cert => cert.status === statusFilter);

      setCertificates(filteredCertificates);

    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch certificates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId: string, pdfUrl: string | null) => {
    try {
      if (!pdfUrl) {
        toast({
          title: "Certificate not available",
          description: "PDF certificate is not available for download.",
          variant: "destructive",
        });
        return;
      }

      // In a real implementation, this would handle the download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `certificate_${certificateId}.pdf`;
      link.click();

      toast({
        title: "Download started",
        description: "Certificate download has been initiated.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download certificate.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'expiring_soon':
        return (
          <Badge className="bg-yellow-500 text-white">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expiring Soon
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.trainingModule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary stats
  const totalCertificates = certificates.length;
  const activeCertificates = certificates.filter(c => c.status === 'active').length;
  const expiredCertificates = certificates.filter(c => c.status === 'expired').length;
  const expiringSoon = certificates.filter(c => c.status === 'expiring_soon').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertificates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCertificates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringSoon}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredCertificates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Tracking
          </CardTitle>
          <CardDescription>
            Manage and track all training certificates and their expiry dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Certificates Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate #</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Training Module</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((certificate) => (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-mono text-sm">
                      {certificate.certificateNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {certificate.employeeName}
                    </TableCell>
                    <TableCell>{certificate.trainingModule}</TableCell>
                    <TableCell>
                      {new Date(certificate.completionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {certificate.expiryDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(certificate.expiryDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(certificate.status)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCertificate(certificate.id, certificate.pdfUrl)}
                        disabled={!certificate.pdfUrl}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCertificates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No certificates found.</p>
              <p className="text-sm">Certificates will appear here as training is completed.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}