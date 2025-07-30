import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import type { DepartmentData } from "../../types";

interface DepartmentChartProps {
  data: DepartmentData[];
}

export function DepartmentChart({ data }: DepartmentChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
        <CardDescription>Training completion by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" fill="#655DC6" name="Completed" />
            <Bar dataKey="inProgress" fill="#10B981" name="In Progress" />
            <Bar dataKey="notStarted" fill="#F59E0B" name="Not Started" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}