import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, HelpCircle, LogOut, Settings, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  onLogoClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogoClick }) => {
  const { companyName, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Use the signOut from AuthContext which handles proper navigation
    await signOut();
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Company Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onLogoClick}
          >
            <Building2 className="h-8 w-8 text-primary" />
            <div>
            <h2 className="text-xl font-semibold text-foreground">
                {companyName || 'Easeworks'}
              </h2>
              <p className="text-sm text-muted-foreground">Client Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/client-dashboard')}>
              Dashboard
            </Button>
            
            <Button variant="ghost" onClick={() => navigate('/client-dashboard/users')}>
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>

            {/* Help Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Knowledge Base</DropdownMenuItem>
                <DropdownMenuItem>AI Help</DropdownMenuItem>
                <DropdownMenuItem>Submit Feedback</DropdownMenuItem>
                <DropdownMenuItem>Contact Support</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" onClick={() => navigate('/client-dashboard/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};