import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  RotateCcw, 
  Ban,
  Calendar,
  Filter
} from 'lucide-react';
import { CertificateModule } from '@/components/certificates/CertificateModule';
import { 
  generateCertificate, 
  getCompanyCertificates, 
  searchCertificates,
  revokeCertificate,
  reactivateCertificate,
  type CertificateData 
} from '@/services/certificateService';
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
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';

export const AdminCertificates = () => {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch all certificates. In a real app, you'd filter by company
      const data = await searchCertificates('');
      setCertificates(data);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await searchCertificates(
        searchQuery, 
        undefined, // companyId - would come from user context
        dateRange?.from && dateRange?.to ? { 
          start: dateRange.from, 
          end: dateRange.to 
        } : undefined
      );
      setCertificates(data);
    } catch (error) {
      console.error('Error searching certificates:', error);
      toast({
        title: 'Error',
        description: 'Failed to search certificates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (data: any) => {
    try {
      const certificate = await generateCertificate({
        userId: crypto.randomUUID(), // Generate a proper UUID for the user
        courseTitle: data.courseTitle,
        learnerName: data.learnerName,
        completionDate: data.completionDate,
        score: data.score,
        instructorName: data.instructor || 'Jeffrey D Thorn',
        expirationDate: data.expirationDate,
        companyId: crypto.randomUUID() // Add company ID as well
      });
      
      setCertificates(prev => [certificate, ...prev]);
      setShowGenerator(false);
      
      toast({
        title: 'Success',
        description: 'Certificate generated successfully',
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate certificate',
        variant: 'destructive'
      });
    }
  };

  const handleRevokeCertificate = async (certificateId: string) => {
    try {
      await revokeCertificate(certificateId);
      setCertificates(prev => 
        prev.map(cert => 
          cert.id === certificateId 
            ? { ...cert, status: 'revoked' as const }
            : cert
        )
      );
      
      toast({
        title: 'Success',
        description: 'Certificate revoked successfully',
      });
    } catch (error) {
      console.error('Error revoking certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke certificate',
        variant: 'destructive'
      });
    }
  };

  const handleReactivateCertificate = async (certificateId: string) => {
    try {
      await reactivateCertificate(certificateId);
      setCertificates(prev => 
        prev.map(cert => 
          cert.id === certificateId 
            ? { ...cert, status: 'active' as const }
            : cert
        )
      );
      
      toast({
        title: 'Success',
        description: 'Certificate reactivated successfully',
      });
    } catch (error) {
      console.error('Error reactivating certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to reactivate certificate',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Certificate Management</h1>
        <Button onClick={() => setShowGenerator(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Certificate
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Certificate List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Search and Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search by name, course, or certificate ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date Range</label>
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={setDateRange}
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Certificates Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificates ({certificates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading certificates...</div>
              ) : certificates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No certificates found. Generate your first certificate to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Learner</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">
                          {certificate.learner_name}
                        </TableCell>
                        <TableCell>{certificate.course_title}</TableCell>
                        <TableCell>
                          {format(new Date(certificate.completion_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {certificate.score ? `${certificate.score}%` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              certificate.status === 'active' ? 'default' :
                              certificate.status === 'revoked' ? 'destructive' : 'secondary'
                            }
                          >
                            {certificate.status}
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
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                                <DialogHeader>
                                  <DialogTitle>Certificate Preview</DialogTitle>
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
                            
                            {certificate.status === 'active' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRevokeCertificate(certificate.id)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReactivateCertificate(certificate.id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {certificates.filter(c => c.status === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Certificates</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    {certificates.filter(c => c.status === 'revoked').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Revoked Certificates</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {certificates.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Certificates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Certificate Generator Dialog */}
      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Generate New Certificate</DialogTitle>
          </DialogHeader>
          <CertificateModule onSave={handleGenerateCertificate} />
        </DialogContent>
      </Dialog>
    </div>
  );
};