import React from 'react';
import { PostPurchaseDashboard } from '@/components/PostPurchaseDashboard';

export const PlanStartedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        <PostPurchaseDashboard />
      </div>
    </div>
  );
};