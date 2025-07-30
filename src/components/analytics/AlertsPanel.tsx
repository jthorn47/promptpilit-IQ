import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function AlertsPanel() {
  const [alerts] = useState([
    { id: 1, type: "critical", message: "3 compliance issues require immediate attention", time: "2 min ago" },
    { id: 2, type: "warning", message: "RetailCorp payroll submission is overdue", time: "15 min ago" },
    { id: 3, type: "info", message: "Weekly BI report generated successfully", time: "1 hour ago" }
  ]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {alerts.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {alerts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-semibold">Recent Alerts</h4>
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-2 rounded border">
              <Badge variant={alert.type === "critical" ? "destructive" : alert.type === "warning" ? "secondary" : "outline"}>
                {alert.type}
              </Badge>
              <div className="flex-1">
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}