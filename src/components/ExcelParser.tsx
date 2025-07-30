import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExcelData {
  sheetNames: string[];
  sheets: Record<string, any[][]>;
  formulas: Record<string, Record<string, string>>;
}

const ExcelParser = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadExcelFile = async () => {
    setLoading(true);
    try {
      // Load the downloaded Excel file
      const response = await fetch('/PropGEN_v1.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      
      // Parse with xlsx
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellFormula: true });
      
      const sheetNames = workbook.SheetNames;
      const sheets: Record<string, any[][]> = {};
      const formulas: Record<string, Record<string, string>> = {};
      
      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        
        // Get the data
        sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          defval: '',
          raw: false 
        });
        
        // Extract formulas
        formulas[sheetName] = {};
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellAddress];
            
            if (cell && cell.f) {
              formulas[sheetName][cellAddress] = cell.f;
            }
          }
        }
      });
      
      setExcelData({ sheetNames, sheets, formulas });
    } catch (error) {
      console.error('Error loading Excel file:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExcelFile();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading Excel file...</div>
        </CardContent>
      </Card>
    );
  }

  if (!excelData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Failed to load Excel file</div>
          <Button onClick={loadExcelFile} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Excel File Analysis: PropGEN v1.xlsx</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Sheets Found:</h3>
              <ul className="list-disc list-inside">
                {excelData.sheetNames.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {excelData.sheetNames.map(sheetName => (
        <Card key={sheetName}>
          <CardHeader>
            <CardTitle>Sheet: {sheetName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Show first few rows of data */}
              <div>
                <h4 className="font-semibold mb-2">Data Preview:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <tbody>
                      {excelData.sheets[sheetName].slice(0, 20).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          {row.slice(0, 10).map((cell, cellIndex) => (
                            <td key={cellIndex} className="border-r p-2 text-sm">
                              {String(cell || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Show formulas if any */}
              {Object.keys(excelData.formulas[sheetName]).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Formulas Found:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(excelData.formulas[sheetName]).map(([cell, formula]) => (
                      <div key={cell} className="text-sm">
                        <strong>{cell}:</strong> {formula}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExcelParser;