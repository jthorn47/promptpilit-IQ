import React from 'react';
import { RegisterModule } from './core/ModuleLoader';

console.log('🔍 Simple HRO IQ Test: Starting registration');

// Simple test component
const SimpleTestComponent: React.FC = () => {
  console.log('🚀 Simple HRO IQ Test component is rendering!');
  
  return (
    <div className="container mx-auto p-6">
      <div className="bg-card p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-4">🎉 HRO IQ Test Working!</h1>
        <p>Current URL: {window.location.pathname}</p>
        <p>This proves the module system and routing is working correctly.</p>
      </div>
    </div>
  );
};

// Register the simple module
RegisterModule({
  metadata: {
    id: 'simple-hroiq-test',
    name: 'Simple HRO IQ Test',
    version: '1.0.0',
    description: 'Simple test for HRO IQ routing',
    icon: 'Briefcase',
    category: 'hr',
    status: 'active',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    statusColor: 'green',
    dependencies: []
  },
  routes: [
    {
      path: '/admin/hro-iq',
      component: SimpleTestComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'client_admin']
    },
    {
      path: '/admin/hro-iq/client',
      component: SimpleTestComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'client_admin']
    },
    {
      path: '/admin/hro-iq/requests',
      component: SimpleTestComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'client_admin']
    },
    {
      path: '/admin/hro-iq/deliverables',
      component: SimpleTestComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'client_admin']
    },
    {
      path: '/admin/hro-iq/settings',
      component: SimpleTestComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'client_admin']
    }
  ],
  menu: []
});

console.log('✅ Simple HRO IQ Test: Registration complete');

export default SimpleTestComponent;