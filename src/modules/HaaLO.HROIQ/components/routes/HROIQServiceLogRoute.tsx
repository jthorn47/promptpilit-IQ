import React from 'react';
import { HROIQServiceLogSimple } from '../HROIQServiceLogSimple';

export const HROIQServiceLogRoute: React.FC = () => {
  console.log('🔍 HROIQServiceLogRoute rendering (using simple version)');
  return <HROIQServiceLogSimple />;
};

export default HROIQServiceLogRoute;