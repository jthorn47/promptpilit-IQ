import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Eye, Trash2, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Employee = Database['public']['Tables']['employees']['Row'];

interface EmployeeDocumentsTabProps {
  employee: Employee;
  onChange: () => void;
}

export const EmployeeDocumentsTab = ({ employee, onChange }: EmployeeDocumentsTabProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  // Mock documents data - in real implementation, this would come from the database
  const documents = [
    {
      id: '1',
      name: 'Employment_Contract.pdf',
      type: 'contract',
      size: '245 KB',
      uploadedDate: '2024-01-15',
      uploadedBy: 'HR Admin',
      url: '#'
    },
    {
      id: '2',
      name: 'W4_Form.pdf',
      type: 'tax_form',
      size: '189 KB',
      uploadedDate: '2024-01-16',
      uploadedBy: 'Employee',
      url: '#'
    },
    {
      id: '3',
      name: 'Direct_Deposit_Form.pdf',
      type: 'payroll',
      size: '156 KB',
      uploadedDate: '2024-01-17',
      uploadedBy: 'Employee',
      url: '#'
    },
    {
      id: '4',
      name: 'Emergency_Contact.pdf',
      type: 'personal',
      size: '134 KB',
      uploadedDate: '2024-01-18',
      uploadedBy: 'Employee',
      url: '#'
    }
  ];

  const documentTypes = [
    { value: 'contract', label: 'Employment Contract', color: 'blue' },
    { value: 'tax_form', label: 'Tax Form', color: 'green' },
    { value: 'payroll', label: 'Payroll', color: 'purple' },
    { value: 'personal', label: 'Personal', color: 'orange' },
    { value: 'compliance', label: 'Compliance', color: 'red' },
    { value: 'training', label: 'Training', color: 'yellow' },
    { value: 'other', label: 'Other', color: 'gray' }
  ];

  const getDocumentTypeBadge = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return (
      <Badge variant="outline" className={`text-${docType?.color}-600`}>
        {docType?.label || type}
      </Badge>
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        setUploadingFiles(prev => [...prev, file.name]);
        // Simulate upload process
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(name => name !== file.name));
          onChange();
        }, 2000);
      });
    }
  };

  const handleDownload = (document: any) => {
    // Implementation for downloading document
    console.log('Downloading:', document.name);
  };

  const handleDelete = (documentId: string) => {
    // Implementation for deleting document
    console.log('Deleting document:', documentId);
    onChange();
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Choose files to upload</p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                </p>
              </div>
              <div className="relative">
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
              </div>
            </div>
          </div>

          {/* Uploading Files */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploading Files:</p>
              {uploadingFiles.map((fileName) => (
                <div key={fileName} className="flex items-center gap-2 text-sm">
                  <Upload className="h-4 w-4 animate-pulse text-blue-500" />
                  <span>{fileName}</span>
                  <span className="text-muted-foreground">Uploading...</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Employee Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground mt-2">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{document.size}</span>
                        <span>Uploaded: {new Date(document.uploadedDate).toLocaleDateString()}</span>
                        <span>By: {document.uploadedBy}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getDocumentTypeBadge(document.type)}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(document)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(document)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Document Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {documentTypes.map((type) => {
              const count = documents.filter(doc => doc.type === type.value).length;
              return (
                <div key={type.value} className="text-center p-3 border rounded-lg">
                  <p className="font-medium">{type.label}</p>
                  <p className="text-2xl font-bold text-primary">{count}</p>
                  <p className="text-xs text-muted-foreground">documents</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};