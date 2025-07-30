import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import type { DepartmentData } from "../../types";

interface DepartmentsTabProps {
  departmentData: DepartmentData[];
}

export function DepartmentsTab({ departmentData }: DepartmentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Analytics</CardTitle>
        <CardDescription>Detailed breakdown by department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {departmentData.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Building className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{dept.department}</h4>
                  <p className="text-sm text-muted-foreground">
                    {dept.total} total assignments
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex space-x-2">
                    <Badge variant="default">{dept.completed} Completed</Badge>
                    <Badge variant="secondary">{dept.inProgress} In Progress</Badge>
                    <Badge variant="outline">{dept.notStarted} Not Started</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((dept.completed / dept.total) * 100).toFixed(1)}% compliance
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}