import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type {
  BIMetrics,
  DepartmentData,
  ComplianceData,
  TrendData,
  EmployeePerformance,
  TrainingModuleStats,
  TimeDistribution,
  SkillGapAnalysis,
  AtRiskEmployee
} from "../types";

export function useBIData(dateRange: string, departmentFilter: string) {
  const [metrics, setMetrics] = useState<BIMetrics | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [moduleStats, setModuleStats] = useState<TrainingModuleStats[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [skillGapData, setSkillGapData] = useState<SkillGapAnalysis[]>([]);
  const [atRiskEmployees, setAtRiskEmployees] = useState<AtRiskEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { isCompanyAdmin, userRoles } = useAuth();

  const fetchBIData = async () => {
    try {
      setLoading(true);
      
      // Get user's company ID - userRoles is now string[] so we need to fetch from user_roles table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('role', 'company_admin')
        .single();
      
      const userCompanyId = userRoleData?.company_id;
      
      if (!userCompanyId) {
        throw new Error('Company not found for user');
      }

      // Fetch employees for the company
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', userCompanyId)
        .eq('status', 'active');

      if (employeesError) throw employeesError;

      // Fetch training assignments with completions
      const { data: assignments, error: assignmentsError } = await supabase
        .from('training_assignments')
        .select(`
          *,
          training_modules(title, estimated_duration),
          training_completions(status, completed_at, quiz_score, video_watched_seconds),
          employees!inner(company_id, department, first_name, last_name, email)
        `)
        .eq('employees.company_id', userCompanyId);

      if (assignmentsError) throw assignmentsError;

      // Fetch certificates
      const { data: certificates, error: certificatesError } = await supabase
        .from('certificates')
        .select(`
          *,
          employees!inner(company_id)
        `)
        .eq('employees.company_id', userCompanyId)
        .eq('status', 'active');

      if (certificatesError) throw certificatesError;

      // Process data
      const totalEmployees = employees?.length || 0;
      const totalAssignments = assignments?.length || 0;
      const completedAssignments = assignments?.filter(a => 
        a.training_completions?.[0]?.status === 'completed'
      ) || [];
      
      const complianceRate = totalAssignments > 0 ? 
        (completedAssignments.length / totalAssignments) * 100 : 0;

      // Calculate average completion time
      const completionTimes = completedAssignments
        .map(a => a.training_completions?.[0]?.video_watched_seconds || 0)
        .filter(time => time > 0);
      
      const averageCompletionTime = completionTimes.length > 0 ?
        completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length / 60 : 0; // Convert to minutes

      // Set metrics
      setMetrics({
        totalEmployees,
        totalAssignments,
        totalCompletions: completedAssignments.length,
        complianceRate,
        averageCompletionTime,
        certificatesIssued: certificates?.length || 0
      });

      // Process department data
      const deptMap = new Map<string, {completed: number, inProgress: number, notStarted: number, total: number}>();
      
      assignments?.forEach(assignment => {
        const dept = assignment.employees?.department || 'Unknown';
        const status = assignment.training_completions?.[0]?.status || 'not_started';
        
        if (!deptMap.has(dept)) {
          deptMap.set(dept, {completed: 0, inProgress: 0, notStarted: 0, total: 0});
        }
        
        const deptStats = deptMap.get(dept)!;
        deptStats.total++;
        
        if (status === 'completed') deptStats.completed++;
        else if (status === 'in_progress') deptStats.inProgress++;
        else deptStats.notStarted++;
      });

      const departmentStats = Array.from(deptMap.entries()).map(([department, stats]) => ({
        department,
        ...stats
      }));
      
      setDepartmentData(departmentStats);
      setDepartments(Array.from(deptMap.keys()));

      // Process compliance pie chart data
      const totalAssigned = assignments?.length || 0;
      const completed = completedAssignments.length;
      const inProgress = assignments?.filter(a => 
        a.training_completions?.[0]?.status === 'in_progress'
      ).length || 0;
      const notStarted = totalAssigned - completed - inProgress;

      setComplianceData([
        { name: 'Completed', value: completed, percentage: totalAssigned > 0 ? (completed / totalAssigned) * 100 : 0 },
        { name: 'In Progress', value: inProgress, percentage: totalAssigned > 0 ? (inProgress / totalAssigned) * 100 : 0 },
        { name: 'Not Started', value: notStarted, percentage: totalAssigned > 0 ? (notStarted / totalAssigned) * 100 : 0 }
      ]);

      // Process trend data (last 30 days)
      const last30Days = Array.from({length: 30}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date;
      });

      const trendStats = last30Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayCompletions = completedAssignments.filter(a => {
          const completedDate = new Date(a.training_completions?.[0]?.completed_at || '');
          return completedDate.toISOString().split('T')[0] === dateStr;
        }).length;

        const dayAssignments = assignments?.filter(a => {
          const assignedDate = new Date(a.assigned_at);
          return assignedDate.toISOString().split('T')[0] === dateStr;
        }).length || 0;

        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completions: dayCompletions,
          assignments: dayAssignments
        };
      });

      setTrendData(trendStats);

      // Process employee performance data
      const performanceData = employees?.slice(0, 10).map(employee => {
        const empAssignments = assignments?.filter(a => a.employee_id === employee.id) || [];
        const empCompleted = empAssignments.filter(a => a.training_completions?.[0]?.status === 'completed').length;
        const empInProgress = empAssignments.filter(a => a.training_completions?.[0]?.status === 'in_progress').length;
        const avgScore = empAssignments.reduce((sum, a) => sum + (a.training_completions?.[0]?.quiz_score || 0), 0) / (empAssignments.length || 1);
        
        return {
          name: `${employee.first_name} ${employee.last_name}`,
          completed: empCompleted,
          inProgress: empInProgress,
          score: Math.round(avgScore),
          efficiency: empCompleted / (empAssignments.length || 1) * 100
        };
      }) || [];
      
      setEmployeePerformance(performanceData);

      // Process training module statistics
      const moduleStatsData = await Promise.all(
        (await supabase.from('training_modules').select('*').limit(6)).data?.map(async (module) => {
          const moduleAssignments = assignments?.filter(a => a.training_module_id === module.id) || [];
          const moduleCompletions = moduleAssignments.filter(a => a.training_completions?.[0]?.status === 'completed');
          const avgScore = moduleCompletions.reduce((sum, a) => sum + (a.training_completions?.[0]?.quiz_score || 0), 0) / (moduleCompletions.length || 1);
          
          return {
            module: module.title.length > 20 ? module.title.substring(0, 20) + '...' : module.title,
            popularity: moduleAssignments.length,
            avgScore: Math.round(avgScore),
            completionRate: Math.round((moduleCompletions.length / (moduleAssignments.length || 1)) * 100),
            difficulty: Math.round(100 - avgScore) // Inverse of average score as difficulty
          };
        }) || []
      );
      
      setModuleStats(moduleStatsData);

      // Process time distribution data (hourly completion patterns)
      const hourlyData = Array.from({length: 24}, (_, hour) => {
        const hourCompletions = completedAssignments.filter(a => {
          const completedHour = new Date(a.training_completions?.[0]?.completed_at || '').getHours();
          return completedHour === hour;
        }).length;
        
        return {
          hour: `${hour}:00`,
          completions: hourCompletions,
          engagement: Math.round((hourCompletions / (completedAssignments.length || 1)) * 100)
        };
      });
      
      setTimeDistribution(hourlyData);

      // Process skill gap analysis (mock data based on departments)
      const skillGapData = departments.slice(0, 6).map(dept => {
        const deptEmployees = employees?.filter(e => e.department === dept) || [];
        const deptCompletions = deptEmployees.reduce((sum, emp) => {
          return sum + (assignments?.filter(a => 
            a.employee_id === emp.id && a.training_completions?.[0]?.status === 'completed'
          ).length || 0);
        }, 0);
        
        const required = deptEmployees.length * 4; // Assuming 4 required trainings per employee
        const current = deptCompletions;
        
        return {
          skill: dept,
          required: 100,
          current: Math.round((current / (required || 1)) * 100),
          gap: Math.round(((required - current) / (required || 1)) * 100)
        };
      });
      
      setSkillGapData(skillGapData);

      // Identify at-risk employees
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      
      const atRisk = employees?.map(employee => {
        const employeeAssignments = assignments?.filter(a => a.employee_id === employee.id) || [];
        const overdueTrainings = employeeAssignments.filter(a => {
          const dueDate = new Date(a.due_date || '');
          const status = a.training_completions?.[0]?.status;
          return dueDate < now && status !== 'completed';
        }).length;

        const lastCompletion = employeeAssignments
          .filter(a => a.training_completions?.[0]?.completed_at)
          .sort((a, b) => new Date(b.training_completions?.[0]?.completed_at || '').getTime() - 
                         new Date(a.training_completions?.[0]?.completed_at || '').getTime())[0];

        const lastActivity = lastCompletion?.training_completions?.[0]?.completed_at || 'Never';
        const lastActivityDate = lastActivity !== 'Never' ? new Date(lastActivity) : null;

        return {
          id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
          email: employee.email,
          department: employee.department || 'Unknown',
          overdueTrainings,
          lastActivity: lastActivity !== 'Never' ? 
            lastActivityDate!.toLocaleDateString() : 'Never'
        };
      }).filter(emp => emp.overdueTrainings > 0 || emp.lastActivity === 'Never')
        .sort((a, b) => b.overdueTrainings - a.overdueTrainings)
        .slice(0, 10) || [];

      setAtRiskEmployees(atRisk);

    } catch (error) {
      console.error('Error fetching BI data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCompanyAdmin) {
      fetchBIData();
    }
  }, [dateRange, departmentFilter]);

  return {
    metrics,
    departmentData,
    complianceData,
    trendData,
    employeePerformance,
    moduleStats,
    timeDistribution,
    skillGapData,
    atRiskEmployees,
    loading,
    departments
  };
}