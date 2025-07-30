import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';
import { getCertificateByNumber } from '@/services/certificateService';
import type { CertificateData } from '@/services/certificateService';
import { format } from 'date-fns';

export const CertificateVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const certificateId = searchParams.get('id');

  useEffect(() => {
    const loadCertificate = async () => {
      if (!certificateId) {
        setError('No certificate ID provided');
        setLoading(false);
        return;
      }

      try {
        const cert = await getCertificateByNumber(certificateId);
        if (!cert) {
          setError('Certificate not found');
        } else {
          setCertificate(cert);
        }
      } catch (err) {
        console.error('Error loading certificate:', err);
        setError('Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Certificate Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Certificate Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              The certificate you're looking for could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = certificate.expiration_date && new Date(certificate.expiration_date) < new Date();
  const isRevoked = certificate.status === 'revoked';
  const isValid = !isExpired && !isRevoked;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isValid ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isValid ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Award className="h-6 w-6" />
            Certificate Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Badge 
              variant={isValid ? 'default' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {isRevoked ? '❌ Certificate Revoked' : 
               isExpired ? '❌ Certificate Expired' : 
               '✅ Certificate Verified'}
            </Badge>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Learner Name</h4>
                <p className="text-lg font-medium">{certificate.learner_name}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Course Title</h4>
                <p className="text-lg font-medium">{certificate.course_title}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Completion Date</h4>
                <p className="text-lg font-medium">
                  {format(new Date(certificate.completion_date), 'MMMM dd, yyyy')}
                </p>
              </div>
              
              {certificate.score && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Score</h4>
                  <p className="text-lg font-medium">{certificate.score}%</p>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Instructor</h4>
                <p className="text-lg font-medium">{certificate.instructor_name}</p>
              </div>
              
              {certificate.expiration_date && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {isExpired ? 'Expired On' : 'Valid Until'}
                  </h4>
                  <p className={`text-lg font-medium ${isExpired ? 'text-destructive' : ''}`}>
                    {format(new Date(certificate.expiration_date), 'MMMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>Certificate ID: {certificate.certificate_number}</p>
              <p>Issued on: {format(new Date(certificate.created_at), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};