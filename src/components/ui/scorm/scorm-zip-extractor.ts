import JSZip from 'jszip';

export interface ZipExtractionResult {
  files: Record<string, JSZip.JSZipObject>;
  scormRootPath: string;
}

export const extractZipFile = async (zipUrl: string): Promise<ZipExtractionResult> => {
  console.log("🎓 Downloading SCORM ZIP:", zipUrl);
  
  try {
    // Download the ZIP file
    const response = await fetch(zipUrl);
    if (!response.ok) {
      throw new Error(`Failed to download ZIP: ${response.status} ${response.statusText}`);
    }
    
    const zipData = await response.arrayBuffer();
    console.log("🎓 Downloaded ZIP file, size:", zipData.byteLength);
    
    // Extract ZIP
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(zipData);
    
    console.log("🎓 ZIP extracted, files:", Object.keys(zipContents.files).length, "total files");
    console.log("🎓 First 10 files:", Object.keys(zipContents.files).slice(0, 10));
    
    // Detect SCORM root path
    const scormRootPath = detectScormRootPath(zipContents.files);
    
    return {
      files: zipContents.files,
      scormRootPath
    };
  } catch (error) {
    console.error("❌ ZIP extraction failed:", error);
    throw error;
  }
};

const detectScormRootPath = (files: Record<string, JSZip.JSZipObject>): string => {
  const allFiles = Object.keys(files);
  const nonMacFiles = allFiles.filter(f => !f.startsWith('__MACOSX/') && !f.includes('._'));
  
  // Check if there's a common top-level directory
  const topLevelDirs = new Set<string>();
  const rootFiles: string[] = [];
  
  for (const filePath of nonMacFiles) {
    if (filePath.endsWith('/')) {
      // This is a directory
      const parts = filePath.split('/');
      if (parts.length === 2 && parts[1] === '') {
        // Top-level directory
        topLevelDirs.add(parts[0]);
      }
    } else {
      // This is a file
      const parts = filePath.split('/');
      if (parts.length === 1) {
        // File in root
        rootFiles.push(filePath);
      } else {
        // File in subdirectory
        topLevelDirs.add(parts[0]);
      }
    }
  }
  
  // If there's exactly one top-level directory and no files in root, use that as SCORM root
  if (topLevelDirs.size === 1 && rootFiles.length === 0) {
    const rootPath = Array.from(topLevelDirs)[0] + '/';
    console.log("🎓 Detected SCORM root directory:", rootPath);
    return rootPath;
  } else {
    console.log("🎓 SCORM files at root level");
    return '';
  }
};