import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Calendar } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface ClientFacingDashboardProps {
  region?: string;
  vertical?: string;
  client?: string;
}

export function ClientFacingDashboard({ region, vertical, client }: ClientFacingDashboardProps) {
  const headcountData = [
    { month: "Jan", count: 145, forecast: 150 },
    { month: "Feb", count: 148, forecast: 155 },
    { month: "Mar", count: 152, forecast: 160 },
    { month: "Apr", count: 156, forecast: 165 },
    { month: "May", count: 159, forecast: 170 },
    { month: "Jun", count: 162, forecast: 175 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Headcount Trends & Forecast
          </CardTitle>
          <CardDescription>Your workforce growth insights</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={headcountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#655DC6" strokeWidth={2} />
              <Line type="monotone" dataKey="forecast" stroke="#F59E0B" strokeDasharray="5 5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}