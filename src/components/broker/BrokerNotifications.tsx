import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const BrokerNotifications = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: "commission_update",
      title: "Commission Payment Processed",
      message: "Your Q1 commission of $3,250 has been processed and will be deposited within 2 business days.",
      priority: "medium",
      isRead: false,
      createdAt: "2024-01-20T10:30:00Z"
    },
    {
      id: 2,
      type: "lead_status",
      title: "Lead Status Update",
      message: "TechCorp Solutions has moved to the proposal stage. Review the latest updates in your lead dashboard.",
      priority: "high",
      isRead: false,
      createdAt: "2024-01-19T14:22:00Z"
    },
    {
      id: 3,
      type: "compliance_reminder",
      title: "Document Renewal Required",
      message: "Your professional liability insurance expires in 30 days. Please upload the renewed documentation.",
      priority: "urgent",
      isRead: true,
      createdAt: "2024-01-18T09:15:00Z"
    },
    {
      id: 4,
      type: "training_due",
      title: "Training Module Available",
      message: "New compliance training module is now available. Complete by end of month to maintain certification.",
      priority: "medium",
      isRead: true,
      createdAt: "2024-01-17T16:45:00Z"
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const priorityColors = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    high: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs">
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="p-0">
                <div className={`w-full p-3 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge 
                        className={`text-xs ${priorityColors[notification.priority as keyof typeof priorityColors]}`}
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    <div className="flex gap-1">
                      {!notification.isRead && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View All Notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};