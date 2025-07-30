import React from 'react';
import { ScormPlayer } from './scorm-player';
import { Card } from './card';

// Test component to verify SCORM functionality
export const ScormTest = () => {
  // Example SCORM package URL for testing
  const testScormUrl = "https://example.com/test-scorm.zip";

  const handleComplete = (score?: number, duration?: string) => {
    console.log('🎉 SCORM Test Complete!', { score, duration });
    alert(`SCORM completed with score: ${score}, duration: ${duration}`);
  };

  const handleProgress = (progress: number) => {
    console.log('📊 SCORM Progress:', progress);
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">SCORM Player Test</h2>
      <p className="text-muted-foreground mb-6">
        This component tests the SCORM player functionality. Replace the testScormUrl with a real SCORM package URL.
      </p>
      
      <ScormPlayer
        scormPackageUrl={testScormUrl}
        onComplete={handleComplete}
        onProgress={handleProgress}
        employeeId="test-employee"
        trainingModuleId="test-module"
      />
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Upload a SCORM package via the training builder</li>
          <li>Verify the ZIP is extracted properly</li>
          <li>Check that imsmanifest.xml is parsed for launch file</li>
          <li>Ensure the iframe loads with SCORM API bridge</li>
          <li>Test API communication between iframe and parent</li>
          <li>Verify completion tracking works</li>
        </ol>
      </div>
    </Card>
  );
};