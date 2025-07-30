import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ListTodo, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  User,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminTask {
  id: string;
  task_type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  estimated_hours: number;
  company_name?: string;
}

const priorityConfig = {
  low: { label: 'Low', color: 'bg-blue-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  high: { label: 'High', color: 'bg-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-500' }
};

const taskTypeConfig = {
  w2_correction: { label: 'W-2 Correction', icon: '📄' },
  voided_check: { label: 'Voided Check', icon: '❌' },
  manual_tax_override: { label: 'Tax Override', icon: '🧮' },
  support_escalation: { label: 'Support Escalation', icon: '🆘' },
  compliance_review: { label: 'Compliance Review', icon: '🔍' }
};

export const InternalTaskQueue: React.FC = () => {
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['admin-tasks', selectedPriority],
    queryFn: async () => {
      let query = supabase
        .from('admin_tasks')
        .select(`
          *,
          company_settings(company_name)
        `)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });

      if (selectedPriority !== 'all') {
        query = query.eq('priority', selectedPriority);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data?.map(task => ({
        ...task,
        company_name: task.company_settings?.company_name
      })) || [];
    }
  });

  const handleCompleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('admin_tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error completing task:', error);
    }
  };

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
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Internal Tasks</CardTitle>
              <p className="text-sm text-muted-foreground">
                {tasks?.length || 0} pending tasks
              </p>
            </div>
          </div>
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1 rounded-md border border-border bg-background text-sm"
          >
            <option value="all">All Priority</option>
            {Object.entries(priorityConfig).map(([priority, config]) => (
              <option key={priority} value={priority}>{config.label}</option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3 max-h-80 overflow-y-auto"
          >
            <AnimatePresence>
              {tasks?.map((task) => {
                const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig];
                const typeInfo = taskTypeConfig[task.task_type as keyof typeof taskTypeConfig];
                const isOverdue = new Date(task.due_date) < new Date();
                
                return (
                  <motion.div
                    key={task.id}
                    variants={itemVariants}
                    layout
                    className="group p-3 rounded-lg border border-border/40 bg-background/50 hover:bg-background/80 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 text-lg">
                          {typeInfo?.icon || '📋'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
                            <Badge variant="outline" className={`text-xs ${priorityInfo?.color || 'bg-gray-500'} text-white`}>
                              {priorityInfo?.label || task.priority}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                            {task.estimated_hours && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{task.estimated_hours}h</span>
                              </div>
                            )}
                            {task.company_name && (
                              <span>{task.company_name}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Done
                        </Button>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};