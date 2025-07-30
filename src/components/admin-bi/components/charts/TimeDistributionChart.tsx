import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import type { TimeDistribution } from "../../types";

interface TimeDistributionChartProps {
  data: TimeDistribution[];
}

export function TimeDistributionChart({ data }: TimeDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Activity by Time</CardTitle>
        <CardDescription>Peak training completion hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="completions" stroke="#655DC6" fill="#655DC6" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}