import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Award, Download, Eye, Search, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MyCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock data - replace with real API call
  useEffect(() => {
    const mockCertificates = [
      {
        id: '1',
        training_module: 'Workplace Violence Prevention',
        issued_date: '2024-01-15',
        expiry_date: '2025-01-15',
        certificate_number: 'WVP-2024-001',
        status: 'active',
        pdf_url: '/certificates/wvp-cert-001.pdf'
      },
      {
        id: '2',
        training_module: 'Sexual Harassment Prevention',
        issued_date: '2023-12-10',
        expiry_date: '2024-12-10',
        certificate_number: 'SHP-2023-045',
        status: 'active',
        pdf_url: '/certificates/shp-cert-045.pdf'
      },
      {
        id: '3',
        training_module: 'Cybersecurity Awareness',
        issued_date: '2023-11-20',
        expiry_date: '2024-11-20',
        certificate_number: 'CYB-2023-122',
        status: 'expiring_soon',
        pdf_url: '/certificates/cyb-cert-122.pdf'
      },
      {
        id: '4',
        training_module: 'Safety Training',
        issued_date: '2022-06-15',
        expiry_date: '2023-06-15',
        certificate_number: 'SAF-2022-067',
        status: 'expired',
        pdf_url: '/certificates/saf-cert-067.pdf'
      }
    ];

    setTimeout(() => {
      setCertificates(mockCertificates);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCertificates = certificates.filter(cert =>
    cert.training_module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (status === 'expired' || daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary">Expiring Soon</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  const handleDownload = (certificate) => {
    toast({
      title: "Download Started",
      description: `Downloading certificate for ${certificate.training_module}`
    });
    // Implement actual download functionality
  };

  const handleView = (certificate) => {
    toast({
      title: "Opening Certificate",
      description: `Viewing certificate for ${certificate.training_module}`
    });
    // Implement view functionality
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
          <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
          <p className="text-muted-foreground">
            View and download your training certificates
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">All time earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {certificates.filter(c => {
                const today = new Date();
                const expiry = new Date(c.expiry_date);
                return expiry > today;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {certificates.filter(c => {
                const today = new Date();
                const expiry = new Date(c.expiry_date);
                const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
                return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Award className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {certificates.filter(c => {
                const today = new Date();
                const expiry = new Date(c.expiry_date);
                return expiry < today;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
            <Input
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Certificates Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Award className="h-8 w-8 text-primary" />
                    {getStatusBadge(certificate.status, certificate.expiry_date)}
                  </div>
                  <CardTitle className="text-lg">{certificate.training_module}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificate #:</span>
                      <span className="font-mono">{certificate.certificate_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issued:</span>
                      <span>{new Date(certificate.issued_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span>{new Date(certificate.expiry_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(certificate)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(certificate)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCertificates.length === 0 && (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No certificates found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};