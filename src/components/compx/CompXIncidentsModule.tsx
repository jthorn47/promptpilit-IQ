import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Eye,
  Edit,
  AlertTriangle,
  Camera,
  FileText,
  Clock,
  MapPin,
  User
} from "lucide-react";

interface Incident {
  id: string;
  incidentNumber: string;
  employee: string;
  date: string;
  time: string;
  location: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  reportedBy: string;
  hasPhotos: boolean;
  hasWitnesses: boolean;
}

export const CompXIncidentsModule = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock incidents data
  const incidents: Incident[] = [
    {
      id: "1",
      incidentNumber: "INC-2024-001",
      employee: "John Smith", 
      date: "2024-01-15",
      time: "14:30",
      location: "Warehouse - Bay 3",
      type: "Slip and Fall",
      severity: "Minor",
      description: "Employee slipped on wet floor near loading dock",
      status: "Under Investigation",
      reportedBy: "Mike Johnson",
      hasPhotos: true,
      hasWitnesses: true
    },
    {
      id: "2",
      incidentNumber: "INC-2024-002", 
      employee: "Sarah Davis",
      date: "2024-01-12",
      time: "09:15",
      location: "Production Floor - Line 2",
      type: "Equipment Injury",
      severity: "Moderate",
      description: "Hand caught in machinery during routine operation",
      status: "Investigation Complete",
      reportedBy: "Lisa Wilson",
      hasPhotos: true,
      hasWitnesses: false
    },
    {
      id: "3",
      incidentNumber: "INC-2024-003",
      employee: "Robert Garcia",
      date: "2024-01-08", 
      time: "16:45",
      location: "Office - 2nd Floor",
      type: "Ergonomic Injury",
      severity: "Minor",
      description: "Back strain from lifting heavy boxes",
      status: "Closed",
      reportedBy: "Jennifer Lee",
      hasPhotos: false,
      hasWitnesses: false
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Minor":
        return "bg-green-100 text-green-800";
      case "Moderate":
        return "bg-amber-100 text-amber-800";
      case "Severe":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Under Investigation":
        return "secondary";
      case "Investigation Complete":
        return "default";
      case "Closed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const filteredIncidents = incidents.filter(incident =>
    incident.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Incident Management</h2>
          <p className="text-muted-foreground">
            Report, track, and investigate workplace incidents
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.status === "Under Investigation").length}
            </div>
            <p className="text-xs text-muted-foreground">Active cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severe Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.severity === "Severe").length}
            </div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">From report to investigation</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>
            {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <div key={incident.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="font-semibold">{incident.incidentNumber}</div>
                      <div className="text-sm text-muted-foreground">{incident.employee}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(incident.status) as any}>
                      {incident.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-sm">{incident.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date/Time:</span>
                  </div>
                  <div className="text-sm font-medium">
                    {incident.date} at {incident.time}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                  </div>
                  <div className="text-sm font-medium">
                    {incident.location}
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                  </div>
                  <div className="text-sm font-medium">
                    {incident.type}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Reported by: {incident.reportedBy}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {incident.hasPhotos && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Camera className="h-4 w-4" />
                        Photos
                      </div>
                    )}
                    {incident.hasWitnesses && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        Witnesses
                      </div>
                    )}
                    {!incident.hasPhotos && !incident.hasWitnesses && (
                      <div className="text-sm text-muted-foreground">
                        No additional evidence
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};