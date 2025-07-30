import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Rocket, 
  AlertTriangle, 
  Download, 
  BarChart3, 
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActionsTile = () => {
  const navigate = useNavigate();

  const adminShortcuts = [
    {
      title: "Add New LMS Client",
      action: () => navigate('/admin/companies/new?template=lms')
    },
    {
      title: "Launch Onboarding Wizard",
      action: () => navigate('/admin/companies/{id}/onboarding-wizard')
    },
    {
      title: "View Incomplete Setups",
      action: () => navigate('/admin/companies?filter=onboarding:incomplete')
    },
    {
      title: "Export Inactive Learners",
      action: () => navigate('/admin/learners?filter=status:inactive&export=true')
    },
    {
      title: "View LMS Metrics",
      action: () => navigate('/admin/analytics/lms')
    }
  ];

  return (
    <Card className="shadow-elegant border-0 bg-gradient-to-br from-blue-50/30 via-card to-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Admin Shortcuts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Power user control panel
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {adminShortcuts.map((shortcut, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start hover:bg-accent"
            onClick={shortcut.action}
          >
            {shortcut.title}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};