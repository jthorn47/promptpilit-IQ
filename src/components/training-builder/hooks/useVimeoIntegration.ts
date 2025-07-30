import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VimeoVideo {
  id: string;
  name: string;
  description: string;
  duration: string;
  embedUrl: string;
  thumbnail: string;
}

export const useVimeoIntegration = () => {
  const [vimeoVideos, setVimeoVideos] = useState<VimeoVideo[]>([]);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const searchVimeoVideos = async (query: string) => {
    setSearching(true);
    try {
      toast({
        title: "Searching...",
        description: "Searching your Vimeo videos...",
      });

      const { data, error } = await supabase.functions.invoke('upload-to-vimeo', {
        body: {
          action: 'search',
          query: query
        }
      });

      if (error) throw error;
      
      setVimeoVideos(data.videos || []);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.videos?.length || 0} videos`,
      });
    } catch (error: any) {
      console.error('Vimeo search failed:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search Vimeo videos",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  return {
    vimeoVideos,
    searching,
    searchVimeoVideos,
    clearResults: () => setVimeoVideos([]),
  };
};