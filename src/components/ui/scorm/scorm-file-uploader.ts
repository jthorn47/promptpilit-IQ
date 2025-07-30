import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';

export interface FileUploadResult {
  packageId: string;
  uploadedFiles: number;
  failedFiles: number;
}

export const uploadScormFiles = async (
  files: Record<string, JSZip.JSZipObject>
): Promise<FileUploadResult> => {
  // Generate unique folder name for this SCORM package
  const packageId = `scorm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log("🎓 Uploading SCORM files to storage under:", packageId);

  // Upload all files to Supabase Storage
  const uploadPromises = [];
  
  for (const [filename, file] of Object.entries(files)) {
    if (!file.dir && !filename.startsWith('__MACOSX/') && !filename.includes('._')) {
      try {
        const content = await file.async('blob');
        const storagePath = `${packageId}/${filename}`;
        
        const contentType = getContentType(filename);
        
        uploadPromises.push( 
          supabase.storage
            .from('training-files')
            .upload(storagePath, content, {
              cacheControl: '3600',
              upsert: false,
              contentType
            })
        );
      } catch (error) {
        console.warn("⚠️ Failed to prepare file for upload:", filename, error);
      }
    }
  }

  // Wait for all uploads to complete
  const uploadResults = await Promise.all(uploadPromises);
  const failedUploads = uploadResults.filter(result => result.error);
  
  if (failedUploads.length > 0) {
    console.warn("⚠️ Some files failed to upload:", failedUploads);
  }
  
  const uploadedFiles = uploadResults.length - failedUploads.length;
  console.log("🎓 Uploaded", uploadedFiles, "files to storage");

  return {
    packageId,
    uploadedFiles,
    failedFiles: failedUploads.length
  };
};

export const uploadModifiedEntryFile = async (
  htmlContent: string,
  packageId: string,
  entryPoint: string
): Promise<string> => {
  console.log("🎓 Uploading modified entry file:", entryPoint);
  
  // Upload the modified entry file with explicit HTML content type
  const entryBlob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
  const entryStoragePath = `${packageId}/${entryPoint}`;
  
  console.log("🎓 Upload path:", entryStoragePath);
  console.log("🎓 Content length:", htmlContent.length);
  
  const { error: entryUploadError } = await supabase.storage
    .from('training-files')
    .upload(entryStoragePath, entryBlob, {
      cacheControl: 'public, max-age=3600',
      upsert: true,  // Overwrite the original entry file
      contentType: 'text/html; charset=utf-8'
    });

  if (entryUploadError) {
    console.error("❌ Entry file upload failed:", entryUploadError);
    throw new Error(`Failed to upload entry file: ${entryUploadError.message}`);
  }

  // Get the public URL for the entry file
  const { data: { publicUrl } } = supabase.storage
    .from('training-files')
    .getPublicUrl(entryStoragePath);

  console.log("🎓 Generated public URL:", publicUrl);
  console.log("🎓 Entry storage path:", entryStoragePath);
  
  return publicUrl;
};

// New function to fix content types for HTML files after initial upload
export const fixHtmlContentTypes = async (
  files: Record<string, JSZip.JSZipObject>,
  packageId: string
): Promise<void> => {
  console.log("🎓 Fixing Content-Type headers for HTML files...");
  
  const htmlFiles = Object.entries(files).filter(([filename, file]) => 
    !file.dir && 
    !filename.startsWith('__MACOSX/') && 
    !filename.includes('._') &&
    (filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm'))
  );

  for (const [filename, file] of htmlFiles) {
    try {
      const content = await file.async('blob');
      const storagePath = `${packageId}/${filename}`;
      
      console.log("🎓 Re-uploading HTML file with correct Content-Type:", filename);
      
      const { error } = await supabase.storage
        .from('training-files')
        .upload(storagePath, content, {
          cacheControl: 'public, max-age=3600',
          upsert: true,  // Overwrite existing file
          contentType: 'text/html; charset=utf-8'
        });

      if (error) {
        console.warn("⚠️ Failed to fix Content-Type for:", filename, error);
      } else {
        console.log("✅ Fixed Content-Type for:", filename);
      }
    } catch (error) {
      console.warn("⚠️ Failed to process HTML file:", filename, error);
    }
  }
};

export const getContentType = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'html':
    case 'htm':
      return 'text/html; charset=utf-8';
    case 'js':
      return 'application/javascript; charset=utf-8';
    case 'css':
      return 'text/css; charset=utf-8';
    case 'json':
      return 'application/json; charset=utf-8';
    case 'xml':
      return 'application/xml; charset=utf-8';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'mp4':
      return 'video/mp4';
    case 'mp3':
      return 'audio/mpeg';
    case 'woff':
    case 'woff2':
      return 'font/woff2';
    case 'ttf':
      return 'font/ttf';
    case 'eot':
      return 'application/vnd.ms-fontobject';
    default:
      return 'application/octet-stream';
  }
};