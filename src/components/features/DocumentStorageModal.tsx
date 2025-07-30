import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Folder, 
  Search, 
  MoreVertical,
  Download,
  Share,
  Trash2,
  Eye,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
  status: 'active' | 'archived' | 'pending';
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Employee Handbook 2024.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadDate: '2024-01-15',
    category: 'HR Policies',
    status: 'active'
  },
  {
    id: '2',
    name: 'Payroll Reports Q1.xlsx',
    type: 'XLSX',
    size: '1.8 MB',
    uploadDate: '2024-01-10',
    category: 'Finance',
    status: 'active'
  },
  {
    id: '3',
    name: 'Training Materials.zip',
    type: 'ZIP',
    size: '15.6 MB',
    uploadDate: '2024-01-05',
    category: 'Training',
    status: 'active'
  },
  {
    id: '4',
    name: 'Compliance Report 2023.pdf',
    type: 'PDF',
    size: '3.2 MB',
    uploadDate: '2023-12-20',
    category: 'Compliance',
    status: 'archived'
  }
];

export const DocumentStorageModal: React.FC<DocumentStorageModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} is ready to upload.`,
      });
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} has been uploaded to the vault.`,
      });
      setSelectedFile(null);
    }
  };

  const filteredDocuments = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">{/* Added overflow-y-auto for scrolling */}
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Document Storage</span>
          </DialogTitle>
          <DialogDescription>
            Securely store, organize, and manage your business documents
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Folder className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </div>

            <div className="border rounded-lg">
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 text-sm font-medium">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Upload Date</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Actions</div>
              </div>

              <div className="divide-y max-h-64 overflow-y-auto">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="grid grid-cols-12 gap-4 p-3 hover:bg-muted/30">
                    <div className="col-span-4 flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {doc.type}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {doc.size}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {doc.uploadDate}
                    </div>
                    <div className="col-span-1">
                      <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Upload new documents to your secure vault
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Drop files here or click to browse
                    </p>
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      className="max-w-xs mx-auto"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.jpg,.png"
                    />
                  </div>
                </div>

                {selectedFile && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button onClick={handleUpload}>
                        Upload
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['HR Policies', 'Finance', 'Training', 'Compliance', 'Legal', 'Marketing', 'Operations', 'IT'].map((category) => (
                <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Folder className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">{category}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Math.floor(Math.random() * 20) + 1} files
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};