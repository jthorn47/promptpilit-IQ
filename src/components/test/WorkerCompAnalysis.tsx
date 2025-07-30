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

const WorkerCompAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [workerCompData, setWorkerCompData] = useState<WorkerCompCode[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[][]>([]);
  const [rawData, setRawData] = useState<any[][]>([]);
  const { toast } = useToast();

  const loadWorkerCompFile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/worker-comp-codes-2024.xlsx');
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
      setRawData(data as any[][]);
      
      // Try to parse worker comp codes with better logic
      const parsedCodes = parseWorkerCompCodes(data as any[][]);
      setWorkerCompData(parsedCodes);
      
      console.log('Worker Comp Sheets:', sheets);
      console.log('Total rows in Excel:', data.length);
      console.log('Sample data (first 20 rows):', data.slice(0, 20));
      console.log('Parsed codes count:', parsedCodes.length);
      console.log('First 10 parsed codes:', parsedCodes.slice(0, 10));
      
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
    
    console.log('Raw data structure analysis:');
    console.log('Total rows:', data.length);
    console.log('First 5 rows:', data.slice(0, 5));
    console.log('Sample row lengths:', data.slice(0, 10).map(row => row?.length || 0));
    
    // Let's manually examine the structure and find the correct columns
    let headerRowIndex = -1;
    let codeColumnIndex = -1;
    let descriptionColumnIndex = -1;
    let rateColumnIndex = -1;
    
    // Check first 20 rows for headers - be more thorough
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      console.log(`Row ${i}:`, row);
      
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j] || '').toLowerCase().trim();
        
        // Look for code column - be more flexible
        if (cell.includes('code') || cell.includes('class') || cell === 'wc code' || 
            cell === 'class code' || cell === 'wc class code' || cell.includes('classification')) {
          headerRowIndex = i;
          codeColumnIndex = j;
          console.log(`Found potential code column at row ${i}, col ${j}: "${cell}"`);
        }
        
        // Look for description column
        if (cell.includes('description') || cell.includes('occupation') || 
            cell.includes('class description') || cell.includes('industry')) {
          descriptionColumnIndex = j;
          console.log(`Found potential description column at row ${i}, col ${j}: "${cell}"`);
        }
        
        // Look for rate column
        if (cell.includes('rate') || cell.includes('premium') || cell.includes('basic rate') || 
            cell.includes('manual rate') || cell.includes('loss cost') || cell.includes('base rate')) {
          rateColumnIndex = j;
          console.log(`Found potential rate column at row ${i}, col ${j}: "${cell}"`);
        }
      }
      
      // If we found a header row, break
      if (headerRowIndex >= 0 && codeColumnIndex >= 0) break;
    }
    
    console.log('Final header analysis:', { 
      headerRowIndex, 
      codeColumnIndex, 
      descriptionColumnIndex, 
      rateColumnIndex,
      headerRow: headerRowIndex >= 0 ? data[headerRowIndex] : null
    });
    
    // If no headers found, try to detect by data patterns
    if (headerRowIndex < 0) {
      console.log('No headers found, trying pattern detection...');
      // Look for first row with numeric codes
      for (let i = 0; i < Math.min(50, data.length); i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        // Check if first few columns contain what looks like codes
        for (let j = 0; j < Math.min(5, row.length); j++) {
          const cell = String(row[j] || '').trim();
          if (/^[0-9]{4}$/.test(cell)) { // 4-digit codes
            console.log(`Found 4-digit code pattern at row ${i}, col ${j}: "${cell}"`);
            headerRowIndex = i - 1; // Assume header is one row above
            codeColumnIndex = j;
            descriptionColumnIndex = j + 1; // Assume description is next column
            rateColumnIndex = j + 2; // Assume rate is two columns over
            break;
          }
        }
        if (headerRowIndex >= 0) break;
      }
    }
    
    console.log('Pattern detection result:', { 
      headerRowIndex, 
      codeColumnIndex, 
      descriptionColumnIndex, 
      rateColumnIndex
    });
    
    // Parse the data starting from the first data row
    const startRow = Math.max(0, headerRowIndex + 1);
    console.log(`Starting to parse from row ${startRow}`);
    
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      const codeValue = String(row[codeColumnIndex] || '').trim();
      
      // Only process if we have a valid looking code
      if (codeValue && codeValue !== '' && codeValue !== 'undefined' && 
          /^[0-9A-Za-z]+$/.test(codeValue)) {
        
        const description = descriptionColumnIndex >= 0 && descriptionColumnIndex < row.length ? 
          String(row[descriptionColumnIndex] || '').trim() : '';
        const rateValue = rateColumnIndex >= 0 && rateColumnIndex < row.length ? 
          String(row[rateColumnIndex] || '0').trim() : '0';
        
        const code: WorkerCompCode = {
          code: codeValue,
          description: description,
          rate: parseFloat(rateValue) || 0
        };
        
        // Log first few codes for debugging
        if (codes.length < 10) {
          console.log(`Parsed code ${codes.length + 1}:`, code);
        }
        
        codes.push(code);
      }
    }
    
    console.log(`Successfully parsed ${codes.length} codes`);
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
      // Clear existing data first
      await supabase.from('worker_comp_codes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert worker comp codes into database
      const { error } = await supabase
        .from('worker_comp_codes')
        .insert(
          workerCompData.map(code => ({
            code: code.code,
            description: code.description,
            base_rate: (code.rate || 0) / 100, // Convert percentage to decimal
            category: determineCategory(code.code, code.description),
            hazard_level: determineHazardLevel(code.code, code.description),
            effective_year: 2024,
            state_code: 'ALL'
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
    
    // High risk
    if (codeNum >= 5000 && codeNum <= 5999) return 'High'; // Construction
    if (desc.includes('roofing') || desc.includes('logging') || desc.includes('excavation')) return 'High';
    
    // Low risk
    if (desc.includes('office') || desc.includes('clerical') || desc.includes('professional')) return 'Low';
    if (codeNum >= 8800 && codeNum <= 8900) return 'Low'; // Most office work
    
    return 'Medium';
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Worker Comp Codes Analysis: 2024 Excel File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">File Analysis:</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Excel Sheets Found: {sheetNames.join(', ')}</li>
                  <li>Total Rows in Excel: {rawData.length}</li>
                  <li>Successfully Parsed Codes: {workerCompData.length}</li>
                </ul>
              </div>
              
              <div className="space-x-2">
                <Button 
                  onClick={loadWorkerCompFile}
                  variant="outline"
                  disabled={loading}
                >
                  Reload File
                </Button>
                <Button 
                  onClick={saveToDatabase}
                  disabled={workerCompData.length === 0 || loading}
                >
                  Replace Database ({workerCompData.length} codes)
                </Button>
              </div>
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
                        <th className="border px-2 py-1">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workerCompData.slice(0, 20).map((code, index) => (
                        <tr key={index}>
                          <td className="border px-2 py-1">{code.code}</td>
                          <td className="border px-2 py-1 max-w-md truncate">{code.description}</td>
                          <td className="border px-2 py-1">{code.rate || 'N/A'}</td>
                          <td className="border px-2 py-1">{determineCategory(code.code, code.description)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Show raw sample data */}
            <div>
              <h4 className="font-semibold mb-2">Raw Excel Data Sample (first 15 rows):</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      {Array.from({ length: 8 }, (_, i) => (
                        <th key={i} className="border px-2 py-1">Column {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.slice(0, 15).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array.from({ length: 8 }, (_, cellIndex) => (
                          <td key={cellIndex} className="border px-2 py-1 max-w-32 truncate">
                            {String(row[cellIndex] || '')}
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

export default WorkerCompAnalysis;