import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Users, AlertCircle } from 'lucide-react';

interface EmployeeImportStepProps {
  data: any;
  onUpdate: (section: string, data: any) => void;
  onCommentaryUpdate: (commentary: string) => void;
}

export const EmployeeImportStep: React.FC<EmployeeImportStepProps> = ({
  data,
  onUpdate,
  onCommentaryUpdate,
}) => {
  const employeeImport = data.employeeImport || {};

  const handleFileUpload = () => {
    onCommentaryUpdate('Processing employee data... I\'ll check for formatting issues and missing information.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employee Data Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div>
            <h3 className="text-lg font-medium mb-4">Step 1: Download Template</h3>
            <div className="flex gap-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Excel Template
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <h3 className="text-lg font-medium mb-4">Step 2: Upload Employee Data</h3>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drop your employee file here</p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports Excel (.xlsx) and CSV files up to 10MB
              </p>
              <Button onClick={handleFileUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>

          {/* Manual Entry Option */}
          <div>
            <h3 className="text-lg font-medium mb-4">Alternative: Manual Entry</h3>
            <Button variant="secondary">
              <Users className="w-4 h-4 mr-2" />
              Add Employees Manually
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Required Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Personal Information</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Full legal name</li>
                <li>• Social Security Number</li>
                <li>• Date of birth</li>
                <li>• Home address</li>
                <li>• Email address (optional)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Employment Details</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Job title</li>
                <li>• Pay rate and frequency</li>
                <li>• Hire date</li>
                <li>• Department (optional)</li>
                <li>• Employee ID (optional)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">HALO Tip</span>
        </div>
        <p className="text-yellow-700 mt-1">
          Employee addresses determine state and local tax withholding. Make sure addresses are current and complete for accurate tax calculations.
        </p>
      </div>
    </div>
  );
};