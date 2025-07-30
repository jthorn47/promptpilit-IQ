import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  Download, 
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings
} from "lucide-react";

const CustomReports = () => {
  const [activeTab, setActiveTab] = useState("templates");

  const reportTemplates = [
    {
      id: "1",
      name: "Executive Summary",
      description: "High-level overview of key business metrics",
      category: "Executive",
      lastModified: "2024-01-15",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: "2", 
      name: "Financial Performance",
      description: "Revenue, expenses, and profitability analysis",
      category: "Finance",
      lastModified: "2024-01-14",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: "3",
      name: "Client Analysis",
      description: "Client demographics, satisfaction, and retention",
      category: "Client",
      lastModified: "2024-01-13",
      icon: <PieChart className="h-5 w-5" />
    }
  ];

  const customReports = [
    {
      id: "1",
      name: "Q4 2024 Performance Review",
      description: "Comprehensive quarterly performance analysis",
      createdBy: "John Doe",
      createdDate: "2024-12-15",
      status: "completed"
    },
    {
      id: "2",
      name: "Monthly Client Retention Report",
      description: "Client retention metrics and trends",
      createdBy: "Jane Smith", 
      createdDate: "2024-12-10",
      status: "in_progress"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
          <p className="text-muted-foreground">
            Create, customize, and manage your business reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
            Reports IQ
          </Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            My Reports
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Pre-built report templates for common business analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {template.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Modified: {template.lastModified}
                        </span>
                        <Button size="sm" variant="outline">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Custom Reports</CardTitle>
                  <CardDescription>
                    Reports you've created and customized
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date Range
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(report.status)}
                          <span className="text-xs text-muted-foreground">
                            Created by {report.createdBy} on {report.createdDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Builder</CardTitle>
              <CardDescription>
                Create custom reports with drag-and-drop interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Advanced Report Builder
                  </h3>
                  <p className="text-gray-600 mb-6">
                    The visual report builder with drag-and-drop functionality is coming soon. 
                    Create custom reports with charts, tables, and interactive elements.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Features coming soon:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Drag-and-drop report components</li>
                      <li>• Custom chart and graph creation</li>
                      <li>• Real-time data connections</li>
                      <li>• Interactive filters and parameters</li>
                      <li>• Automated report scheduling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomReports;