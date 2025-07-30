import React from 'react';
import { TopNav } from '@/components/navigation/TopNav';

interface PublicLayoutProps {
  children: React.ReactNode;
  showTopNav?: boolean;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ 
  children, 
  showTopNav = true 
}) => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      {showTopNav && <TopNav />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};