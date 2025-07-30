import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Eye, Calendar } from 'lucide-react';
import { getUserCertificates, type CertificateData } from '@/services/certificateService';
import { CertificateModule } from '@/components/certificates/CertificateModule';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock user ID - in real app, this would come from auth context
const MOCK_USER_ID = 'current-user-id';

export const LearnerCertificates = () => {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await getUserCertificates(MOCK_USER_ID);
      setCertificates(data);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your certificates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const activeCertificates = certificates.filter(cert => cert.status === 'active');
  const expiredCertificates = certificates.filter(cert => {
    if (!cert.expiration_date) return false;
    return new Date(cert.expiration_date) < new Date();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Certificates</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeCertificates.length}</div>
                <div className="text-sm text-muted-foreground">Active Certificates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{expiredCertificates.length}</div>
                <div className="text-sm text-muted-foreground">Expired Certificates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{certificates.length}</div>
                <div className="text-sm text-muted-foreground">Total Certificates</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading your certificates...</div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
              <p>Complete training courses to earn certificates that will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Completed On</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((certificate) => {
                  const isExpired = certificate.expiration_date && 
                    new Date(certificate.expiration_date) < new Date();
                  
                  return (
                    <TableRow key={certificate.id}>
                      <TableCell className="font-medium">
                        {certificate.course_title}
                      </TableCell>
                      <TableCell>
                        {format(new Date(certificate.completion_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {certificate.score ? `${certificate.score}%` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            certificate.status === 'revoked' ? 'destructive' :
                            isExpired ? 'secondary' : 'default'
                          }
                        >
                          {certificate.status === 'revoked' ? 'Revoked' :
                           isExpired ? 'Expired' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedCertificate(certificate)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                              <DialogHeader>
                                <DialogTitle>Certificate</DialogTitle>
                              </DialogHeader>
                              {selectedCertificate && (
                                <CertificateModule
                                  initialData={{
                                    learnerName: selectedCertificate.learner_name,
                                    courseTitle: selectedCertificate.course_title,
                                    completionDate: new Date(selectedCertificate.completion_date),
                                    score: selectedCertificate.score,
                                    instructor: selectedCertificate.instructor_name,
                                    certificateNumber: selectedCertificate.certificate_number,
                                    expirationDate: selectedCertificate.expiration_date ? 
                                      new Date(selectedCertificate.expiration_date) : undefined
                                  }}
                                  readonly={true}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};