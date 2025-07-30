
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Bot, Building, Users, Server, Clock, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SystemHealth } from '../types/launchpad.types';

interface SystemHealthCardsProps {
  systemHealth: SystemHealth;
}

const SystemHealthCards: React.FC<SystemHealthCardsProps> = ({ systemHealth }) => {
  const healthCards = [
    {
      title: 'System Uptime',
      value: `${systemHealth.uptime}%`,
      subtitle: 'Last outage: 2 days ago',
      icon: Activity,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/30',
      iconBg: 'bg-emerald-500',
      trend: '+0.1%',
      glowColor: 'shadow-emerald-400/50'
    },
    {
      title: 'AI Assistants',
      value: systemHealth.aiAssistants.toString(),
      subtitle: 'Sarah instances active',
      icon: Zap,
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      shadowColor: 'shadow-blue-500/30',
      iconBg: 'bg-blue-500',
      trend: 'Active',
      glowColor: 'shadow-blue-400/50'
    },
    {
      title: 'Organizations',
      value: systemHealth.activeOrgs.toString(),
      subtitle: 'Client companies',
      icon: Building,
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      shadowColor: 'shadow-orange-500/30',
      iconBg: 'bg-orange-500',
      trend: '+0',
      glowColor: 'shadow-orange-400/50'
    },
    {
      title: 'Total Users',
      value: `${systemHealth.totalUsers} / ${systemHealth.activeUsers24h}`,
      subtitle: 'Total / Active 24h',
      icon: Users,
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      shadowColor: 'shadow-pink-500/30',
      iconBg: 'bg-pink-500',
      trend: '+2',
      glowColor: 'shadow-pink-400/50'
    },
    {
      title: 'Microservices',
      value: `${systemHealth.microservicesOnline}/${systemHealth.microservicesTotal}`,
      subtitle: 'Online services',
      icon: Server,
      gradient: systemHealth.microservicesOnline === systemHealth.microservicesTotal 
        ? 'from-violet-500 via-purple-500 to-indigo-500'
        : 'from-yellow-500 via-amber-500 to-orange-500',
      shadowColor: systemHealth.microservicesOnline === systemHealth.microservicesTotal 
        ? 'shadow-violet-500/30' 
        : 'shadow-yellow-500/30',
      iconBg: systemHealth.microservicesOnline === systemHealth.microservicesTotal 
        ? 'bg-violet-500' 
        : 'bg-yellow-500',
      trend: systemHealth.microservicesOnline === systemHealth.microservicesTotal ? 'Healthy' : 'Warning',
      glowColor: systemHealth.microservicesOnline === systemHealth.microservicesTotal 
        ? 'shadow-violet-400/50' 
        : 'shadow-yellow-400/50'
    },
    {
      title: 'Last Sync',
      value: new Date(systemHealth.lastSyncTimestamp).toLocaleTimeString(),
      subtitle: 'Global sync status',
      icon: Clock,
      gradient: 'from-cyan-500 via-teal-500 to-blue-500',
      shadowColor: 'shadow-cyan-500/30',
      iconBg: 'bg-cyan-500',
      trend: 'Live',
      glowColor: 'shadow-cyan-400/50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
      {healthCards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: index * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          whileHover={{ 
            y: -8, 
            transition: { duration: 0.2 }
          }}
          className="group"
        >
          <Card className={`relative h-44 overflow-hidden border-0 ${card.shadowColor} shadow-lg hover:${card.glowColor} hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br ${card.gradient}`}>
            
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute top-3 right-3 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/15 group-hover:scale-125 transition-all duration-500"></div>
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-white/15 group-hover:scale-110 transition-all duration-500"></div>
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
            
            {/* Content */}
            <CardContent className="relative h-full p-5 text-white flex flex-col justify-between">
              
              {/* Header with icon and trend */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${card.iconBg} rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 backdrop-blur-sm bg-white/20`}>
                  <card.icon className="h-5 w-5 text-white drop-shadow-sm" />
                </div>
                <div className="text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 group-hover:bg-white/30 transition-all duration-300">
                  {card.trend}
                </div>
              </div>
              
              {/* Main content */}
              <div className="space-y-2 group-hover:transform group-hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold tracking-tight leading-none drop-shadow-sm">
                  {card.value}
                </div>
                <div className="text-sm font-semibold opacity-95 drop-shadow-sm">
                  {card.title}
                </div>
                <div className="text-xs opacity-80 leading-relaxed">
                  {card.subtitle}
                </div>
              </div>
              
              {/* Pulse animation indicator */}
              <div className="absolute bottom-3 right-3 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              
              {/* Hover shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
              
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default SystemHealthCards;
