import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Tags, List, Flag, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const PulseSettingsPage = () => {
  const caseTypes = ['HR', 'Payroll', 'Compliance', 'Safety', 'Technical', 'Billing'];
  const caseStatuses = ['Open', 'In Progress', 'Waiting', 'Closed'];
  const casePriorities = ['Low', 'Medium', 'High'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pulse Settings</h1>
        <p className="text-muted-foreground">Admin settings for case types, statuses, priorities, and workflows</p>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Case Types
          </TabsTrigger>
          <TabsTrigger value="statuses" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Statuses
          </TabsTrigger>
          <TabsTrigger value="priorities" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Priorities
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-type">Add New Case Type</Label>
                <div className="flex gap-2 mt-2">
                  <Input id="new-type" placeholder="Enter case type name" />
                  <Button>Add Type</Button>
                </div>
              </div>
              
              <div>
                <Label>Existing Case Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {caseTypes.map((type) => (
                    <Badge key={type} variant="outline" className="px-3 py-1">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Statuses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-status">Add New Status</Label>
                <div className="flex gap-2 mt-2">
                  <Input id="new-status" placeholder="Enter status name" />
                  <Button>Add Status</Button>
                </div>
              </div>
              
              <div>
                <Label>Current Statuses</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {caseStatuses.map((status) => (
                    <Badge key={status} variant="outline" className="px-3 py-1">
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Priorities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-priority">Add New Priority</Label>
                <div className="flex gap-2 mt-2">
                  <Input id="new-priority" placeholder="Enter priority name" />
                  <Button>Add Priority</Button>
                </div>
              </div>
              
              <div>
                <Label>Current Priorities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {casePriorities.map((priority) => (
                    <Badge key={priority} variant="outline" className="px-3 py-1">
                      {priority}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Workflow automation and rules configuration coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};