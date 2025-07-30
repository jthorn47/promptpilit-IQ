import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  DollarSign, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export const HALOInsightStrip: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [haloCommentary, setHaloCommentary] = useState('');

  useEffect(() => {
    // Simulate real-time metrics
    const updateMetrics = () => {
      const newMetrics: MetricCard[] = [
        {
          id: 'payrolls',
          title: 'Payrolls in Progress',
          value: '47',
          change: '+12%',
          changeType: 'positive',
          icon: <Activity className="w-5 h-5" />,
          color: 'text-blue-500'
        },
        {
          id: 'paid-today',
          title: 'Paid Today',
          value: '$2.4M',
          change: '+14%',
          changeType: 'positive',
          icon: <DollarSign className="w-5 h-5" />,
          color: 'text-green-500'
        },
        {
          id: 'employees',
          title: 'Employees Paid',
          value: '8,429',
          change: '+8%',
          changeType: 'positive',
          icon: <Users className="w-5 h-5" />,
          color: 'text-purple-500'
        },
        {
          id: 'completion',
          title: 'Completion Rate',
          value: '92%',
          change: '-3%',
          changeType: 'negative',
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-emerald-500'
        },
        {
          id: 'alerts',
          title: 'Active Alerts',
          value: '7',
          change: '+2',
          changeType: 'negative',
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'text-orange-500'
        }
      ];
      setMetrics(newMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update HALO commentary
    setHaloCommentary(
      "Disbursements are 14% higher than this time last week. Primary driver: contractor clients scaling operations."
    );
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  return (
    <div className="space-y-4">
      {/* Real-time Metrics Strip */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {metrics.map((metric) => (
          <motion.div key={metric.id} variants={itemVariants}>
            <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${metric.color} opacity-80`}>
                    {metric.icon}
                  </div>
                  <Badge 
                    variant={metric.changeType === 'positive' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {metric.title}
                  </p>
                </div>
                
                {/* Glow effect for active metrics */}
                <div className={`absolute inset-0 opacity-20 ${metric.color.replace('text-', 'bg-')} blur-xl -z-10`}></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* HALO Commentary Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary-glow/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-sm font-semibold text-foreground">HALO Insight</h3>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {haloCommentary}
                </p>
              </div>
              <div className="flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};