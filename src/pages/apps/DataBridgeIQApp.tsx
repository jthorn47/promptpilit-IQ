import React from 'react';
import { ParentModuleApp } from '@/components/apps/ParentModuleApp';

export const DataBridgeIQApp: React.FC = () => {
  console.log('🔥 DataBridgeIQApp: Component rendering');
  return <ParentModuleApp moduleId="databridge" />;
};