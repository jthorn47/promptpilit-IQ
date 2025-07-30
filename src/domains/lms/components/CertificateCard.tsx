import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CertificateWithDetails } from '../types';
import { 
  Download, 
  Eye, 
  Award,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface CertificateCardProps {
  certificate: CertificateWithDetails;
  onView?: (certificate: CertificateWithDetails) => void;
  onDownload?: (certificate: CertificateWithDetails) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onView,
  onDownload
}) => {
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
    <Card className="hover:shadow-md transition-shadow">
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
            {onView && (
              <Button size="sm" variant="outline" onClick={() => onView(certificate)}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            {onDownload && (
              <Button size="sm" variant="outline" onClick={() => onDownload(certificate)}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};