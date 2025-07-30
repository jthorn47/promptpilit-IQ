import React, { useEffect, useState } from 'react';
import { DynamicBreadcrumbs } from '@/components/navigation/BreadcrumbSystem';
import { IntelligentHeroBanner } from '@/components/hero/IntelligentHeroBanner';
import { UniversalTopNav } from '@/components/navigation/UniversalTopNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StandardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBreadcrumbs?: boolean;
  showGreeting?: boolean;
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({
  children,
  title,
  subtitle,
  showBreadcrumbs = true,
  showGreeting = true
}) => {
  const { user, userRole } = useAuth();
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.first_name && profile?.last_name) {
          // Use full name from profile
          setUserName(`${profile.first_name} ${profile.last_name}`);
        } else if (profile?.first_name) {
          // Use just first name
          setUserName(profile.first_name);
        } else if (profile?.email) {
          // Extract first name from email (jeffrey@easeworks.com -> Jeffrey)
          const emailPrefix = profile.email.split('@')[0];
          const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          setUserName(firstName);
        } else if (user.email) {
          // Fallback to auth email
          const emailPrefix = user.email.split('@')[0];
          const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          setUserName(firstName);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
        // Fallback to email if available
        if (user.email) {
          const emailPrefix = user.email.split('@')[0];
          const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          setUserName(firstName);
        }
      }
    };

    fetchUserName();
  }, [user]);
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Universal Top Navigation */}
      <UniversalTopNav />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 max-w-[1440px] mx-auto w-full">
        <div className="py-6 space-y-6">
          {showGreeting && <IntelligentHeroBanner userName={userName} userRole={userRole || 'Team Member'} />}
          
          {showBreadcrumbs && <DynamicBreadcrumbs className="mb-4" />}
          
          {(title || subtitle) && (
            <header className="space-y-2">
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </header>
          )}
          
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
};