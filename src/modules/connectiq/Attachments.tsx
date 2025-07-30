import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Image, Download, Calendar } from 'lucide-react';

const Attachments = () => {
  const sampleAttachments = [
    {
      id: '1',
      name: 'Proposal_AcmeCorp_2024.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'John Smith',
      uploadedAt: '2024-01-15',
      linkedTo: 'Acme Corporation - Deal',
      category: 'proposal'
    },
    {
      id: '2',
      name: 'contract_signed.pdf',
      type: 'pdf',
      size: '1.8 MB',
      uploadedBy: 'Jane Doe',
      uploadedAt: '2024-01-14',
      linkedTo: 'Tech Solutions - Contract',
      category: 'contract'
    },
    {
      id: '3',
      name: 'product_demo_screenshot.png',
      type: 'image',
      size: '856 KB',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-13',
      linkedTo: 'StartupXYZ - Contact',
      category: 'screenshot'
    },
    {
      id: '4',
      name: 'requirements_document.docx',
      type: 'document',
      size: '1.2 MB',
      uploadedBy: 'Sarah Wilson',
      uploadedAt: '2024-01-12',
      linkedTo: 'Innovation Labs - Project',
      category: 'requirements'
    }
  ];

  const getFileIcon = (type: string) => {
    if (type === 'image') return Image;
    return FileText;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'proposal': return 'default';
      case 'contract': return 'secondary';
      case 'screenshot': return 'outline';
      case 'requirements': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <StandardPageLayout 
      title="Attachments"
      subtitle="Manage files and documents"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">File Management</h2>
            <p className="text-muted-foreground">All customer-related files and attachments</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleAttachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.type);
            return (
              <Card key={attachment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-5 w-5" />
                      <CardTitle className="text-sm break-all">{attachment.name}</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <span className="text-sm font-medium">{attachment.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <Badge variant={getCategoryColor(attachment.category)}>
                      {attachment.category}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground">Linked to:</span>
                    </div>
                    <p className="text-sm font-medium">{attachment.linkedTo}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>By {attachment.uploadedBy}</span>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {attachment.uploadedAt}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default Attachments;