import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Calendar, 
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';

const TaxCenter: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: taxDocuments, isLoading } = useQuery({
    queryKey: ['tax-documents', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_tax_documents')
        .select('*')
        .eq('tax_year', selectedYear)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'corrected':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'corrected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tax Center</h2>
          <p className="text-muted-foreground">Access your tax documents and forms</p>
        </div>
        <div className="flex gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? "default" : "outline"}
              onClick={() => setSelectedYear(year)}
              className="hover-scale"
            >
              {year}
            </Button>
          ))}
        </div>
      </div>

      {/* Document Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['w2', '1099', '941', 'de9'].map((docType) => {
          const doc = taxDocuments?.find(d => d.document_type === docType);
          const available = doc?.document_status === 'available';
          
          return (
            <Card key={docType} className="bg-card/80 backdrop-blur-sm border-border/50 hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc?.document_status || 'pending')}
                    <h3 className="font-semibold uppercase">{docType}</h3>
                  </div>
                  <Badge variant={getStatusColor(doc?.document_status || 'pending')}>
                    {doc?.document_status || 'Pending'}
                  </Badge>
                </div>
                
                {doc ? (
                  <div className="space-y-3">
                    {doc.available_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Available: {new Date(doc.available_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    {available ? (
                      <Button 
                        className="w-full" 
                        onClick={() => window.open(doc.document_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    ) : (
                      <Button className="w-full" disabled>
                        <Clock className="w-4 h-4 mr-2" />
                        {doc.document_status === 'pending' ? 'Processing' : 'Unavailable'}
                      </Button>
                    )}
                    
                    {doc.correction_reason && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {doc.correction_reason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Form will be available after {selectedYear} tax processing
                    </p>
                    <Button className="w-full" disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Not Available
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dynamic Alerts */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Tax Alerts & Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                W-2 forms for {new Date().getFullYear()} will be available by January 31st, {new Date().getFullYear() + 1}.
              </AlertDescription>
            </Alert>
            
            {taxDocuments?.some(doc => doc.document_status === 'corrected') && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have corrected tax documents. Please download and review the updated forms.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All available tax documents are automatically synced with corrected data via HALOsync.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCenter;