import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomizableWidgetArea } from '@/components/widgets/CustomizableWidgetArea';

interface InsightTile {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
  count?: number;
}


interface HeroBannerProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  brandLogo?: string;
  contextType?: 'crm' | 'pulse' | 'vault' | 'general';
  insights?: InsightTile[];
  adminMessage?: string;
  isAdmin?: boolean;
  onAdminMessageUpdate?: (message: string) => void;
  timeOfDayOverride?: 'morning' | 'afternoon' | 'evening' | null;
}

const getTimeOfDay = (override?: 'morning' | 'afternoon' | 'evening' | null) => {
  if (override) return override;
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return 'morning';  // 4AM-11:59AM
  if (hour >= 12 && hour < 17) return 'afternoon'; // 12PM-4:59PM
  return 'evening'; // 5PM-3:59AM
};

const getGreeting = (timeOfDay: string, userName?: string) => {
  const greetings = {
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening'
  };
  
  const name = userName ? `, ${userName.split(' ')[0]}` : '';
  return `${greetings[timeOfDay as keyof typeof greetings]}${name}!`;
};

const getMoonPhase = () => {
  const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const dayOfMonth = new Date().getDate();
  return phases[dayOfMonth % 8];
};

const defaultQuotes = [
  "Every expert was once a beginner. Every pro was once an amateur.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The way to get started is to quit talking and begin doing.",
  "Innovation distinguishes between a leader and a follower.",
  "Your limitation—it's only your imagination."
];

const defaultInsights: InsightTile[] = [
  {
    id: '1',
    title: 'Pending Reviews',
    description: '4 contracts need your signature',
    action: 'Review Now',
    priority: 'high',
    icon: <FileText className="h-4 w-4" />,
    count: 4
  },
  {
    id: '2',
    title: 'Revenue Update',
    description: 'Monthly target: 87% complete',
    action: 'View Report',
    priority: 'medium',
    icon: <TrendingUp className="h-4 w-4" />
  }
];


