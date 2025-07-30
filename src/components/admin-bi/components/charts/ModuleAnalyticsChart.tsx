import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import type { TrainingModuleStats } from "../../types";

interface ModuleAnalyticsChartProps {
  data: TrainingModuleStats[];
}

export function ModuleAnalyticsChart({ data }: ModuleAnalyticsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Module Analytics</CardTitle>
        <CardDescription>Module popularity and completion rates</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="module" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="popularity" fill="#10B981" name="Assignments" />
            <Line yAxisId="right" type="monotone" dataKey="completionRate" stroke="#655DC6" strokeWidth={2} name="Completion %" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}