import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, FileCheck, AlertTriangle, Users, Calendar, Download } from "lucide-react";

export default function SafetyTrainingManager() {
  const [activeTab, setActiveTab] = useState("training");

  const trainingModules = [
    {
      id: "workplace-violence",
      title: "SB 553 Workplace Violence Prevention",
      description: "California's workplace violence prevention requirements",
      status: "completed",
      progress: 100,
      dueDate: "Required",
      certificateAvailable: true
    },
    {
      id: "harassment-prevention",
      title: "Harassment Prevention Training",
      description: "Sexual harassment prevention for California employees",
      status: "in-progress",
      progress: 65,
      dueDate: "Dec 31, 2024",
      certificateAvailable: false
    },
    {
      id: "safety-orientation",
      title: "General Safety Orientation",
      description: "Basic safety protocols and emergency procedures",
      status: "not-started",
      progress: 0,
      dueDate: "Jan 15, 2025",
      certificateAvailable: false
    },
    {
      id: "industry-specific",
      title: "Industry-Specific Safety",
      description: "Safety training for warehouse and manufacturing",
      status: "completed",
      progress: 100,
      dueDate: "Completed",
      certificateAvailable: true
    }
  ];

  const incidentReports = [
    {
      id: "1",
      date: "2024-12-01",
      client: "Acme Manufacturing",
      type: "Near Miss",
      severity: "Low",
      status: "Closed",
      description: "Employee slipped but caught themselves near wet floor"
    },
    {
      id: "2",
      date: "2024-11-28",
      client: "Pacific Logistics",
      type: "Injury",
      severity: "Medium",
      status: "Under Review",
      description: "Worker strained back lifting heavy box"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "not-started":
        return <Badge variant="secondary">Not Started</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "High":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Safety & Training</h1>
        <p className="text-muted-foreground">
          Manage safety compliance and training requirements
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              3 of 4 modules complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Current</div>
            <p className="text-xs text-muted-foreground">
              All required training up to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents YTD</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Below industry average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers Trained</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">
              This calendar year
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-1">
        <Button 
          variant={activeTab === "training" ? "default" : "outline"}
          onClick={() => setActiveTab("training")}
        >
          Training Modules
        </Button>
        <Button 
          variant={activeTab === "incidents" ? "default" : "outline"}
          onClick={() => setActiveTab("incidents")}
        >
          Incident Reports
        </Button>
        <Button 
          variant={activeTab === "certificates" ? "default" : "outline"}
          onClick={() => setActiveTab("certificates")}
        >
          Certificates
        </Button>
      </div>

      {activeTab === "training" && (
        <Card>
          <CardHeader>
            <CardTitle>Training Modules</CardTitle>
            <CardDescription>Complete required safety training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingModules.map((module) => (
                <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{module.title}</h3>
                      {getStatusBadge(module.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Progress value={module.progress} className="w-24" />
                        <span className="text-sm text-muted-foreground">{module.progress}%</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {module.dueDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {module.certificateAvailable && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Certificate
                      </Button>
                    )}
                    <Button size="sm" disabled={module.status === "completed"}>
                      {module.status === "completed" ? "Completed" : "Continue"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "incidents" && (
        <Card>
          <CardHeader>
            <CardTitle>Incident Reports</CardTitle>
            <CardDescription>Track workplace incidents and safety events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidentReports.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{incident.client} - {incident.type}</h3>
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(incident.severity)}
                        <Badge variant={incident.status === "Closed" ? "secondary" : "default"}>
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                    <p className="text-xs text-muted-foreground">Date: {incident.date}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "certificates" && (
        <Card>
          <CardHeader>
            <CardTitle>Safety Certificates</CardTitle>
            <CardDescription>Download and manage your safety certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">SB 553 Workplace Violence Prevention Certificate</h3>
                  <p className="text-sm text-muted-foreground">Issued: Dec 10, 2024 • Expires: Dec 10, 2025</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Industry-Specific Safety Certificate</h3>
                  <p className="text-sm text-muted-foreground">Issued: Nov 15, 2024 • Expires: Nov 15, 2026</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}