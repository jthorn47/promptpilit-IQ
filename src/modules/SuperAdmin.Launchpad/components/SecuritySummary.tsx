
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, FileText, AlertTriangle } from 'lucide-react';
import type { SecurityMetrics } from '../types/launchpad.types';

interface SecuritySummaryProps {
  metrics: SecurityMetrics;
}

const SecuritySummary: React.FC<SecuritySummaryProps> = ({ metrics }) => {
  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚫';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* MFA Enforcement Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">MFA Enforcement</span>
            </div>
            <span className="font-semibold">{metrics.mfaEnforcementRate}%</span>
          </div>

          {/* Password Policy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Password Policy</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Updated {metrics.lastPasswordPolicyUpdate}
            </span>
          </div>

          {/* Audit Log Size */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Audit Logs</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {metrics.auditLogSize.toLocaleString()} entries
            </span>
          </div>

          {/* Threat Level */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">System Threat Level</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getThreatIcon(metrics.threatLevel)}</span>
              <Badge className={getThreatLevelColor(metrics.threatLevel)}>
                {metrics.threatLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SecuritySummary;