export const IntelligentHeroBanner: React.FC<HeroBannerProps> = ({
  userName = "User",
  userRole = "Team Member",
  userAvatar,
  brandLogo,
  contextType = 'general',
  insights = defaultInsights,
  adminMessage,
  isAdmin = false,
  onAdminMessageUpdate,
  timeOfDayOverride = null
}) => {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay(timeOfDayOverride));
  const [currentQuote, setCurrentQuote] = useState(0);
  const [adminEditMode, setAdminEditMode] = useState(false);
  const [tempAdminMessage, setTempAdminMessage] = useState(adminMessage || '');

  useEffect(() => {
    const interval = setInterval(() => {
      if (!timeOfDayOverride) {
        setTimeOfDay(getTimeOfDay());
      }
    }, 60000); // Check every minute

    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % defaultQuotes.length);
    }, 10000); // Change quote every 10 seconds

    return () => {
      clearInterval(interval);
      clearInterval(quoteInterval);
    };
  }, [timeOfDayOverride]);

  // Update timeOfDay when override changes
  React.useEffect(() => {
    setTimeOfDay(getTimeOfDay(timeOfDayOverride));
  }, [timeOfDayOverride]);

  const getTimeBasedBackground = () => {
    const baseClasses = "relative overflow-hidden transition-all duration-1000";
    
    switch (timeOfDay) {
      case 'morning':
        return `${baseClasses} bg-gradient-to-br from-orange-200 via-peach-100 to-sky-200`;
      case 'afternoon':
        return `${baseClasses} bg-gradient-to-br from-sky-200 via-blue-100 to-sky-300`;
      case 'evening':
        return `${baseClasses} bg-gradient-to-br from-indigo-900 via-slate-800 to-navy-900`;
      default:
        return `${baseClasses} bg-gradient-to-br from-primary/10 to-primary/20`;
    }
  };

  const getContextBackground = () => {
    switch (contextType) {
      case 'crm':
        return 'after:content-[""] after:absolute after:inset-0 after:bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23655DC6" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] after:opacity-20';
      case 'pulse':
        return 'after:content-[""] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_50%,rgba(101,93,198,0.05)_0%,transparent_50%)] after:animate-pulse';
      case 'vault':
        return 'after:content-[""] after:absolute after:inset-0 after:bg-[url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23655DC6" fill-opacity="0.02"%3E%3Cpath d="M20 20v-8a8 8 0 0 1 16 0v8h-16z"/%3E%3C/g%3E%3C/svg%3E")]';
      default:
        return '';
    }
  };

  const saveAdminMessage = () => {
    if (onAdminMessageUpdate) {
      onAdminMessageUpdate(tempAdminMessage);
    }
    setAdminEditMode(false);
  };

  return (
    <div className={cn(getTimeBasedBackground(), getContextBackground())}>
      {/* Morning: Sunrise Animation */}
      {timeOfDay === 'morning' && (
        <>
          {/* Rising Sun */}
          <div className="absolute top-2 right-12 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-70 animate-pulse shadow-lg shadow-orange-300/50" />
          <div className="absolute top-4 right-14 w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-50 animate-ping" style={{ animationDuration: '4s' }} />
          
          {/* Sun Rays */}
          <div className="absolute top-0 right-8 w-32 h-32 opacity-30">
            <div className="absolute inset-0 bg-gradient-conic from-yellow-200/50 via-transparent to-yellow-200/50 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          
          {/* Peach Morning Clouds */}
          <div className="absolute top-12 left-20 w-16 h-8 bg-gradient-to-r from-orange-200/60 to-pink-200/40 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-8 left-40 w-12 h-6 bg-gradient-to-r from-peach-200/50 to-orange-200/30 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '3s' }} />
        </>
      )}
      
      {/* Afternoon: Sky Clouds Animation */}
      {timeOfDay === 'afternoon' && (
        <>
          {/* Floating Clouds with subtle movement */}
          <div className="absolute top-4 right-16 w-16 h-8 bg-white/70 rounded-full opacity-80 animate-pulse shadow-sm" style={{ animationDelay: '0s', animationDuration: '6s' }} />
          <div className="absolute top-8 right-32 w-12 h-6 bg-white/60 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '2s', animationDuration: '8s' }} />
          <div className="absolute top-2 right-48 w-20 h-10 bg-white/50 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '4s', animationDuration: '10s' }} />
          
          {/* Subtle cloud movement */}
          <div className="absolute top-12 left-12 w-14 h-7 bg-blue-100/40 rounded-full opacity-50" 
               style={{ 
                 animation: 'float 15s ease-in-out infinite',
                 animationDelay: '1s'
               }} />
          <div className="absolute top-6 left-32 w-10 h-5 bg-sky-100/30 rounded-full opacity-40"
               style={{ 
                 animation: 'float 20s ease-in-out infinite reverse',
                 animationDelay: '5s'
               }} />
               
           {/* CSS Animation Definition */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateX(0px) translateY(0px); }
              33% { transform: translateX(10px) translateY(-5px); }
              66% { transform: translateX(-5px) translateY(3px); }
            }
          `}</style>
        </>
      )}
      
      {/* Evening: Navy Sky with Twinkling Stars & Moon */}
      {timeOfDay === 'evening' && (
        <>
          {/* Real Moon Phase */}
          <div className="absolute top-3 right-10 text-3xl opacity-90 animate-pulse" style={{ animationDuration: '3s' }}>
            {getMoonPhase()}
          </div>
          
          {/* Constellation Pattern */}
          <div className="absolute top-6 right-24 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-80" style={{ animationDelay: '0s', animationDuration: '2s' }} />
          <div className="absolute top-10 right-36 w-1 h-1 bg-blue-100 rounded-full animate-ping opacity-70" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          <div className="absolute top-4 right-52 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '2.5s', animationDuration: '2.5s' }} />
          <div className="absolute top-12 right-48 w-1 h-1 bg-purple-100 rounded-full animate-ping opacity-50" style={{ animationDelay: '4s', animationDuration: '4s' }} />
          
          {/* Additional Stars */}
          <div className="absolute top-2 left-20 w-1 h-1 bg-white rounded-full animate-ping opacity-40" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
          <div className="absolute top-8 left-32 w-1.5 h-1.5 bg-blue-100 rounded-full animate-ping opacity-60" style={{ animationDelay: '3s', animationDuration: '2s' }} />
          <div className="absolute top-14 left-48 w-1 h-1 bg-white rounded-full animate-ping opacity-30" style={{ animationDelay: '5s', animationDuration: '4.5s' }} />
          
          {/* Nebula Effect */}
          <div className="absolute top-8 left-8 w-24 h-16 bg-gradient-radial from-purple-500/10 via-blue-500/5 to-transparent rounded-full opacity-50 animate-pulse" style={{ animationDuration: '8s' }} />
        </>
      )}

      {/* Brand Logo Watermark */}
      {brandLogo && (
        <div className="absolute top-4 left-4 opacity-10">
          <img src={brandLogo} alt="Brand" className="w-16 h-16 object-contain" />
        </div>
      )}

      <div className="relative z-10 p-4 md:p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {userAvatar && (
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/20">
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className={cn(
                "text-xl md:text-2xl font-bold transition-all duration-500",
                timeOfDay === 'evening' ? 'text-white' : 'text-gray-900'
              )}>
                {getGreeting(timeOfDay, userName)}
              </h1>
              <p className={cn(
                "text-sm md:text-base opacity-80",
                timeOfDay === 'evening' ? 'text-gray-200' : 'text-gray-600'
              )}>
                {userRole} • {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Admin Easter Egg */}
          {isAdmin && (
            <div className="text-right">
              {adminEditMode ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempAdminMessage}
                    onChange={(e) => setTempAdminMessage(e.target.value)}
                    placeholder="Daily motivation message..."
                    className="px-3 py-1 text-sm border rounded-lg bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/60"
                    maxLength={80}
                  />
                  <Button size="sm" onClick={saveAdminMessage} className="bg-primary hover:bg-primary/90">
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAdminEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setAdminEditMode(true)}
                  className={cn(
                    "opacity-60 hover:opacity-100",
                    timeOfDay === 'evening' ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-black/5'
                  )}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Daily Message
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Admin Message Display */}
        {adminMessage && !adminEditMode && (
          <div className={cn(
            "mb-4 p-3 rounded-lg border",
            timeOfDay === 'evening' 
              ? 'bg-white/10 border-white/20 text-white' 
              : 'bg-primary/10 border-primary/20 text-primary'
          )}>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">{adminMessage}</span>
            </div>
          </div>
        )}

        {/* Daily Quote */}
        <div className="mb-3">
          <p className={cn(
            "text-sm md:text-base italic transition-all duration-500",
            timeOfDay === 'evening' ? 'text-gray-300' : 'text-gray-700'
          )}>
            "{defaultQuotes[currentQuote]}"
          </p>
        </div>

        {/* Insight Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {insights.slice(0, 2).map((insight) => (
            <Card key={insight.id} className="p-3 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    insight.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                    insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                    'bg-green-500/20 text-green-600'
                  )}>
                    {insight.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-semibold",
                        timeOfDay === 'evening' ? 'text-white' : 'text-gray-900'
                      )}>
                        {insight.title}
                      </h3>
                      {insight.count && (
                        <Badge className="bg-primary text-white">
                          {insight.count}
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm",
                      timeOfDay === 'evening' ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {insight.description}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary hover:bg-primary/90"
                >
                  {insight.action}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions Widget Area (without title) */}
        <div className="mt-4">
          <CustomizableWidgetArea 
            showHeader={false}
            maxWidgets={4}
            className="mb-4"
          />
        </div>
      </div>
    </div>
  );
};