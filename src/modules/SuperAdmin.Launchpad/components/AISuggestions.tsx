
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, TrendingUp, AlertCircle, Users } from 'lucide-react';

const AISuggestions: React.FC = () => {
  const suggestions = [
    {
      icon: AlertCircle,
      title: '12 companies have no Risk Score',
      description: 'Risk assessments are missing for several organizations',
      actions: ['Auto-Generate', 'Send Reminders', 'Ignore']
    },
    {
      icon: TrendingUp,
      title: 'Version drift in EaseLearnX detected',
      description: 'Multiple organizations are running outdated versions',
      actions: ['Update All', 'Schedule Updates', 'View Details']
    },
    {
      icon: Users,
      title: '3 orgs disabled SB 553 training unexpectedly',
      description: 'Compliance training was disabled without approval',
      actions: ['Re-enable', 'Contact Admins', 'Investigate']
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            AI Smart Suggestions
            <span className="text-sm font-normal text-muted-foreground">(Powered by Sarah)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="border rounded-lg p-4 hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <suggestion.icon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {suggestion.actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          size="sm"
                          variant={actionIndex === 0 ? "default" : "outline"}
                          className="h-7 text-xs"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AISuggestions;
