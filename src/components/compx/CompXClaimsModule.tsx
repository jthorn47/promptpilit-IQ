import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompXNewClaimWizard } from "./CompXNewClaimWizard";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Plus, 
  Eye,
  Edit,
  DollarSign,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Workflow
} from "lucide-react";

interface Claim {
  id: string;
  claimNumber: string;
  employee: string;
  incidentDate: string;
  claimType: string;
  status: string;
  totalCosts: number;
  medicalCosts: number;
  lastUpdate: string;
  adjuster: string;
}

export const CompXClaimsModule = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isNewClaimWizardOpen, setIsNewClaimWizardOpen] = useState(false);

  // Mock claims data
  const claims: Claim[] = [
    {
      id: "1",
      claimNumber: "WC-2024-001",
      employee: "John Smith",
      incidentDate: "2024-01-15",
      claimType: "Medical Only",
      status: "Open",
      totalCosts: 5250.00,
      medicalCosts: 5250.00,
      lastUpdate: "2024-01-18",
      adjuster: "Sarah Wilson"
    },
    {
      id: "2", 
      claimNumber: "WC-2024-002",
      employee: "Maria Garcia",
      incidentDate: "2024-01-10",
      claimType: "Lost Time",
      status: "Under Review",
      totalCosts: 12750.00,
      medicalCosts: 8500.00,
      lastUpdate: "2024-01-17",
      adjuster: "Michael Brown"
    },
    {
      id: "3",
      claimNumber: "WC-2024-003",
      employee: "David Johnson",
      incidentDate: "2024-01-08",
      claimType: "Medical Only",
      status: "Closed",
      totalCosts: 3200.00,
      medicalCosts: 3200.00,
      lastUpdate: "2024-01-16",
      adjuster: "Lisa Davis"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "Under Review":
        return <Eye className="h-4 w-4 text-amber-500" />;
      case "Closed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Open":
        return "destructive";
      case "Under Review":
        return "secondary";
      case "Closed":
        return "default";
      default:
        return "outline";
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (activeTab === "open" && claim.status !== "Open") return false;
    if (activeTab === "review" && claim.status !== "Under Review") return false;
    if (activeTab === "closed" && claim.status !== "Closed") return false;
    
    return claim.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
           claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Claims Management</h2>
          <p className="text-muted-foreground">
            Manage workers' compensation claims and track their progress
          </p>
        </div>
        <Button onClick={() => setIsNewClaimWizardOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Workflow className="h-4 w-4 mr-2" />
          New Claim Wizard
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Claims</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.filter(c => c.status === "Open").length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${claims.reduce((sum, claim) => sum + claim.totalCosts, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Claim</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(claims.reduce((sum, claim) => sum + claim.totalCosts, 0) / claims.length).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Claims Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="review">Under Review</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claims List</CardTitle>
              <CardDescription>
                {filteredClaims.length} claim{filteredClaims.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClaims.map((claim) => (
                  <div key={claim.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(claim.status)}
                        <div>
                          <div className="font-semibold">{claim.claimNumber}</div>
                          <div className="text-sm text-muted-foreground">{claim.employee}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(claim.status) as any}>
                          {claim.status}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Incident:</span>
                        <span>{claim.incidentDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Type:</span>
                        <span>{claim.claimType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-medium">${claim.totalCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Adjuster:</span>
                        <span>{claim.adjuster}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompXNewClaimWizard
        isOpen={isNewClaimWizardOpen}
        onClose={() => setIsNewClaimWizardOpen(false)}
        onSubmit={(claimData) => {
          console.log('New claim:', claimData);
          toast({
            title: "Claim Created",
            description: "New workers' compensation claim has been created successfully.",
          });
        }}
      />
    </div>
  );
};