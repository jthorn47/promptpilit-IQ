
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface LaunchpadCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const LaunchpadCard: React.FC<LaunchpadCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  onClick,
  disabled = false,
  children
}) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-shadow hover:shadow-lg rounded-xl ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={disabled ? undefined : onClick}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-primary/10 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground font-normal">{description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        {children && (
          <CardContent>
            {children}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};
