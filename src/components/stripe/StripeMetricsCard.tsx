import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StripeMetricsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export const StripeMetricsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = "neutral" 
}: StripeMetricsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${
            changeType === "positive" 
              ? "text-green-600" 
              : changeType === "negative" 
                ? "text-red-600" 
                : "text-muted-foreground"
          }`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};