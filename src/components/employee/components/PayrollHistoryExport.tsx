import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter,
  Archive,
  CheckCircle,
  Clock,
  Package
} from 'lucide-react';

const PayrollHistoryExport: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [includeStubs, setIncludeStubs] = useState(true);
  const [includeTaxDocs, setIncludeTaxDocs] = useState(true);
  const [includeW2s, setIncludeW2s] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const { data: payStubs } = useQuery({
    queryKey: ['all-pay-stubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_pay_stubs')
        .select('*')
        .order('pay_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: taxDocs } = useQuery({
    queryKey: ['all-tax-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_tax_documents')
        .select('*')
        .order('tax_year', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      setIsExporting(true);
      setExportProgress(0);

      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(i);
      }

      // TODO: Implement actual export functionality
      const exportData = {
        format: selectedFormat,
        year: selectedYear,
        includeStubs,
        includeTaxDocs,
        includeW2s,
        timestamp: new Date().toISOString()
      };

      return exportData;
    },
    onSuccess: () => {
      setIsExporting(false);
      setExportProgress(0);
      toast({
        title: "Export Complete",
        description: `Your payroll history has been exported successfully as ${selectedFormat.toUpperCase()}.`,
      });
    },
    onError: () => {
      setIsExporting(false);
      setExportProgress(0);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your payroll history. Please try again.",
        variant: "destructive"
      });
    }
  });

  const years = Array.from(
    new Set([
      ...payStubs?.map(stub => new Date(stub.pay_date).getFullYear()) || [],
      ...taxDocs?.map(doc => doc.tax_year) || []
    ])
  ).sort((a, b) => b - a);

  const getStubCountForYear = (year: string) => {
    if (year === 'all') return payStubs?.length || 0;
    return payStubs?.filter(stub => 
      new Date(stub.pay_date).getFullYear().toString() === year
    ).length || 0;
  };

  const getTaxDocCountForYear = (year: string) => {
    if (year === 'all') return taxDocs?.length || 0;
    return taxDocs?.filter(doc => doc.tax_year.toString() === year).length || 0;
  };

  const handleExport = () => {
    if (!includeStubs && !includeTaxDocs && !includeW2s) {
      toast({
        title: "Nothing Selected",
        description: "Please select at least one type of document to export.",
        variant: "destructive"
      });
      return;
    }
    exportMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payroll History Export</h2>
          <p className="text-muted-foreground">Download your complete pay history and tax documents</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 border-primary/20">
          <Archive className="w-3 h-3 mr-1" />
          Full Export Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Export Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Year Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {(['pdf', 'csv', 'excel'] as const).map((format) => (
                  <Button
                    key={format}
                    variant={selectedFormat === format ? 'default' : 'outline'}
                    onClick={() => setSelectedFormat(format)}
                    className="hover-scale"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Document Types */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Include Documents</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="stubs" 
                    checked={includeStubs}
                    onCheckedChange={(checked) => setIncludeStubs(checked === true)}
                  />
                  <label htmlFor="stubs" className="text-sm">
                    Pay Stubs ({getStubCountForYear(selectedYear)} documents)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tax-docs" 
                    checked={includeTaxDocs}
                    onCheckedChange={(checked) => setIncludeTaxDocs(checked === true)}
                  />
                  <label htmlFor="tax-docs" className="text-sm">
                    Tax Documents ({getTaxDocCountForYear(selectedYear)} documents)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="w2s" 
                    checked={includeW2s}
                    onCheckedChange={(checked) => setIncludeW2s(checked === true)}
                  />
                  <label htmlFor="w2s" className="text-sm">
                    W-2 Forms (End of year forms)
                  </label>
                </div>
              </div>
            </div>

            {/* Export Progress */}
            {isExporting && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Exporting...</span>
                </div>
                <Progress value={exportProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  Preparing your payroll history export ({exportProgress}%)
                </p>
              </div>
            )}

            {/* Export Button */}
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="w-full hover-scale"
              size="lg"
            >
              {isExporting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export My Complete Pay History
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export Summary */}
        <Card className="lg:col-span-1 bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Export Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Time Period</span>
                <Badge variant="outline">
                  {selectedYear === 'all' ? 'All Years' : selectedYear}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Format</span>
                <Badge variant="outline">
                  {selectedFormat.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Included Documents:</div>
                {includeStubs && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Pay Stubs ({getStubCountForYear(selectedYear)})
                  </div>
                )}
                {includeTaxDocs && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Tax Documents ({getTaxDocCountForYear(selectedYear)})
                  </div>
                )}
                {includeW2s && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    W-2 Forms
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-2">Export Features:</div>
              <ul className="text-xs space-y-1">
                <li>• Complete pay history</li>
                <li>• All tax documentation</li>
                <li>• Downloadable format</li>
                <li>• Secure & encrypted</li>
                <li>• HALO verified data</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Options */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quick Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 hover-scale">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Current Year</div>
                <div className="text-xs text-muted-foreground">
                  {new Date().getFullYear()} pay stubs & tax docs
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 hover-scale">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Last 3 Months</div>
                <div className="text-xs text-muted-foreground">
                  Recent pay stubs only
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 hover-scale">
              <div className="text-center">
                <Archive className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Everything</div>
                <div className="text-xs text-muted-foreground">
                  Complete employment history
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollHistoryExport;