import React from 'react';
import { useParams } from 'react-router-dom';
import { ClientCaseTimeline } from '@/modules/CaseManagement/components/ClientCaseTimeline';

export const PublicCaseTimeline = () => {
  const { shareToken } = useParams<{ shareToken: string }>();

  if (!shareToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground">The case timeline link is invalid.</p>
        </div>
      </div>
    );
  }

  return <ClientCaseTimeline shareToken={shareToken} />;
};