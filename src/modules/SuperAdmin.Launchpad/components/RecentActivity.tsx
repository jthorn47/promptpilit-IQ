
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RecentItem } from '../types/launchpad.types';

interface RecentActivityProps {
  items: RecentItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: RecentItem) => {
    if (item.url) {
      navigate(item.url);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'impersonation': return '👤';
      case 'proposal': return '📄';
      case 'config': return '⚙️';
      case 'tool': return '🔧';
      default: return '📝';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recently Accessed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group"
                  onClick={() => handleItemClick(item)}
                >
                  <span className="text-lg">{getItemIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentActivity;
