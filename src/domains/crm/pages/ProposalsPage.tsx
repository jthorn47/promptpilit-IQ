import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProposalsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
        <p className="text-muted-foreground">
          Create and manage client proposals
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Proposal Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Proposal management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}