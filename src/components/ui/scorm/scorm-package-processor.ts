import JSZip from 'jszip';
import { extractZipFile } from './scorm-zip-extractor';
import { parseManifest } from './scorm-manifest-parser';
import { createScormBridge } from './scorm-api-bridge';
import { uploadScormFolderToS3 } from './scrom-s3-uploader';

export interface ExtractedScormPackage {
  launchUrl: string;
  entryPoint: string;
  manifest?: Document;
}

export const extractScormPackage = async (scormPackageUrl: string, settings?: any): Promise<ExtractedScormPackage> => {
  try {
    console.log("🎓 Starting SCORM package extraction...");

    // Step 1: Extract ZIP file
    console.log("🎓 Step 1: Extracting ZIP file...");
    const { files, scormRootPath } = await extractZipFile(scormPackageUrl);
    console.log("🎓 ZIP extracted successfully, root path:", scormRootPath);

    // Step 2: Parse manifest and find entry point
    console.log("🎓 Step 2: Parsing manifest...");
    const { entryPoint, manifest } = await parseManifest(files, scormRootPath);
    console.log("🎓 Entry point found:", entryPoint);

    // Step 3: Process and inject SCORM bridge
    console.log("🎓 Step 3: Processing SCORM entry file...");
    const entryFile = files[entryPoint];
    if (!entryFile) {
      throw new Error(`Entry file '${entryPoint}' not found in SCORM package`);
    }

    let htmlContent = await entryFile.async('text');
    console.log("🎓 Entry file content length:", htmlContent.length);

    const scormBridge = createScormBridge(settings);
    htmlContent = injectScormBridge(htmlContent, scormBridge);
    console.log("🎓 SCORM API bridge injected");

    // Step 4: Upload to S3
    console.log("🎓 Step 4: Uploading SCORM package to S3...");
    const packageId = `scorm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const launchUrl = await uploadScormFolderToS3(files, packageId, htmlContent, entryPoint);
    console.log("🎓 SCORM package deployed to S3 at:", launchUrl);

    return {
      launchUrl,
      entryPoint,
      manifest
    };
  } catch (error) {
    console.error("❌ SCORM package processing failed:", error);
    throw error;
  }
};

// const injectScormBridge = (htmlContent: string, scormBridge: string): string => {
//   htmlContent = htmlContent.replace(/<base\s+href="[^"]*"\s*\/?>/gi, '');
//   if (htmlContent.includes('</head>')) {
//     return htmlContent.replace('</head>', scormBridge + '</head>');
//   } else if (htmlContent.includes('<body>')) {
//     return htmlContent.replace('<body>', '<body>' + scormBridge);
//   } else {
//     return scormBridge + htmlContent;
//   }
// };


export const injectScormBridge = (htmlContent: string, scormBridge: string): string => {
  // Try to inject before closing head tag first
  if (htmlContent.includes('</head>')) {
    return htmlContent.replace('</head>', `${scormBridge}</head>`);
  }
  
  // If no head tag, inject at the beginning of body
  if (htmlContent.includes('<body>')) {
    return htmlContent.replace('<body>', `<body>${scormBridge}`);
  }
  
  // If no body tag, just prepend to the content
  return `${scormBridge}${htmlContent}`;
};