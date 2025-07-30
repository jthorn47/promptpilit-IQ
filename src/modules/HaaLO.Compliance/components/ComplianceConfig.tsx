import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export const ComplianceConfig = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Management</h1>
        <p className="text-muted-foreground">Automated compliance monitoring and reporting tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Audits</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7d</div>
            <p className="text-xs text-muted-foreground">
              SOX compliance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Areas</CardTitle>
            <CardDescription>Monitor key compliance requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Data Privacy (GDPR)</span>
              </div>
              <span className="text-sm font-medium text-green-600">Compliant</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Financial Reporting (SOX)</span>
              </div>
              <span className="text-sm font-medium text-green-600">Compliant</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Security Standards (ISO 27001)</span>
              </div>
              <span className="text-sm font-medium text-yellow-600">Review Required</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Employment Law</span>
              </div>
              <span className="text-sm font-medium text-green-600">Compliant</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest compliance updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Policy updated</p>
                  <p className="text-sm text-muted-foreground">Data retention policy v2.1</p>
                </div>
                <span className="text-sm text-muted-foreground">1h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit completed</p>
                  <p className="text-sm text-muted-foreground">Q4 financial review</p>
                </div>
                <span className="text-sm text-muted-foreground">3h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Training assigned</p>
                  <p className="text-sm text-muted-foreground">GDPR awareness for 25 employees</p>
                </div>
                <span className="text-sm text-muted-foreground">1d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};