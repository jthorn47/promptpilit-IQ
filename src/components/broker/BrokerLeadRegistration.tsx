import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const BrokerLeadRegistration = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock leads data
  const leads = [
    {
      id: 1,
      companyName: "TechCorp Solutions",
      contactName: "Sarah Johnson",
      contactEmail: "sarah@techcorp.com",
      stage: "qualified",
      priority: "high",
      estimatedValue: 85000,
      createdAt: "2024-01-15",
      services: ["Payroll", "HR Management"]
    },
    {
      id: 2,
      companyName: "Manufacturing Plus",
      contactName: "Mike Chen",
      contactEmail: "mike@mfgplus.com",
      stage: "proposal",
      priority: "medium",
      estimatedValue: 120000,
      createdAt: "2024-01-12",
      services: ["Payroll", "Benefits", "ATS"]
    },
    {
      id: 3,
      companyName: "Retail Dynamics",
      contactName: "Emma Wilson",
      contactEmail: "emma@retaildyn.com",
      stage: "contacted",
      priority: "low",
      estimatedValue: 45000,
      createdAt: "2024-01-10",
      services: ["LMS", "Compliance"]
    }
  ];

  const stageColors = {
    registered: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    qualified: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    proposal: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    won: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lead Management</h2>
          <p className="text-muted-foreground">Register and track your referrals</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Register New Lead
        </Button>
      </div>

      {/* Lead Registration Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Register New Lead</CardTitle>
            <CardDescription>
              Enter the details for your new lead referral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input id="contactName" placeholder="Enter contact name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input id="contactEmail" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input id="contactPhone" type="tel" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Annual Value</Label>
                <Input id="estimatedValue" type="number" placeholder="Enter estimated value" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Enter any additional notes or context" />
            </div>
            <div className="flex gap-2">
              <Button>Submit Lead</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Leads</CardTitle>
              <CardDescription>Track the progress of your referrals</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Est. Value</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.companyName}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lead.contactName}</div>
                      <div className="text-sm text-muted-foreground">{lead.contactEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={stageColors[lead.stage as keyof typeof stageColors]}>
                      {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[lead.priority as keyof typeof priorityColors]}>
                      {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lead.services.map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>${lead.estimatedValue.toLocaleString()}</TableCell>
                  <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};