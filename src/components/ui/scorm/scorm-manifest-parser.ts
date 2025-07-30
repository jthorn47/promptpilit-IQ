import JSZip from 'jszip';

export interface ManifestResult {
  entryPoint: string;
  manifest?: Document;
}

export const parseManifest = async (
  files: Record<string, JSZip.JSZipObject>,
  scormRootPath: string
): Promise<ManifestResult> => {
  let entryPoint = 'index.html';
  let manifestDoc: Document | undefined;
  
  // Look for manifest file
  const manifestPath = scormRootPath + 'imsmanifest.xml';
  const manifestFile = files[manifestPath];
  
  console.log("🎓 Looking for manifest at:", manifestPath);
  console.log("🎓 Manifest file found:", !!manifestFile);
  
  if (manifestFile) {
    const manifestContent = await manifestFile.async('text');
    console.log("🎓 Found imsmanifest.xml, parsing...");
    
    // Parse XML to find launch file
    const parser = new DOMParser();
    manifestDoc = parser.parseFromString(manifestContent, 'text/xml');
    
    // Check for parsing errors
    const parserError = manifestDoc.querySelector('parsererror');
    if (parserError) {
      console.warn("🎓 XML parsing error:", parserError.textContent);
    }
    
    entryPoint = findEntryPointFromManifest(manifestDoc, scormRootPath);
  } else {
    console.log("🎓 No imsmanifest.xml found, searching for common entry files...");
    entryPoint = findCommonEntryFile(files, scormRootPath);
  }
  
  return { entryPoint, manifest: manifestDoc };
};

const findEntryPointFromManifest = (manifest: Document, scormRootPath: string): string => {
  // Try multiple approaches to find the launch file
  
  // 1. Look for the default organization's first item's resource
  const defaultOrganization = manifest.querySelector('organizations organization[identifier]');
  if (defaultOrganization) {
    const firstItem = defaultOrganization.querySelector('item[identifierref]');
    if (firstItem) {
      const resourceRef = firstItem.getAttribute('identifierref');
      if (resourceRef) {
        const resource = manifest.querySelector(`resources resource[identifier="${resourceRef}"]`);
        if (resource) {
          const href = resource.getAttribute('href');
          if (href) {
            const entryPoint = scormRootPath + href;
            console.log("🎓 Found entry point via organization:", entryPoint);
            return entryPoint;
          }
        }
      }
    }
  }
  
  // 2. Look for SCO (Sharable Content Object) resources
  const scoResource = manifest.querySelector('resource[type="webcontent"][adlcp\\:scormtype="sco"]');
  if (scoResource) {
    const href = scoResource.getAttribute('href');
    if (href) {
      const entryPoint = scormRootPath + href;
      console.log("🎓 Found SCO entry point:", entryPoint);
      return entryPoint;
    }
  }
  
  // 3. Look for any webcontent resource with href
  const webContentResource = manifest.querySelector('resource[type="webcontent"][href]');
  if (webContentResource) {
    const href = webContentResource.getAttribute('href');
    if (href) {
      const entryPoint = scormRootPath + href;
      console.log("🎓 Found webcontent entry point:", entryPoint);
      return entryPoint;
    }
  }
  
  // 4. Fallback to any resource with href
  const anyResource = manifest.querySelector('resource[href]');
  if (anyResource) {
    const href = anyResource.getAttribute('href');
    if (href) {
      const entryPoint = scormRootPath + href;
      console.log("🎓 Found fallback entry point:", entryPoint);
      return entryPoint;
    }
  }
  
  return scormRootPath + 'index.html';
};

const findCommonEntryFile = (files: Record<string, JSZip.JSZipObject>, scormRootPath: string): string => {
  const commonFiles = [
    'story.html',        // Articulate Storyline
    'index_lms.html',    // Adobe Captivate
    'launch.html',       // Common SCORM
    'start.html',        // Common SCORM
    'scorm.html',        // Common SCORM
    'player.html',       // Some authoring tools
    'content.html',      // Some authoring tools
    'index.htm',         // Alternative extension
    'index.html'         // Final fallback
  ];
  
  for (const fileName of commonFiles) {
    const pathsToTry = scormRootPath ? [scormRootPath + fileName, fileName] : [fileName];
    
    for (const fullPath of pathsToTry) {
      if (files[fullPath]) {
        console.log("🎓 Using found entry point:", fullPath);
        return fullPath;
      }
    }
  }
  
  return scormRootPath + 'index.html';
};