import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { OpportunityView } from '../components/OpportunityView';

export default function OpportunityDetails() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/crm/pipeline" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <OpportunityView opportunityId={id} />
    </div>
  );
}