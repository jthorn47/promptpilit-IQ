import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Award, Download, Eye, Search, Calendar } from 'lucide-react';

export const MyCertificatesPortfolio: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockCertificates = [
    {
      id: '1',
      title: 'Fire Safety & Emergency Procedures',
      issuedDate: '2024-01-10',
      expiryDate: '2025-01-10',
      score: 95,
      status: 'active',
      certificateId: 'FS-2024-001'
    },
    {
      id: '2',
      title: 'CPR Certification',
      issuedDate: '2023-06-15',
      expiryDate: '2024-06-15',
      score: 88,
      status: 'expiring_soon',
      certificateId: 'CPR-2023-045'
    },
    {
      id: '3',
      title: 'First Aid Training',
      issuedDate: '2023-08-20',
      expiryDate: '2024-08-20',
      score: 92,
      status: 'active',
      certificateId: 'FA-2023-078'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'expiring_soon':
        return <Badge variant="secondary">Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCertificates = mockCertificates.filter(cert =>
    cert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        <Badge variant="secondary">Certificate Portfolio</Badge>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 active, 1 expiring soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.7%</div>
            <p className="text-xs text-muted-foreground">Excellent performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Requires renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCertificates.map((certificate) => (
          <Card key={certificate.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{certificate.title}</CardTitle>
                {getStatusBadge(certificate.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm space-y-1">
                  <div>ID: {certificate.certificateId}</div>
                  <div>Issued: {certificate.issuedDate}</div>
                  <div>Expires: {certificate.expiryDate}</div>
                  <div>Score: {certificate.score}%</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No certificates found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms.' : 'Complete courses to earn your first certificate.'}
          </p>
        </div>
      )}
    </div>
  );
};