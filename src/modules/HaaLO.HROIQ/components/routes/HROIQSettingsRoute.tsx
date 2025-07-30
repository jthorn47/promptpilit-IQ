import React from 'react';
import { HROIQSettings } from '../HROIQSettings';

export const HROIQSettingsRoute: React.FC = () => {
  console.log('🔍 HROIQSettingsRoute rendering');
  const clientId = 'demo-client-123'; // This could be from URL params or context
  
  return <HROIQSettings clientId={clientId} />;
};

export default HROIQSettingsRoute;