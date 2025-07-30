import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, FileText, DollarSign, BarChart3 } from "lucide-react";
import { VaultPayCreateInvoiceForm } from "../components/VaultPayCreateInvoiceForm";
import { VaultPayRecordPaymentForm } from "../components/VaultPayRecordPaymentForm";
import { VaultPayARReport } from "../components/VaultPayARReport";
import { VaultPayInvoiceList } from "../components/VaultPayInvoiceList";

export const VaultPayAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            VaultPay Admin
          </h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, and accounts receivable
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            A/R Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Create invoices and record payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <VaultPayCreateInvoiceForm />
                <VaultPayRecordPaymentForm />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Invoice VP-0003 created</p>
                      <p className="text-sm text-muted-foreground">Acme Corp - $3,200.00</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Payment recorded</p>
                      <p className="text-sm text-muted-foreground">TechStart LLC - $2,500.00</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Invoice VP-0002 sent</p>
                      <p className="text-sm text-muted-foreground">Global Industries - $1,800.00</p>
                    </div>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* A/R Summary Overview */}
          <VaultPayARReport compact={true} />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <VaultPayInvoiceList />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
              <CardDescription>
                Record a new payment against one or more invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VaultPayRecordPaymentForm expanded={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <VaultPayARReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};