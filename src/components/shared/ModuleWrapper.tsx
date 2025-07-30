import React from 'react';
import { HeroBanner } from '@/components/shared/HeroBanner';

interface ModuleWrapperProps {
  children: React.ReactNode;
}

export const ModuleWrapper: React.FC<ModuleWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen py-6">
      {/* Module content with consistent spacing */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};