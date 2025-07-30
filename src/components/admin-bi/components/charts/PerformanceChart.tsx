import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import type { EmployeePerformance } from "../../types";

interface PerformanceChartProps {
  data: EmployeePerformance[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Performance Analysis</CardTitle>
        <CardDescription>Completion rate vs average score</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="efficiency" name="Completion Rate %" />
            <YAxis dataKey="score" name="Average Score" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter dataKey="completed" fill="#655DC6" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}