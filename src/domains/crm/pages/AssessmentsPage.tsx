import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssessmentsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk Assessments</h1>
        <p className="text-muted-foreground">
          Evaluate and manage client risk profiles
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Risk assessment features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}