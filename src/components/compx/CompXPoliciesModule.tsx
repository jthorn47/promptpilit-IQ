import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Calendar, 
  DollarSign, 
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Building,
  Phone
} from "lucide-react";

interface Policy {
  id: string;
  policyNumber: string;
  carrierName: string;
  policyType: string;
  effectiveDate: string;
  expirationDate: string;
  annualPremium: number;
  deductible: number;
  status: string;
  coverageLimits: {
    bodily: string;
    property: string;
  };
  brokerInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

export const CompXPoliciesModule = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock policies data
  const policies: Policy[] = [
    {
      id: "1",
      policyNumber: "WC-2024-ABC123",
      carrierName: "ABC Insurance Company",
      policyType: "Workers' Compensation",
      effectiveDate: "2024-01-01",
      expirationDate: "2024-12-31",
      annualPremium: 45000,
      deductible: 1000,
      status: "Active",
      coverageLimits: {
        bodily: "$1,000,000",
        property: "$500,000"
      },
      brokerInfo: {
        name: "Smith Insurance Agency",
        phone: "(555) 123-4567",
        email: "contact@smithinsurance.com"
      }
    },
    {
      id: "2",
      policyNumber: "WC-2023-XYZ789",
      carrierName: "XYZ Mutual Insurance",
      policyType: "Workers' Compensation",
      effectiveDate: "2023-01-01",
      expirationDate: "2023-12-31",
      annualPremium: 42000,
      deductible: 500,
      status: "Expired",
      coverageLimits: {
        bodily: "$1,000,000",
        property: "$500,000"
      },
      brokerInfo: {
        name: "Johnson Insurance Group",
        phone: "(555) 987-6543",
        email: "info@johnsonig.com"
      }
    },
    {
      id: "3",
      policyNumber: "WC-2025-DEF456",
      carrierName: "DEF Insurance Solutions",
      policyType: "Workers' Compensation",
      effectiveDate: "2025-01-01",
      expirationDate: "2025-12-31",
      annualPremium: 48000,
      deductible: 1500,
      status: "Pending",
      coverageLimits: {
        bodily: "$1,000,000",
        property: "$500,000"
      },
      brokerInfo: {
        name: "Wilson Insurance Brokers",
        phone: "(555) 456-7890",
        email: "support@wilsonib.com"
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "Pending":
        return <Calendar className="h-4 w-4 text-amber-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Expired":
        return "destructive";
      case "Pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const expiry = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredPolicies = policies.filter(policy =>
    policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.carrierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const policyMetrics = {
    totalPolicies: policies.length,
    activePolicies: policies.filter(p => p.status === "Active").length,
    totalPremium: policies.filter(p => p.status === "Active").reduce((sum, p) => sum + p.annualPremium, 0),
    expiringSoon: policies.filter(p => {
      const days = getDaysUntilExpiration(p.expirationDate);
      return days <= 60 && days > 0;
    }).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Policy Management</h2>
          <p className="text-muted-foreground">
            Manage workers' compensation insurance policies and coverage
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {/* Policy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policyMetrics.totalPolicies}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{policyMetrics.activePolicies}</div>
            <p className="text-xs text-muted-foreground">Currently in force</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${policyMetrics.totalPremium.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active policies total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{policyMetrics.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 60 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Policies List */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Policies</CardTitle>
          <CardDescription>
            {filteredPolicies.length} polic{filteredPolicies.length !== 1 ? 'ies' : 'y'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredPolicies.map((policy) => {
              const daysUntilExpiry = getDaysUntilExpiration(policy.expirationDate);
              
              return (
                <div key={policy.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(policy.status)}
                      <div>
                        <div className="font-semibold text-lg">{policy.policyNumber}</div>
                        <div className="text-muted-foreground">{policy.carrierName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(policy.status) as any}>
                        {policy.status}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Coverage Period</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Effective: {policy.effectiveDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Expires: {policy.expirationDate}</span>
                        </div>
                        {policy.status === "Active" && daysUntilExpiry <= 60 && daysUntilExpiry > 0 && (
                          <div className="text-amber-600 font-medium">
                            Expires in {daysUntilExpiry} days
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Financial Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>Premium: ${policy.annualPremium.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>Deductible: ${policy.deductible.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Coverage Limits</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span>Bodily Injury: {policy.coverageLimits.bodily}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span>Property Damage: {policy.coverageLimits.property}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Broker Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{policy.brokerInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{policy.brokerInfo.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {policy.status === "Active" && daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Renewal Required</span>
                        <span className="text-sm">- Policy expires in {daysUntilExpiry} days</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Actions</CardTitle>
          <CardDescription>
            Common policy management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Renewal Reminder
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Generate Certificate
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              Premium Calculator
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Building className="h-6 w-6 mb-2" />
              Contact Broker
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};