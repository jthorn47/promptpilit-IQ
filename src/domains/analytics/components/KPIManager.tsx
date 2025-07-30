import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, BarChart3, CheckCircle } from "lucide-react";
import { useKPIDefinitions } from "../hooks";

export const KPIManager = () => {
  const { kpis, loading, createKPI } = useKPIDefinitions();

  const handleCreateKPI = async () => {
    try {
      await createKPI({
        name: "Sample KPI",
        description: "A sample key performance indicator",
        calculation_method: "percentage",
        target_value: 85,
        is_active: true,
        category: "performance",
        source_tables: ["training_completions"]
      });
    } catch (error) {
      console.error('Failed to create KPI:', error);
    }
  };

  const getKPIIcon = (calculationMethod: string) => {
    switch (calculationMethod) {
      case 'percentage':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'count':
        return <BarChart3 className="w-5 h-5 text-green-600" />;
      case 'average':
        return <Target className="w-5 h-5 text-purple-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return <div className="p-6">Loading KPIs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KPI Management</h1>
          <p className="text-gray-600">Define and track key performance indicators</p>
        </div>
        <Button onClick={handleCreateKPI}>
          <Target className="w-4 h-4 mr-2" />
          Create KPI
        </Button>
      </div>

      {/* KPI Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-semibold">Performance KPIs</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Track learning outcomes and training effectiveness
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold">Engagement KPIs</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Monitor user engagement and participation rates
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-8 h-8 text-purple-600" />
            <h3 className="text-lg font-semibold">Compliance KPIs</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Ensure regulatory compliance and certification tracking
          </p>
        </Card>
      </div>

      {/* KPI List */}
      <Card>
        <CardHeader>
          <CardTitle>Defined KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kpis.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No KPIs Defined</h3>
                <p className="text-gray-500 mb-4">
                  Start by creating your first KPI to track important business metrics.
                </p>
                <Button onClick={handleCreateKPI}>Create Your First KPI</Button>
              </div>
            ) : (
              kpis.map((kpi) => (
                <div key={kpi.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getKPIIcon(kpi.calculation_method)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                      <p className="text-sm text-gray-500">{kpi.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{kpi.calculation_method}</Badge>
                        {kpi.target_value && (
                          <Badge variant="secondary">Target: {kpi.target_value}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {kpi.is_active ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};