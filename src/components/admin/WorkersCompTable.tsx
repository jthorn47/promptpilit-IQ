import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, RefreshCw, ExternalLink, Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface WorkersCompCode {
  id: string;
  code: string;
  description: string;
  base_rate: number;
  category: string;
  hazard_level: string;
  state_code: string;
  effective_year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const WorkersCompTable = () => {
  const [codes, setCodes] = useState<WorkersCompCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<WorkersCompCode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkersCompCodes();
  }, []);

  useEffect(() => {
    // Filter codes based on search term
    if (searchTerm.trim() === "") {
      setFilteredCodes(codes);
    } else {
      const filtered = codes.filter(code => 
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCodes(filtered);
    }
  }, [searchTerm, codes]);

  const loadWorkersCompCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('worker_comp_codes')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) throw error;

      setCodes(data || []);
      setFilteredCodes(data || []);
      
      if (data && data.length > 0) {
        setLastSynced(data[0].updated_at);
      }
    } catch (error) {
      console.error('Error loading workers comp codes:', error);
      toast({
        title: "Error",
        description: "Failed to load workers' compensation codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseWorkerCompCodes = (data: any[][]): any[] => {
    const codes: any[] = [];
    
    // Find the correct columns
    let headerRowIndex = -1;
    let codeColumnIndex = -1;
    let descriptionColumnIndex = -1;
    let rateColumnIndex = -1;
    
    // Check first 20 rows for headers
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j] || '').toLowerCase().trim();
        
        if (cell.includes('code') || cell.includes('class') || cell === 'wc code' || 
            cell === 'class code' || cell === 'wc class code' || cell.includes('classification')) {
          headerRowIndex = i;
          codeColumnIndex = j;
        }
        
        if (cell.includes('description') || cell.includes('occupation') || 
            cell.includes('class description') || cell.includes('industry')) {
          descriptionColumnIndex = j;
        }
        
        if (cell.includes('rate') || cell.includes('premium') || cell.includes('basic rate') || 
            cell.includes('manual rate') || cell.includes('loss cost') || cell.includes('base rate')) {
          rateColumnIndex = j;
        }
      }
      
      if (headerRowIndex >= 0 && codeColumnIndex >= 0) break;
    }
    
    // If no headers found, try pattern detection
    if (headerRowIndex < 0) {
      for (let i = 0; i < Math.min(50, data.length); i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        for (let j = 0; j < Math.min(5, row.length); j++) {
          const cell = String(row[j] || '').trim();
          if (/^[0-9]{4}$/.test(cell)) {
            headerRowIndex = i - 1;
            codeColumnIndex = j;
            descriptionColumnIndex = j + 1;
            rateColumnIndex = j + 2;
            break;
          }
        }
        if (headerRowIndex >= 0) break;
      }
    }
    
    // Parse the data
    const startRow = Math.max(0, headerRowIndex + 1);
    
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      const codeValue = String(row[codeColumnIndex] || '').trim();
      
      if (codeValue && codeValue !== '' && codeValue !== 'undefined' && 
          /^[0-9A-Za-z]+$/.test(codeValue)) {
        
        const description = descriptionColumnIndex >= 0 && descriptionColumnIndex < row.length ? 
          String(row[descriptionColumnIndex] || '').trim() : '';
        const rateValue = rateColumnIndex >= 0 && rateColumnIndex < row.length ? 
          String(row[rateColumnIndex] || '0').trim() : '0';
        
        const code = {
          code: codeValue,
          description: description,
          rate: parseFloat(rateValue) || 0
        };
        
        codes.push(code);
      }
    }
    
    return codes;
  };

  const determineCategory = (code: string, description: string): string => {
    const desc = description.toLowerCase();
    const codeNum = parseInt(code);
    
    if (codeNum >= 0 && codeNum <= 999) return 'Agriculture';
    if (codeNum >= 1000 && codeNum <= 1999) return 'Agriculture';
    if (codeNum >= 2000 && codeNum <= 3999) return 'Manufacturing';
    if (codeNum >= 4000 && codeNum <= 4999) return 'Utilities';
    if (codeNum >= 5000 && codeNum <= 5999) return 'Construction';
    if (codeNum >= 6000 && codeNum <= 6999) return 'Wholesale';
    if (codeNum >= 7000 && codeNum <= 7999) return 'Transportation';
    if (codeNum >= 8000 && codeNum <= 8999) {
      if (desc.includes('office') || desc.includes('clerical')) return 'Office';
      if (desc.includes('professional') || desc.includes('lawyer') || desc.includes('attorney')) return 'Professional';
      if (desc.includes('retail') || desc.includes('store')) return 'Retail';
      if (desc.includes('restaurant') || desc.includes('hotel')) return 'Hospitality';
      if (desc.includes('healthcare') || desc.includes('medical') || desc.includes('hospital')) return 'Healthcare';
      return 'Services';
    }
    if (codeNum >= 9000 && codeNum <= 9999) return 'Building Operations';
    
    return 'General';
  };

  const determineHazardLevel = (code: string, description: string): string => {
    const desc = description.toLowerCase();
    const codeNum = parseInt(code);
    
    if (codeNum >= 5000 && codeNum <= 5999) return 'High';
    if (desc.includes('roofing') || desc.includes('logging') || desc.includes('excavation')) return 'High';
    if (desc.includes('office') || desc.includes('clerical') || desc.includes('professional')) return 'Low';
    if (codeNum >= 8800 && codeNum <= 8900) return 'Low';
    
    return 'Medium';
  };

  const importWorkerCompCodes = async () => {
    try {
      setLoading(true);
      
      // Load Excel file
      const response = await fetch('/worker-comp-codes-2024.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { 
        header: 1, 
        defval: '',
        raw: false 
      });
      
      const parsedCodes = parseWorkerCompCodes(data as any[][]);
      
      if (parsedCodes.length === 0) {
        toast({
          title: "No Data",
          description: "No Worker Comp codes found in the Excel file",
          variant: "destructive",
        });
        return;
      }
      
      // Clear existing data first
      await supabase.from('worker_comp_codes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert worker comp codes into database
      const { error } = await supabase
        .from('worker_comp_codes')
        .insert(
          parsedCodes.map(code => ({
            code: code.code,
            description: code.description,
            base_rate: (code.rate || 0) / 100,
            category: determineCategory(code.code, code.description),
            hazard_level: determineHazardLevel(code.code, code.description),
            effective_year: 2024,
            state_code: 'ALL'
          }))
        );
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Imported ${parsedCodes.length} Worker Comp codes successfully`,
      });
      
      // Reload the data
      await loadWorkersCompCodes();
      
    } catch (error) {
      console.error('Error importing worker comp codes:', error);
      toast({
        title: "Error", 
        description: "Failed to import Worker Comp codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getHazardLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const sourceFileUrl = "https://40048518.fs1.hubspotusercontent-na1.net/hubfs/40048518/Worker%20Comp.%20Codes%202024-1.xlsx";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workers' Compensation Classification Table</h3>
          <p className="text-sm text-muted-foreground">
            Industry classification codes and base rates for workers' compensation insurance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastSynced && (
            <Badge variant="outline" className="text-xs">
              Last Synced: {new Date(lastSynced).toLocaleDateString()}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(sourceFileUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Source File
          </Button>
          <Button onClick={loadWorkersCompCodes} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Classification Codes</CardTitle>
              <CardDescription>
                {filteredCodes.length} of {codes.length} codes displayed
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading classification codes...</span>
            </div>
          ) : codes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground mb-4">
                <p className="text-lg font-medium">No Worker Comp codes found</p>
                <p className="text-sm">The database is empty. You need to import the codes first.</p>
              </div>
              <Button 
                onClick={importWorkerCompCodes}
                disabled={loading}
                variant="default"
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace Database
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-32">Category</TableHead>
                    <TableHead className="w-24">Base Rate</TableHead>
                    <TableHead className="w-24">Hazard Level</TableHead>
                    <TableHead className="w-20">State</TableHead>
                    <TableHead className="w-20">Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No codes match your search criteria' : 'No classification codes found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCodes.map((code) => (
                      <TableRow key={code.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-medium">{code.code}</TableCell>
                        <TableCell className="max-w-xs truncate" title={code.description}>
                          {code.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {code.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatRate(code.base_rate)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getHazardLevelColor(code.hazard_level)}`}>
                            {code.hazard_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {code.state_code}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {code.effective_year}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Download className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Data Source Information</p>
              <p className="text-xs text-blue-700 mt-1">
                Workers' compensation codes are sourced from the Excel file linked above. 
                This data is used globally in PropGEN Pro for calculating insurance costs and risk assessments.
                Rates shown are base rates and may be modified by additional factors during underwriting.
              </p>
              <Button
                variant="link"
                size="sm"
                className="text-blue-700 p-0 h-auto mt-2"
                onClick={() => window.open(sourceFileUrl, '_blank')}
              >
                View Source File <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};