
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users, Building, Settings, Activity, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const WelcomeSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const quickActions = [
    { icon: Building, label: 'Create Company', action: () => navigate('/admin/companies') },
    { icon: Users, label: 'Add User', action: () => navigate('/admin/employees') },
    { icon: Settings, label: 'System Settings', action: () => navigate('/admin/settings') },
    { icon: Activity, label: 'View Analytics', action: () => navigate('/admin/analytics/training') },
    { icon: FileText, label: 'Audit Logs', action: () => navigate('/admin/audit-logs') }
  ];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-purple-500/5">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Welcome back, EL JEFE 
              <span className="text-2xl">👑</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              System status is optimal. All services running smoothly.
            </p>
          </motion.div>

          {/* Global Search */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 max-w-md"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Global search: users, orgs, modules, logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mt-6"
        >
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={action.action}
              className="flex items-center gap-2 hover:bg-primary/10"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default WelcomeSection;
