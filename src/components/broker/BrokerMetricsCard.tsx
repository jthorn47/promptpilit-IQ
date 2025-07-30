import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrokerMetricsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  color: "blue" | "green" | "purple" | "orange";
}

const colorVariants = {
  blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
  green: "text-green-600 bg-green-100 dark:bg-green-900/20",
  purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
  orange: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
};

export const BrokerMetricsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color
}: BrokerMetricsCardProps) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full", colorVariants[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
        {trend && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};