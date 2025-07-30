import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface LaunchpadGreetingBannerProps {
  className?: string;
}

function getGreetingText(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Evening';
}

function getGreetingStyle(): string {
  const hour = new Date().getHours();
  const baseStyle = "shadow-lg transition-all duration-500";
  
  // Morning (5:00 AM – 11:59 AM): Bright and airy
  if (hour >= 5 && hour < 12) {
    return `${baseStyle} bg-gradient-to-r from-amber-100 via-yellow-50 to-sky-100 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-sky-900/30 text-gray-800 dark:text-gray-100`;
  }
  
  // Afternoon (12:00 PM – 4:59 PM): Warm and vibrant
  if (hour >= 12 && hour < 17) {
    return `${baseStyle} bg-gradient-to-r from-orange-200 via-amber-100 to-yellow-200 dark:from-orange-800/40 dark:via-amber-800/30 dark:to-yellow-800/40 text-gray-800 dark:text-gray-100`;
  }
  
  // Evening (5:00 PM – 8:59 PM): Rich primary theme
  if (hour >= 17 && hour < 21) {
    return `${baseStyle} bg-gradient-to-r from-primary/20 via-purple-200 to-primary/15 dark:from-primary/40 dark:via-purple-800/50 dark:to-primary/30 text-gray-800 dark:text-gray-100`;
  }
  
  // Night (9:00 PM – 4:59 AM): Dark and dramatic
  return `${baseStyle} bg-gradient-to-r from-gray-800 via-gray-900 to-primary/80 text-white shadow-primary/20`;
}

export const LaunchpadGreetingBanner: React.FC<LaunchpadGreetingBannerProps> = ({ 
  className = "" 
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const greeting = getGreetingText();
  const greetingStyle = getGreetingStyle();
  
  
  return (
    <div 
      className={`rounded-lg py-3 px-4 mx-4 mt-2 transition-all duration-300 ${greetingStyle} ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            {greeting}, {user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-base sm:text-lg opacity-90">
            Welcome back - Ready to get things done?
          </p>
        </div>
        <div className="hidden sm:block text-4xl md:text-6xl opacity-30 flex-shrink-0">
          {new Date().getHours() < 12 ? '🌅' : 
           new Date().getHours() < 18 ? '☀️' : 
           new Date().getHours() < 21 ? '🌆' : '🌙'}
        </div>
      </div>
    </div>
  );
};