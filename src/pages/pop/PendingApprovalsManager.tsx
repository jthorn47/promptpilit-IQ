import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, X, Clock, AlertTriangle, Eye } from "lucide-react";

const PendingApprovalsManager = () => {
  const pendingItems = [
    { id: 1, type: "Client Application", client: "Tech Solutions Inc", submitted: "2024-03-12", priority: "High", status: "Review", daysWaiting: 3 },
    { id: 2, type: "Rate Change Request", client: "ABC Manufacturing", submitted: "2024-03-10", priority: "Medium", status: "Pending", daysWaiting: 5 },
    { id: 3, type: "Contract Amendment", client: "Global Logistics", submitted: "2024-03-08", priority: "Low", status: "Legal Review", daysWaiting: 7 },
    { id: 4, type: "New Position Request", client: "Urban Warehouse", submitted: "2024-03-14", priority: "High", status: "Manager Review", daysWaiting: 1 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Review": return "secondary";
      case "Pending": return "outline";
      case "Legal Review": return "default";
      case "Manager Review": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <Badge variant="destructive" className="text-sm">
          {pendingItems.length} items pending
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingItems.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground text-red-600">Urgent attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 days</div>
            <p className="text-xs text-muted-foreground">Current average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Items approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <CardTitle className="text-lg text-red-700">Urgent Items</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-red-700">2</div>
            <p className="text-sm text-red-600">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-700">Overdue</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-yellow-700">1</div>
            <p className="text-sm text-yellow-600">Past standard review time</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <CardTitle className="text-lg text-green-700">Ready for Action</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-700">1</div>
            <p className="text-sm text-green-600">Can be processed now</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items Awaiting Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Waiting</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.type}</TableCell>
                  <TableCell>{item.client}</TableCell>
                  <TableCell>{item.submitted}</TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={item.daysWaiting > 5 ? "text-red-600 font-medium" : ""}>
                      {item.daysWaiting} days
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
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

export default PendingApprovalsManager;