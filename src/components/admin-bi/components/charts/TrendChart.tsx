import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import type { TrendData } from "../../types";

interface TrendChartProps {
  data: TrendData[];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Trends</CardTitle>
        <CardDescription>Completion trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completions" 
              stroke="#655DC6" 
              strokeWidth={2}
              name="Completions"
            />
            <Line 
              type="monotone" 
              dataKey="assignments" 
              stroke="#10B981" 
              strokeWidth={2}
              name="New Assignments"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}