// Legacy file - functionality moved to modular SCORM system
// This file is kept for backward compatibility

export { useScormTracking as useScormAPI } from './scorm/hooks/useScormTracking';
export type { ScormData } from './scorm/hooks/useScormTracking';
export { createScormBridge } from './scorm/scorm-api-bridge';
