import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface ComplianceDashboardProps {
  region?: string;
  vertical?: string;
  client?: string;
}

export function ComplianceDashboard({ region, vertical, client }: ComplianceDashboardProps) {
  const complianceData = [
    { state: "CA", compliant: 89, at_risk: 12, delinquent: 3 },
    { state: "TX", compliant: 95, at_risk: 8, delinquent: 2 },
    { state: "NY", compliant: 87, at_risk: 15, delinquent: 4 },
    { state: "FL", compliant: 92, at_risk: 10, delinquent: 2 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Regulatory Compliance Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="compliant" stackId="a" fill="#22C55E" />
              <Bar dataKey="at_risk" stackId="a" fill="#F59E0B" />
              <Bar dataKey="delinquent" stackId="a" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}