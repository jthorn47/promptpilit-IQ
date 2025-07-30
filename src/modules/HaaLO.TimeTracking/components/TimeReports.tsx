import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Download, Calendar, FileText } from "lucide-react";

export function TimeReports() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Reports</h1>
          <p className="text-muted-foreground">Generate and analyze time tracking reports</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Employee Summary
            </CardTitle>
            <CardDescription>
              Hours worked by employee for selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Summary
            </CardTitle>
            <CardDescription>
              Time allocation and costs by project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Overtime Report
            </CardTitle>
            <CardDescription>
              Overtime hours and compliance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Generate Report</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Customize report parameters and filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
              <option>Employee Summary</option>
              <option>Project Summary</option>
              <option>Overtime Report</option>
              <option>Attendance Report</option>
              <option>Billable Hours Report</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Employee Summary - December 2024</p>
                <p className="text-sm text-muted-foreground">Generated on Dec 18, 2024</p>
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Project Summary - Q4 2024</p>
                <p className="text-sm text-muted-foreground">Generated on Dec 15, 2024</p>
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Overtime Report - November 2024</p>
                <p className="text-sm text-muted-foreground">Generated on Dec 1, 2024</p>
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}