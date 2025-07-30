
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HeroBannerProps {
  className?: string;
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  }
  return 'Good Evening';
}

function getTimeOfDayStyle(): string {
  const hour = new Date().getHours();
  
  const baseStyle = "shadow-lg border border-border/20 rounded-lg mb-4";
  
  // Morning (5:00 AM – 11:59 AM)
  if (hour >= 5 && hour < 12) {
    return `${baseStyle} bg-gradient-to-r from-primary/10 via-primary/5 to-amber-50/50 dark:from-primary/20 dark:via-primary/10 dark:to-amber-900/20 text-foreground`;
  }
  
  // Afternoon (12:00 PM – 4:59 PM)
  if (hour >= 12 && hour < 17) {
    return `${baseStyle} bg-gradient-to-r from-primary/10 via-sky-50/50 to-primary/5 dark:from-primary/20 dark:via-sky-900/20 dark:to-primary/10 text-foreground`;
  }
  
  // Evening/Night
  return `${baseStyle} bg-gradient-to-r from-primary/15 via-primary/8 to-primary/5 dark:from-primary/25 dark:via-primary/15 dark:to-primary/10 text-foreground`;
}

function getTimeOfDayIcon(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return '🌅';
  if (hour >= 12 && hour < 17) return '☀️';
  return '🌙';
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ 
  className = "" 
}) => {
  const { user, companyName } = useAuth();
  
  const greeting = getTimeOfDayGreeting();
  const greetingStyle = getTimeOfDayStyle();
  const icon = getTimeOfDayIcon();
  
  const getUserDisplayName = () => {
    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there';
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };
  
  return (
    <div className={`${greetingStyle} ${className}`}>
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
              {greeting}, {getUserDisplayName()}! 👋
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Welcome back to {companyName || 'HaaLO IQ'} - Ready to get things done?
            </p>
          </div>
          
          <div className="hidden sm:flex items-center justify-center text-4xl lg:text-5xl opacity-30 flex-shrink-0">
            <span>{icon}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
