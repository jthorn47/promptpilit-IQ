import React from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { ContactsManager } from '@/modules/HaaLO.CRM/components/ContactsManager';

const Contacts = () => {
  return (
    <StandardPageLayout 
      title="Contacts"
      subtitle="Manage your customer contacts and relationships"
    >
      <ContactsManager />
    </StandardPageLayout>
  );
};

export default Contacts;