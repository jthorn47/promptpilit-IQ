import JSZip from 'jszip';

/**
 * Uploads a SCORM folder structure to S3, injecting the modified entry HTML file.
 *
 * @param files The JSZip file map (filename => JSZipObject)
 * @param packageId The unique folder name to use in S3
 * @param htmlContent The injected HTML content (entry file with SCORM bridge)
 * @param entryPoint The filename of the entry point (e.g. index.html)
 * @returns The full S3 static website URL to the entry point
 */

export const uploadScormFolderToS3 = async (
    files: Record<string, JSZip.JSZipObject>,
    packageId: string,
    htmlContent: string,
    entryPoint: string
): Promise<string> => {

    console.log("🚀 Preparing to send files to backend API...");

    // Convert JSZip files to base64
    const fileMap: Record<string, string> = {};
    for (const [filename, fileObj] of Object.entries(files)) {
        if (!fileObj.dir && !filename.startsWith('__MACOSX/')) {
            const content = await fileObj.async('base64');
            fileMap[filename] = content;
        }
    }

    // Call your backend API
    console.log("🚀 Sending payload to /api/trainings/upload-scorm-files");
    const response = await fetch('https://api.easelearn.com/trainings/upload-scorm-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            files: fileMap,
            packageId,
            htmlContent,
            entryPoint
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend upload failed: ${errText}`);
    }

    const data = await response.json();
    console.log("✅ Got launch URL from backend:", data.launchUrl);

    return data.launchUrl;
};