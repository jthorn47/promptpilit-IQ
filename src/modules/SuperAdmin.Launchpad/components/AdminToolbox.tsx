
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserCheck, 
  RefreshCw, 
  Trash2, 
  Archive, 
  Settings,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminToolbox: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    { icon: UserCheck, label: 'User Management', action: () => navigate('/admin/employees') },
    { icon: RefreshCw, label: 'System Analytics', action: () => navigate('/admin/analytics/training') },
    { icon: Trash2, label: 'Audit Logs', action: () => navigate('/admin/audit-logs') },
    { icon: Archive, label: 'Archived Clients', action: () => navigate('/admin/companies') },
    { icon: Settings, label: 'Global Settings', action: () => navigate('/admin/settings') },
    { icon: Users, label: 'Security Center', action: () => navigate('/admin/security') }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Toolbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {tools.map((tool, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start h-auto py-3 px-3"
                onClick={tool.action}
              >
                <tool.icon className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="text-sm">{tool.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminToolbox;
