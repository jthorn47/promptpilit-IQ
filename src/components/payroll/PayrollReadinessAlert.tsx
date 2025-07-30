import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Users, HardHat, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PayrollReadinessData {
  is_ready: boolean;
  issues: string[];
  employee_count: number;
  missing_division_count?: number;
  missing_job_title_count?: number;
  missing_workers_comp_count?: number;
}

interface PayrollReadinessAlertProps {
  data: PayrollReadinessData;
  companyId: string;
}

export const PayrollReadinessAlert = ({ data, companyId }: PayrollReadinessAlertProps) => {
  const navigate = useNavigate();

  if (data.is_ready) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Users className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Payroll Ready</AlertTitle>
        <AlertDescription className="text-green-700">
          All {data.employee_count} employees have required job titles and workers' compensation codes assigned.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Payroll Processing Blocked</AlertTitle>
      <AlertDescription className="space-y-4">
        <div>
          <p className="font-medium mb-2">Required data missing for payroll processing:</p>
          <ul className="space-y-1">
            {data.issues.map((issue, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {(data.missing_job_title_count || 0) > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/payroll/job-titles')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Job Titles
            </Button>
          )}
          
          {(data.missing_workers_comp_count || 0) > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/payroll/workers-comp')}
              className="flex items-center gap-2"
            >
              <HardHat className="h-4 w-4" />
              Manage Workers' Comp
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/payroll/employees')}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Employee Manager
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};