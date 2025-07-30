import { Suspense, lazy } from "react";
import { AlertCircle } from "lucide-react";

// Lazy load the SCORM player for better performance
const ScormPlayer = lazy(() => import("@/components/ui/scorm-player").then(module => ({ 
  default: module.ScormPlayer 
})));

interface ScormPlayerWrapperProps {
  assignment: any;
  companySettings: any;
  onComplete: (score?: number) => void;
  testingMode?: boolean;
}

export const ScormPlayerWrapper = ({ 
  assignment, 
  companySettings, 
  onComplete, 
  testingMode = false 
}: ScormPlayerWrapperProps) => {
  
  // Determine which SCORM package to use
  const getScormPackageUrl = () => {
    // Check if using custom SCORM
    if (companySettings?.use_custom_scorm && companySettings?.custom_scorm_package_url) {
      console.log('🎬 Using custom SCORM package:', companySettings.custom_scorm_package_url);
      return companySettings.custom_scorm_package_url;
    }
    
    // Fall back to default or specified SCORM package
    const defaultUrl = companySettings?.scorm_package_url || '/scorm-packages/SBW-9237.zip';
    console.log('🎓 Using default SCORM package:', defaultUrl);
    return defaultUrl;
  };

  const scormPackageUrl = getScormPackageUrl();

  const ScormPlayerFallback = () => (
    <div className="min-h-[400px] bg-accent/5 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading SCORM player...</p>
      </div>
    </div>
  );

  // Show development warning if no SCORM package URL
  if (!scormPackageUrl || scormPackageUrl === '/scorm-packages/SBW-9237.zip') {
    return (
      <div className="min-h-[400px] bg-amber-50/50 rounded-lg flex items-center justify-center border border-amber-200">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            {companySettings?.use_custom_scorm ? 'Custom SCORM Not Available' : 'Development Mode'}
          </h3>
          <p className="text-amber-700 mb-4">
            {companySettings?.use_custom_scorm 
              ? 'The custom SCORM video is being generated or is not available yet.'
              : 'No SCORM package configured. Upload a SCORM package in the admin interface.'
            }
          </p>
          {testingMode && (
            <button
              onClick={() => onComplete(100)}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            >
              Continue (Testing Mode)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<ScormPlayerFallback />}>
      <ScormPlayer
        scormPackageUrl={scormPackageUrl}
        onComplete={onComplete}
        employeeId={assignment?.employee_id || assignment?.employees?.id || "preview"}
        trainingModuleId={assignment?.training_modules?.id || "sbw-9237"}
        moduleName={assignment?.training_modules?.title || "SBW-9237 Workplace Violence Prevention"}
        testingMode={testingMode}
      />
    </Suspense>
  );
};