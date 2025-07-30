import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Building2, BarChart3, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserMenu: React.FC = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleDisplay = (role: string | null) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', variant: 'destructive' as const };
      case 'client_admin':
        return { label: 'Client Admin', variant: 'default' as const };
      case 'onboarding_manager':
        return { label: 'Onboarding Manager', variant: 'secondary' as const };
      default:
        return { label: 'User', variant: 'outline' as const };
    }
  };

  const roleInfo = getRoleDisplay(userRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-primary/20 hover:border-primary/40">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 sm:w-80 z-50 bg-background mr-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <p className="text-sm font-medium leading-none">{user?.email}</p>
            </div>
            <Badge variant={roleInfo.variant} className="w-fit">
              {roleInfo.label}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/admin/university')}>
          <GraduationCap className="mr-2 h-4 w-4" />
          <span>HaaLO IQ-U</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};