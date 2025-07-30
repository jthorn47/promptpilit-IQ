import React from 'react';
import { useParams } from 'react-router-dom';
import { TimeTrackingKiosk } from '@/modules/HaaLO.TimeTrack/components/TimeTrackingKiosk';

export const KioskPage = () => {
  const { companyId } = useParams<{ companyId: string }>();

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Configuration</h1>
          <p className="text-muted-foreground">Company ID is required</p>
        </div>
      </div>
    );
  }

  return <TimeTrackingKiosk companyId={companyId} />;
};