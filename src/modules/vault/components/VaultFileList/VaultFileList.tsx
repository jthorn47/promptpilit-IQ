import React from 'react';
import { File, Share, Download, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileShareDialog } from '../FileShareDialog/FileShareDialog';
import type { VaultFile } from '../../hooks/useVaultFiles';

export interface VaultFileListProps {
  files?: VaultFile[];
  loading?: boolean;
  onFileSelect?: (file: VaultFile) => void;
  onShareUpdate?: () => void;
  onFileDownload?: (file: VaultFile) => void;
  onFileDelete?: (fileId: string) => void;
  canManage?: boolean;
}

export const VaultFileList: React.FC<VaultFileListProps> = ({
  files = [],
  loading = false,
  onFileSelect,
  onShareUpdate,
  onFileDownload,
  onFileDelete,
  canManage = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading files...</p>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
            <File className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No files yet</h3>
          <p className="text-muted-foreground">
            Upload your first file to get started with the Vault.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Files ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => onFileSelect?.(file)}>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <File className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(file.file_size / 1024).toFixed(1)} KB • {file.uploaded_by}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.is_shared && (
                    <Badge variant="outline" className="text-xs">
                      <Share className="h-3 w-3 mr-1" />
                      Shared
                    </Badge>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileDownload?.(file);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download file</p>
                    </TooltipContent>
                  </Tooltip>
                  <FileShareDialog 
                    file={file} 
                    onShareUpdate={onShareUpdate}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share file</p>
                      </TooltipContent>
                    </Tooltip>
                  </FileShareDialog>
                  {canManage && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileDelete?.(file.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete file</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};