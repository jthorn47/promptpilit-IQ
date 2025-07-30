import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GLDashboard } from './GLDashboard';
import { JournalEntryForm } from './JournalEntryForm';
import { LedgerView } from './LedgerView';
import { BatchManager } from './BatchManager';
import { GLSettings } from './GLSettings';
import { AccountMapping } from './AccountMapping';
import { ImportGeneralLedger } from '../ImportGeneralLedger';
import { supabase } from '@/integrations/supabase/client';

export const GeneralLedgerModule: React.FC = () => {
  const [companyId, setCompanyId] = useState<string>('');

  console.log('🔧 GeneralLedgerModule mounted');

  // Get company ID from user profile
  useEffect(() => {
    console.log('🔧 GeneralLedgerModule fetching company ID...');
    const fetchCompanyId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      console.log('🔧 GeneralLedgerModule profile result:', { profile });
      if (profile?.company_id) {
        setCompanyId(profile.company_id);
      }
    };
    
    fetchCompanyId();
  }, []);
  console.log('🔧 GeneralLedgerModule rendering with companyId:', companyId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
        <p className="text-muted-foreground">
          Complete general ledger management with journal entries, batches, and audit trails
        </p>
      </div>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 gap-1">
          <TabsTrigger value="dashboard" className="text-xs md:text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="journal-entry" className="text-xs md:text-sm">Journal</TabsTrigger>
          <TabsTrigger value="ledger-view" className="text-xs md:text-sm">Ledger</TabsTrigger>
          <TabsTrigger value="batch-manager" className="text-xs md:text-sm">Batch</TabsTrigger>
          <TabsTrigger value="mapping" className="text-xs md:text-sm">Mapping</TabsTrigger>
          <TabsTrigger value="import-data" className="text-xs md:text-sm">Import</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <GLDashboard 
            companyId={companyId}
            onCreateJournal={() => {}}
            onCreateBatch={() => {}}
            onViewJournals={() => {}}
            onViewBatches={() => {}}
          />
        </TabsContent>

        <TabsContent value="journal-entry">
          <JournalEntryForm companyId={companyId} />
        </TabsContent>

        <TabsContent value="ledger-view">
          <LedgerView companyId={companyId} />
        </TabsContent>

        <TabsContent value="batch-manager">
          <BatchManager companyId={companyId} />
        </TabsContent>

        <TabsContent value="mapping">
          <AccountMapping companyId={companyId} />
        </TabsContent>

        <TabsContent value="import-data">
          <ImportGeneralLedger companyId={companyId} />
        </TabsContent>

        <TabsContent value="settings">
          <GLSettings companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralLedgerModule;