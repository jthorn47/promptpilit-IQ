import { ComplianceChart } from "../charts/ComplianceChart";
import { DepartmentChart } from "../charts/DepartmentChart";
import { PerformanceChart } from "../charts/PerformanceChart";
import { ModuleAnalyticsChart } from "../charts/ModuleAnalyticsChart";
import { SkillGapChart } from "../charts/SkillGapChart";
import { TimeDistributionChart } from "../charts/TimeDistributionChart";
import type { 
  ComplianceData, 
  DepartmentData, 
  EmployeePerformance, 
  TrainingModuleStats, 
  SkillGapAnalysis, 
  TimeDistribution 
} from "../../types";

interface OverviewTabProps {
  complianceData: ComplianceData[];
  departmentData: DepartmentData[];
  employeePerformance: EmployeePerformance[];
  moduleStats: TrainingModuleStats[];
  skillGapData: SkillGapAnalysis[];
  timeDistribution: TimeDistribution[];
}

export function OverviewTab({ 
  complianceData, 
  departmentData, 
  employeePerformance, 
  moduleStats, 
  skillGapData, 
  timeDistribution 
}: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ComplianceChart data={complianceData} />
      <DepartmentChart data={departmentData} />
      <PerformanceChart data={employeePerformance} />
      <ModuleAnalyticsChart data={moduleStats} />
      <SkillGapChart data={skillGapData} />
      <TimeDistributionChart data={timeDistribution} />
    </div>
  );
}