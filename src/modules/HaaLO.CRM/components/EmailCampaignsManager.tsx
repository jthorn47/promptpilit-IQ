import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmailCampaigns } from "../hooks/useEmailCampaigns";

export const EmailCampaignsManager = () => {
  const { campaigns, loading } = useEmailCampaigns();

  if (loading) {
    return <div className="p-6">Loading email campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Campaigns</h1>
        <p className="text-muted-foreground">Manage your email campaigns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <CardTitle>{campaign.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{campaign.subject}</p>
              <p className="text-xs text-muted-foreground mt-2">Status: {campaign.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};