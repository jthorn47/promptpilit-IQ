import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClientProvider } from '../context/ClientContext';
import { ClientManagementApp } from '../components/ClientManagementApp';
import { ClientList } from '../components/ClientList';
import { ClientDetail } from '../components/ClientDetail';
import { ClientOnboardingPage } from '../components/ClientOnboardingPage';
import { ClientBillingPage } from '../components/ClientBillingPage';
import { ClientAnalyticsPage } from '../components/ClientAnalyticsPage';
import { ClientSettingsPage } from '../components/ClientSettingsPage';
import { ClientCommunicationPage } from '../components/ClientCommunicationPage';
import { ClientSupportPage } from '../components/ClientSupportPage';

export const ClientRoutes: React.FC = () => {
  return (
    <ClientProvider>
      <Routes>
        <Route index element={<ClientManagementApp />} />
        <Route path="list" element={<ClientList />} />
        <Route path="onboarding" element={<ClientOnboardingPage />} />
        <Route path="settings" element={<ClientSettingsPage />} />
        <Route path="billing" element={<ClientBillingPage />} />
        <Route path="communication" element={<ClientCommunicationPage />} />
        <Route path="analytics" element={<ClientAnalyticsPage />} />
        <Route path="support" element={<ClientSupportPage />} />
        <Route path="client/:clientId" element={<ClientDetail />} />
      </Routes>
    </ClientProvider>
  );
};