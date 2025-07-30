import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, FileText, Download, Eye, Plus, Filter } from "lucide-react";

export default function DocumentsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const documents = [
    {
      id: "1",
      name: "W-9 Tax Form",
      category: "tax",
      uploadDate: "2024-12-01",
      status: "approved",
      size: "245 KB",
      type: "PDF",
      description: "Tax information form"
    },
    {
      id: "2",
      name: "ACH Authorization",
      category: "banking",
      uploadDate: "2024-12-01",
      status: "approved",
      size: "128 KB",
      type: "PDF",
      description: "Electronic payment authorization"
    },
    {
      id: "3",
      name: "Business License",
      category: "legal",
      uploadDate: "2024-12-01",
      status: "pending",
      size: "892 KB",
      type: "PDF",
      description: "California business license"
    },
    {
      id: "4",
      name: "POP Agreement",
      category: "contract",
      uploadDate: "2024-11-28",
      status: "signed",
      size: "1.2 MB",
      type: "PDF",
      description: "Partner Office Program agreement"
    },
    {
      id: "5",
      name: "Territory Assignment",
      category: "contract",
      uploadDate: "2024-11-28",
      status: "approved",
      size: "315 KB",
      type: "PDF",
      description: "Exclusive territory documentation"
    },
    {
      id: "6",
      name: "Non-Compete Agreement",
      category: "legal",
      uploadDate: "2024-11-28",
      status: "signed",
      size: "456 KB",
      type: "PDF",
      description: "Non-compete and confidentiality agreement"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "signed":
        return <Badge className="bg-blue-100 text-blue-800">Signed</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "tax":
        return "Tax Documents";
      case "banking":
        return "Banking";
      case "legal":
        return "Legal";
      case "contract":
        return "Contracts";
      default:
        return "Other";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            Manage your partnership documents and compliance files
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              All partnership files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Ready for use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Executed contracts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="tax">Tax Documents</SelectItem>
            <SelectItem value="banking">Banking</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Your partnership and compliance documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{document.name}</h3>
                    <p className="text-sm text-muted-foreground">{document.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {getCategoryName(document.category)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {document.size} • {document.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Uploaded {document.uploadDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(document.status)}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>Ensure all required documents are submitted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">✓ W-9 Tax Form</p>
                <p className="text-sm text-green-700">Required for commission payments</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Complete</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">✓ ACH Authorization</p>
                <p className="text-sm text-green-700">For electronic payment processing</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Complete</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-900">⏳ Business License</p>
                <p className="text-sm text-yellow-700">Required if operating as business entity</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">✓ Partnership Agreement</p>
                <p className="text-sm text-green-700">Signed POP platform agreement</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Signed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}