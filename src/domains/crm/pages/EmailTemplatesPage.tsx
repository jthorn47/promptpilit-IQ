import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmailTemplates } from "../hooks";

export default function EmailTemplatesPage() {
  const { templates, loading } = useEmailTemplates();

  if (loading) {
    return <div className="p-6">Loading email templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-600">Manage your email templates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{template.subject}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}