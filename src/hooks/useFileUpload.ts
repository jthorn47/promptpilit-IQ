import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isValidFileUpload } from "@/utils/security";

interface UseFileUploadProps {
  onFileUploaded: (filePath: string, fileName: string) => void;
}

export const useFileUpload = ({ onFileUploaded }: UseFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    console.log('🚀 Upload function called with file:', file.name, file.type, file.size);
    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate file security
      const validation = isValidFileUpload(file);
      if (!validation.valid) {
        toast({
          title: "File Upload Error",
          description: validation.error || "Invalid file",
          variant: "destructive",
        });
        return;
      }

      // Check if this is a video file
      const isVideoFile = file.type.startsWith('video/');

      if (isVideoFile) {
        console.log(`🎥 Starting video upload for: ${file.name}`);
        console.log(`📊 File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📂 File type: ${file.type}`);
        
        toast({
          title: "Uploading to Vimeo",
          description: "Starting direct upload to Vimeo to handle large files...",
        });

        setUploadProgress(10);

        // First, test the Vimeo token
        console.log('🧪 Testing Vimeo token...');
        const { data: tokenTest, error: tokenError } = await supabase.functions.invoke('upload-to-vimeo', {
          body: { action: 'testToken' }
        });

        if (tokenError || !tokenTest?.success) {
          console.error('❌ Token test failed:', tokenError || tokenTest?.error);
          throw new Error(tokenTest?.error || tokenError?.message || 'Vimeo token test failed');
        }
        
        console.log('✅ Token test passed:', tokenTest.message);
        setUploadProgress(15);

        try {
          console.log('🎫 Requesting upload ticket from edge function...');
          
          // Step 1: Get Vimeo upload ticket from our edge function (no file data)
          const { data: ticketData, error: ticketError } = await supabase.functions.invoke('upload-to-vimeo', {
            body: {
              action: 'createTicket',
              fileName: file.name,
              fileSize: file.size,
              title: file.name.replace(/\.[^/.]+$/, ""),
              description: `Training video uploaded from ${file.name}`
            }
          });

          console.log('🎫 Upload ticket response:', { 
            success: ticketData?.success, 
            error: ticketError?.message || ticketData?.error,
            hasUploadUrl: !!ticketData?.uploadUrl,
            hasVideoId: !!ticketData?.videoId 
          });

          if (ticketError) {
            console.error('❌ Edge function error:', ticketError);
            throw new Error(`Edge function error: ${ticketError.message}`);
          }

          if (!ticketData?.success) {
            console.error('❌ Upload ticket failed:', ticketData?.error);
            throw new Error(ticketData?.error || 'Failed to create upload ticket');
          }

          setUploadProgress(20);

          const { uploadUrl, videoId } = ticketData;
          console.log(`✅ Got upload URL and video ID: ${videoId}`);

          // Step 2: Upload directly to Vimeo using TUS protocol from browser
          console.log('🚀 Starting TUS upload directly to Vimeo...');
          await uploadToVimeoDirectly(file, uploadUrl, (progress) => {
            const progressPercent = 20 + (progress * 0.7); // 20-90%
            console.log(`📈 Upload progress: ${(progress * 100).toFixed(1)}%`);
            setUploadProgress(progressPercent);
          });

          setUploadProgress(95);

          // Step 3: Wait for video processing and get embed URL
          const embedUrl = `https://player.vimeo.com/video/${videoId}`;

          console.log(`✅ Upload completed! Embed URL: ${embedUrl}`);
          
          toast({
            title: "Video Uploaded Successfully", 
            description: "Your video has been uploaded to Vimeo and is being processed. It may take a few moments to become available.",
          });

          // Call the callback to update the scene
          try {
            await onFileUploaded(embedUrl, file.name);
            console.log('✅ Scene updated successfully with video URL');
          } catch (error) {
            console.error('❌ Failed to update scene with video URL:', error);
            toast({
              title: "Warning",
              description: "Video uploaded but failed to save to training. Please try refreshing the page.",
              variant: "destructive",
            });
          }
          
          setUploadProgress(100);
        } catch (vimeoError: any) {
          console.error('❌ Direct Vimeo upload failed:', vimeoError);
          console.error('❌ Error details:', {
            message: vimeoError.message,
            stack: vimeoError.stack,
            name: vimeoError.name
          });
          
          toast({
            title: "Upload Failed",
            description: vimeoError.message || "Failed to upload video to Vimeo.",
            variant: "destructive",
          });
        }
      } else {
        // Check if this is a SCORM file (ZIP)
        const isScormFile = file.type === 'application/zip' || 
                           file.type === 'application/x-zip-compressed' || 
                           file.name.toLowerCase().endsWith('.zip');

        if (isScormFile) {
          console.log('🎓 Processing SCORM package:', file.name);
          
          // Upload SCORM package to Supabase storage first
          const timestamp = new Date().getTime();
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${timestamp}_${sanitizedName}`;
          const filePath = `scorm/${fileName}`;

          setUploadProgress(20);

          const { data, error } = await supabase.storage
            .from('training-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw error;
          }

          setUploadProgress(50);

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('training-files')
            .getPublicUrl(filePath);

          setUploadProgress(80);

          // For SCORM files, we need to process them through the SCORM extractor
          // This will extract the package and deploy it to S3 for proper SCORM playback
          try {
            console.log('🎓 Calling SCORM processing edge function...');
            const { data: scormData, error: scormError } = await supabase.functions.invoke('scorm-preview', {
              body: { 
                action: 'process',
                scormPackageUrl: publicUrl,
                packageName: file.name
              }
            });

            if (scormError) {
              console.error('❌ SCORM processing failed:', scormError);
              throw new Error(`SCORM processing failed: ${scormError.message}`);
            }

            if (!scormData?.success) {
              console.error('❌ SCORM processing unsuccessful:', scormData?.error);
              throw new Error(scormData?.error || 'SCORM processing failed');
            }

            const scormLaunchUrl = scormData.launchUrl;
            console.log('✅ SCORM package processed successfully, launch URL:', scormLaunchUrl);

            toast({
              title: "SCORM Package Uploaded",
              description: "SCORM package has been processed and is ready for training.",
            });

            // Call onFileUploaded with the SCORM launch URL
            onFileUploaded(scormLaunchUrl, file.name);
            setUploadProgress(100);

          } catch (scormError: any) {
            console.error('❌ SCORM processing error:', scormError);
            
            // Fallback: use the raw ZIP URL if SCORM processing fails
            toast({
              title: "SCORM Processing Failed",
              description: "Using basic file upload. SCORM features may not work properly.",
              variant: "destructive",
            });
            onFileUploaded(publicUrl, file.name);
            setUploadProgress(100);
          }

        } else {
          // For other non-video files, use basic Supabase storage
          const timestamp = new Date().getTime();
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `${timestamp}_${sanitizedName}`;
          const filePath = `documents/${fileName}`;

          const { data, error } = await supabase.storage
            .from('training-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw error;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('training-files')
            .getPublicUrl(filePath);

          toast({
            title: "Success",
            description: "File uploaded successfully!",
          });
          onFileUploaded(publicUrl, file.name);
          setUploadProgress(100);
        }
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Direct upload to Vimeo using native fetch (bypassing TUS client issues)
  const uploadToVimeoDirectly = async (file: File, uploadUrl: string, onProgress: (progress: number) => void): Promise<void> => {
    console.log('🚀 Starting direct upload to Vimeo');
    console.log(`📡 Upload URL: ${uploadUrl}`);
    console.log(`📁 File: ${file.name}, Size: ${file.size} bytes`);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = event.loaded / event.total;
          console.log(`📊 Upload progress: ${(progress * 100).toFixed(1)}%`);
          onProgress(progress);
        }
      };
      
      xhr.onload = () => {
        console.log(`📥 Upload response: ${xhr.status}`);
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('✅ Upload completed successfully');
          resolve();
        } else {
          console.error('❌ Upload failed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText
          });
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = () => {
        console.error('❌ Upload error occurred');
        reject(new Error('Upload failed due to network error'));
      };
      
      xhr.ontimeout = () => {
        console.error('❌ Upload timed out');
        reject(new Error('Upload timed out'));
      };
      
      // Configure the request
      xhr.open('PATCH', uploadUrl);
      xhr.timeout = 300000; // 5 minutes timeout
      
      // Set required headers for Vimeo TUS upload
      xhr.setRequestHeader('Content-Type', 'application/offset+octet-stream');
      xhr.setRequestHeader('Upload-Offset', '0');
      xhr.setRequestHeader('Tus-Resumable', '1.0.0');
      
      console.log('📤 Starting upload...');
      xhr.send(file);
    });
  };

  return {
    uploading,
    uploadProgress,
    uploadFile
  };
};