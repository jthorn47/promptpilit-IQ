import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM Settings</h1>
        <p className="text-muted-foreground">
          Configure CRM preferences and settings
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">CRM settings features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}