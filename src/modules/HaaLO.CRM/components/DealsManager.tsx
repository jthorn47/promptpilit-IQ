import React from 'react';
import { NavigatorView } from '@/domains/crm/components/NavigatorView';

/**
 * DealsManager component that renders the Pipeline Navigator
 * This component serves as the main deals/pipeline management interface
 */
const DealsManager = () => {
  return (
    <div className="container mx-auto p-6">
      <NavigatorView />
    </div>
  );
};

export default DealsManager;