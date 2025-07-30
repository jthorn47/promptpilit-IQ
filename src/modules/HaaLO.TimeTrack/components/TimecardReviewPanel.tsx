import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  Edit3,
  Save,
  X
} from "lucide-react";

interface TimecardReviewPanelProps {
  companyId: string;
  supervisorId: string;
  selectedEmployeeId: string | null;
  onEmployeeSelect: (employeeId: string) => void;
}

export function TimecardReviewPanel({
  companyId,
  supervisorId,
  selectedEmployeeId,
  onEmployeeSelect
}: TimecardReviewPanelProps) {
  const [activeView, setActiveView] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTimecard, setEditingTimecard] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Timecard Review</h3>
          <p className="text-muted-foreground">Review and edit employee timecards</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employees</CardTitle>
            <CardDescription>Select an employee to review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Placeholder employee list */}
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => onEmployeeSelect('emp-1')}
              >
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-muted-foreground">8.5 hours</p>
              </div>
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => onEmployeeSelect('emp-2')}
              >
                <p className="font-medium">Jane Smith</p>
                <p className="text-sm text-muted-foreground">7.5 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timecard Details */}
        <div className="lg:col-span-2">
          {selectedEmployeeId ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Employee Timecard
                </CardTitle>
                <CardDescription>
                  Review punches and make corrections as needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
                  <TabsList>
                    <TabsTrigger value="daily">Daily View</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                  </TabsList>

                  <TabsContent value="daily" className="mt-4">
                    <div className="space-y-4">
                      {/* Raw Punches */}
                      <div>
                        <h4 className="font-medium mb-2">Raw Punches</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">Clock In</Badge>
                              <span>9:00 AM</span>
                              <span className="text-muted-foreground">Main Entrance</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">Clock Out</Badge>
                              <span>5:30 PM</span>
                              <span className="text-muted-foreground">Main Entrance</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Calculated Hours */}
                      <div>
                        <h4 className="font-medium mb-2">Calculated Hours</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-2xl font-bold">8.5</p>
                            <p className="text-sm text-muted-foreground">Total Hours</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-2xl font-bold">8.0</p>
                            <p className="text-sm text-muted-foreground">Regular</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-2xl font-bold">0.5</p>
                            <p className="text-sm text-muted-foreground">Overtime</p>
                          </div>
                        </div>
                      </div>

                      {/* Compliance Status */}
                      <div>
                        <h4 className="font-medium mb-2">Compliance Status</h4>
                        <div className="flex gap-2">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Meal Break Compliant
                          </Badge>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Rest Break Compliant
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="weekly" className="mt-4">
                    <div className="text-center py-8 text-muted-foreground">
                      Weekly view implementation coming soon
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select an Employee</h3>
                <p className="text-muted-foreground">
                  Choose an employee from the list to review their timecard
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}