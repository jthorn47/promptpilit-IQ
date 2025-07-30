import { useState, useCallback } from 'react';
import { extractScormPackage, ExtractedScormPackage } from '../scorm-package-processor';

export const useScormExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedPackage, setExtractedPackage] = useState<ExtractedScormPackage | null>(null);

  const extractPackage = useCallback(async (scormPackageUrl: string, settings?: any) => {
    try {
      setIsExtracting(true);
      setExtractionError(null);
      
      const result = await extractScormPackage(scormPackageUrl, settings);
      setExtractedPackage(result);
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to extract SCORM package";
      setExtractionError(errorMessage);
      throw error;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsExtracting(false);
    setExtractionError(null);
    setExtractedPackage(null);
  }, []);

  return {
    isExtracting,
    extractionError,
    extractedPackage,
    extractPackage,
    reset
  };
};