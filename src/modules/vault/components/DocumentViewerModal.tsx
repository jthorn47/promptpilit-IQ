import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    title: string;
    file_url?: string;
    pdf_url?: string;
    preview_url?: string;
    mime_type?: string;
    file_size?: number;
    file_name?: string;
    document_type?: string;
    created_at?: string;
    tags?: string[];
  } | null;
  onDownload?: (document: any) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  onDownload
}) => {
  if (!document) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document);
    }
  };

  const getFileUrl = () => {
    return document.pdf_url || document.file_url || document.preview_url;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isPdf = document.mime_type?.includes('pdf') || document.pdf_url;
  const isImage = document.mime_type?.startsWith('image/');
  const fileUrl = getFileUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold pr-8">
              {document.title}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              {document.document_type && (
                <Badge variant="outline">{document.document_type}</Badge>
              )}
              {document.file_size && (
                <Badge variant="secondary">{formatFileSize(document.file_size)}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fileUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {fileUrl ? (
            <div className="h-[60vh] border rounded-lg overflow-hidden">
              {isPdf ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-full"
                  title={document.title}
                />
              ) : isImage ? (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <img
                    src={fileUrl}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Preview not available for this file type
                    </p>
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download to View
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[60vh] border rounded-lg flex items-center justify-center bg-muted">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  File not available
                </p>
                <p className="text-sm text-muted-foreground">
                  The document file could not be found or accessed
                </p>
              </div>
            </div>
          )}
        </div>

        {document.tags && document.tags.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-1">
              {document.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground border-t pt-2">
          {document.file_name && <p>File: {document.file_name}</p>}
          {document.created_at && (
            <p>
              Created: {new Date(document.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};