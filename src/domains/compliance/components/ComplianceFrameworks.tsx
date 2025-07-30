import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useComplianceFrameworks } from '../hooks/useComplianceFrameworks';

export const ComplianceFrameworks = () => {
  const { frameworks, loading } = useComplianceFrameworks();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fully Supported':
        return 'bg-green-100 text-green-800';
      case 'Available':
        return 'bg-blue-100 text-blue-800';
      case 'Configurable':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'State Law':
        return 'bg-purple-100 text-purple-800';
      case 'Federal':
        return 'bg-blue-100 text-blue-800';
      case 'Corporate':
        return 'bg-orange-100 text-orange-800';
      case 'Industry':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supported Compliance Frameworks</CardTitle>
          <CardDescription>
            Comprehensive coverage of federal, state, and industry-specific compliance requirements
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks.map((framework) => (
          <Card key={framework.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <CardTitle className="text-lg">{framework.name}</CardTitle>
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={getStatusColor(framework.status)}>
                    {framework.status}
                  </Badge>
                  <Badge variant="outline" className={getCategoryColor(framework.category)}>
                    {framework.category}
                  </Badge>
                </div>
              </div>
              <CardDescription>{framework.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Requirements:</h4>
                {framework.requirements.map((requirement, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{requirement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Framework Summary</CardTitle>
          <CardDescription>
            Overview of compliance framework coverage by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['State Law', 'Federal', 'Corporate', 'Industry'].map((category) => {
              const count = frameworks.filter(f => f.category === category).length;
              return (
                <div key={category} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-sm text-muted-foreground">{category}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};