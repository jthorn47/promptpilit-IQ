import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmailTemplates } from "../hooks/useEmailTemplates";

export const EmailTemplatesManager = () => {
  const { templates, loading } = useEmailTemplates();

  if (loading) {
    return <div className="p-6">Loading email templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{template.subject}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};