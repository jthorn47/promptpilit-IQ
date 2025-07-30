import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Image, 
  File, 
  Search, 
  Send, 
  Calendar,
  Download,
  Eye
} from 'lucide-react';

interface VaultFile {
  id: string;
  name: string;
  description?: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  folder_path?: string;
}

interface VaultFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: VaultFile) => void;
  conversationId?: string;
}

export const VaultFileModal = ({ isOpen, onClose, onFileSelect, conversationId }: VaultFileModalProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: files, isLoading } = useQuery({
    queryKey: ['vault_files', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('vault_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: isOpen
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (mimeType?.includes('image')) return <Image className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (file: VaultFile) => {
    try {
      // Generate a temporary secure link for the file
      const { data, error } = await supabase.functions.invoke('send-vault-file', {
        body: { 
          conversationId,
          fileId: file.id,
          fileName: file.name
        }
      });

      if (error) throw error;

      onFileSelect(file);
      onClose();
      
      toast({
        title: "File Sent",
        description: `${file.name} has been sent via SMS with a secure link.`,
      });
    } catch (error) {
      console.error('Error sending vault file:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send vault file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Send Vault File</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'policies', 'forms', 'handbooks', 'benefits', 'training'].map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            ))}
          </div>

          {/* File List */}
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : files?.length ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getFileIcon(file.mime_type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        {file.description && (
                          <p className="text-sm text-muted-foreground truncate">{file.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(file.file_size)}</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(file.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.folder_path && (
                        <Badge variant="secondary" className="text-xs">
                          {file.folder_path.split('/').pop()}
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files found</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};