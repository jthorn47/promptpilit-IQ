import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Search,
  Filter,
  Bell,
  Settings,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RealTimePayrollFeed } from './components/RealTimePayrollFeed';
import { ExceptionCenter } from './components/ExceptionCenter';
import { ClientCardsPanel } from './components/ClientCardsPanel';
import { HALOInsightStrip } from './components/HALOInsightStrip';
import { InternalTaskQueue } from './components/InternalTaskQueue';
import { AdminSearchFilter } from './components/AdminSearchFilter';

interface HALOcommandProps {
  className?: string;
}

export const HALOcommand: React.FC<HALOcommandProps> = ({ className }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-primary/40"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">HALO is initializing command center...</h3>
            <p className="text-sm text-muted-foreground">Loading real-time payroll data streams</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 ${className}`}
    >
      {/* Neural Network Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] bg-[size:24px_24px]"></div>
      </div>

      {/* HALO Command Header */}
      <motion.header 
        variants={itemVariants}
        className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">HALOcommand</h1>
                  <p className="text-sm text-muted-foreground">Live Admin Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <AdminSearchFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-6">
        {/* HALO Insight Strip */}
        <motion.div variants={itemVariants} className="mb-6">
          <HALOInsightStrip />
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Primary Views */}
          <div className="xl:col-span-2 space-y-6">
            <motion.div variants={itemVariants}>
              <RealTimePayrollFeed searchQuery={searchQuery} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <ExceptionCenter />
            </motion.div>
          </div>

          {/* Right Column - Secondary Panels */}
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <ClientCardsPanel searchQuery={searchQuery} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <InternalTaskQueue />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Ambient Effects */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-20 right-10 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
    </motion.div>
  );
};