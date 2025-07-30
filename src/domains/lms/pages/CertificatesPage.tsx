import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCertificates } from '../hooks/useCertificates';
import { 
  Search, 
  Plus, 
  Award, 
  Download, 
  Eye,
  Filter,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { 
    certificates, 
    isLoading, 
    error,
    createCertificate,
    updateCertificate,
    isCreating,
    isUpdating
  } = useCertificates({
    search: searchTerm,
    status: statusFilter || undefined
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-lg">Loading certificates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading certificates</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
      case 'revoked':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Award className="h-4 w-4 text-gray-400" />;
    }
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
          <p className="text-muted-foreground">
            Manage and track training certificates for your organization
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Certificate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search certificates..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Certificates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getStatusIcon(certificate.status || 'active')}
                  <CardTitle className="text-lg">{certificate.certificate_number}</CardTitle>
                </div>
                {getStatusBadge(certificate.status || 'active')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">{certificate.learner_name}</h4>
                  <p className="text-sm text-muted-foreground">{certificate.course_title}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Issued:</span>
                    <div>{new Date(certificate.issued_at).toLocaleDateString()}</div>
                  </div>
                  {certificate.expires_at && (
                    <div>
                      <span className="font-medium">Expires:</span>
                      <div className={isExpired(certificate.expires_at) ? 'text-red-600' : ''}>
                        {new Date(certificate.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                {certificate.score && (
                  <div>
                    <span className="text-xs text-muted-foreground">Score: </span>
                    <span className="font-medium">{certificate.score}%</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {certificates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No certificates found</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first certificate when employees complete training.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Certificate
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};