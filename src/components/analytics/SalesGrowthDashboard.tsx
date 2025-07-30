import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Users, DollarSign } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

interface SalesGrowthDashboardProps {
  region?: string;
  vertical?: string;
  client?: string;
}

export function SalesGrowthDashboard({ region, vertical, client }: SalesGrowthDashboardProps) {
  const pipelineData = [
    { stage: "Lead", count: 234, value: 2340000 },
    { stage: "Qualified", count: 156, value: 1890000 },
    { stage: "Proposal", count: 89, value: 1450000 },
    { stage: "Negotiation", count: 45, value: 980000 },
    { stage: "Closed Won", count: 23, value: 560000 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sales Pipeline Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#655DC6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}