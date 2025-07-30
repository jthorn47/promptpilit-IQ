import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText, BarChart3 } from "lucide-react";
import { useAnalyticsReports } from "../hooks";

export const AnalyticsReports = () => {
  const { reports, loading, generateReport } = useAnalyticsReports();

  const handleGenerateReport = async () => {
    try {
      await generateReport({
        report_name: `Training Analytics Report - ${new Date().toLocaleDateString()}`,
        report_type: 'training_summary',
        date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_range_end: new Date().toISOString().split('T')[0],
        report_data: {
          sections: ['completion_rates', 'performance_metrics', 'compliance_status'],
          filters: { department: 'all', location: 'all' }
        },
        is_scheduled: false
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Reports</h1>
          <p className="text-gray-600">Generate and manage comprehensive analytics reports</p>
        </div>
        <Button onClick={handleGenerateReport}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Training Analytics</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Comprehensive training completion rates, performance metrics, and learning outcomes.
          </p>
          <Button variant="outline" size="sm" className="w-full">Generate Report</Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Compliance Report</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Detailed compliance status, certification tracking, and regulatory adherence.
          </p>
          <Button variant="outline" size="sm" className="w-full">Generate Report</Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Executive Summary</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            High-level overview with key metrics and strategic insights for leadership.
          </p>
          <Button variant="outline" size="sm" className="w-full">Generate Report</Button>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reports generated yet. Create your first report to get started.
              </div>
            ) : (
              reports.slice(0, 10).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium">{report.report_name}</h4>
                      <p className="text-sm text-gray-500">
                        Generated on {new Date(report.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{report.report_type}</Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
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