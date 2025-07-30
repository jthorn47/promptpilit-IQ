import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkerCompCode {
  code: string;
  description: string;
  rate?: number;
  category?: string;
  hazardLevel?: string;
}

const WorkerCompParser = () => {
  const [loading, setLoading] = useState(false);
  const [workerCompData, setWorkerCompData] = useState<WorkerCompCode[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[][]>([]);
  const { toast } = useToast();

  const loadWorkerCompFile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/Worker_Comp_Codes_2024.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheets = workbook.SheetNames;
      setSheetNames(sheets);
      
      // Parse the first sheet
      const firstSheet = workbook.Sheets[sheets[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { 
        header: 1, 
        defval: '',
        raw: false 
      });
      
      setSampleData(data as any[][]);
      
      // Try to parse worker comp codes
      const parsedCodes = parseWorkerCompCodes(data as any[][]);
      setWorkerCompData(parsedCodes);
      
      console.log('Worker Comp Sheets:', sheets);
      console.log('Sample data (first 10 rows):', data.slice(0, 10));
      console.log('Parsed codes (first 10):', parsedCodes.slice(0, 10));
      
    } catch (error) {
      console.error('Error loading Worker Comp file:', error);
      toast({
        title: "Error",
        description: "Failed to load Worker Comp codes file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseWorkerCompCodes = (data: any[][]): WorkerCompCode[] => {
    const codes: WorkerCompCode[] = [];
    
    // Find header row - look for columns that might contain codes/descriptions
    let headerRowIndex = -1;
    let codeColumnIndex = -1;
    let descriptionColumnIndex = -1;
    let rateColumnIndex = -1;
    
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j]).toLowerCase();
        if (cell.includes('code') || cell.includes('class')) {
          headerRowIndex = i;
          codeColumnIndex = j;
        }
        if (cell.includes('description') || cell.includes('occupation')) {
          descriptionColumnIndex = j;
        }
        if (cell.includes('rate') || cell.includes('premium')) {
          rateColumnIndex = j;
        }
      }
      if (headerRowIndex >= 0) break;
    }
    
    console.log('Header analysis:', { headerRowIndex, codeColumnIndex, descriptionColumnIndex, rateColumnIndex });
    
    // If we found headers, parse the data
    if (headerRowIndex >= 0 && codeColumnIndex >= 0) {
      for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i];
        if (row[codeColumnIndex] && row[codeColumnIndex] !== '') {
          const code: WorkerCompCode = {
            code: String(row[codeColumnIndex]).trim(),
            description: descriptionColumnIndex >= 0 ? String(row[descriptionColumnIndex] || '').trim() : '',
            rate: rateColumnIndex >= 0 ? parseFloat(String(row[rateColumnIndex])) || undefined : undefined
          };
          
          if (code.code && code.code.length > 0) {
            codes.push(code);
          }
        }
      }
    }
    
    return codes;
  };

  const saveToDatabase = async () => {
    if (workerCompData.length === 0) {
      toast({
        title: "No Data",
        description: "No Worker Comp codes found to save",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Insert worker comp codes into database
      const { error } = await supabase
        .from('worker_comp_codes')
        .insert(
          workerCompData.map(code => ({
            code: code.code,
            description: code.description,
            base_rate: code.rate || 0,
            category: code.category || 'General',
            hazard_level: code.hazardLevel || 'Medium',
            effective_year: 2024
          }))
        );
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Saved ${workerCompData.length} Worker Comp codes to database`,
      });
    } catch (error) {
      console.error('Error saving to database:', error);
      toast({
        title: "Error", 
        description: "Failed to save Worker Comp codes to database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerCompFile();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading Worker Comp codes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Worker Comp Codes Analysis: 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">File Analysis:</h3>
                <ul className="list-disc list-inside text-sm">
                  <li>Sheets Found: {sheetNames.join(', ')}</li>
                  <li>Parsed Codes: {workerCompData.length}</li>
                  <li>Sample Rows: {sampleData.length}</li>
                </ul>
              </div>
              
              <Button 
                onClick={saveToDatabase}
                disabled={workerCompData.length === 0}
                className="ml-4"
              >
                Save to Database ({workerCompData.length} codes)
              </Button>
            </div>
            
            {/* Show sample of parsed data */}
            {workerCompData.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Sample Parsed Worker Comp Codes:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-2 py-1">Code</th>
                        <th className="border px-2 py-1">Description</th>
                        <th className="border px-2 py-1">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workerCompData.slice(0, 10).map((code, index) => (
                        <tr key={index}>
                          <td className="border px-2 py-1">{code.code}</td>
                          <td className="border px-2 py-1 max-w-md truncate">{code.description}</td>
                          <td className="border px-2 py-1">{code.rate || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Show raw sample data */}
            <div>
              <h4 className="font-semibold mb-2">Raw Data Sample (first 5 rows):</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-xs">
                  <tbody>
                    {sampleData.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.slice(0, 6).map((cell, cellIndex) => (
                          <td key={cellIndex} className="border px-2 py-1 max-w-32 truncate">
                            {String(cell || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerCompParser;