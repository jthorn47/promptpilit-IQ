import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { EmailTemplatesManager } from '@/modules/HaaLO.CRM/components/EmailTemplatesManager';

const EmailTemplates = () => {
  return (
    <StandardPageLayout 
      title="Email Templates"
      subtitle="Create and manage CRM email templates"
    >
      <EmailTemplatesManager />
    </StandardPageLayout>
  );
};

export default EmailTemplates;