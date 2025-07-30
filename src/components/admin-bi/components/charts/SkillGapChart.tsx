import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RadialBarChart, 
  RadialBar, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import type { SkillGapAnalysis } from "../../types";

interface SkillGapChartProps {
  data: SkillGapAnalysis[];
}

export function SkillGapChart({ data }: SkillGapChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Gap Analysis</CardTitle>
        <CardDescription>Required vs current skill levels by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={data}>
            <RadialBar dataKey="current" cornerRadius={10} fill="#655DC6" />
            <RadialBar dataKey="gap" cornerRadius={10} fill="#EF4444" />
            <Tooltip />
            <Legend />
          </RadialBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}