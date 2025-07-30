import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Target } from "lucide-react";
import type { AtRiskEmployee } from "../../types";

interface AlertsTabProps {
  atRiskEmployees: AtRiskEmployee[];
}

export function AlertsTab({ atRiskEmployees }: AlertsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>At-Risk Employees</span>
        </CardTitle>
        <CardDescription>
          Employees with overdue trainings or no recent activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {atRiskEmployees.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-700">All employees are on track!</h3>
            <p className="text-muted-foreground">No at-risk employees found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {atRiskEmployees.map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200">
                <div>
                  <h4 className="font-medium">{employee.name}</h4>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                  <p className="text-sm text-muted-foreground">{employee.department}</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="mb-1">
                    {employee.overdueTrainings} Overdue
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Last activity: {employee.lastActivity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}