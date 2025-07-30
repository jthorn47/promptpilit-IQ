import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Bell, MapPin, DollarSign, Save } from "lucide-react";

export default function SettingsManager() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your POP platform preferences and account settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="territory">Territory</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal and business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Jeffrey" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Thorn" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="jeffrey.thorn@easeworks.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input id="title" defaultValue="Senior POP" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about your background and experience..."
                  defaultValue="Experienced staffing professional with 15+ years in the industry. Specializing in warehouse, manufacturing, and logistics placements across Southern California."
                />
              </div>
              
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partnership Status</CardTitle>
              <CardDescription>Your current partnership level and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Partnership Tier</span>
                <Badge className="bg-blue-100 text-blue-800">Senior POP</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Status</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Start Date</span>
                <span className="text-muted-foreground">January 15, 2023</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Platform Fee Tier</span>
                <span className="text-muted-foreground">25% (Based on YTD earnings)</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for job orders, client updates, and commission notifications
                  </p>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get text messages for urgent updates and time-sensitive opportunities
                  </p>
                </div>
                <Switch 
                  checked={smsNotifications} 
                  onCheckedChange={setSmsNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive newsletters, training opportunities, and platform updates
                  </p>
                </div>
                <Switch 
                  checked={marketingEmails} 
                  onCheckedChange={setMarketingEmails}
                />
              </div>
              
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Job Orders</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Client Approvals</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Candidate Submissions</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Commission Payments</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Maintenance</span>
                    <Switch />
                  </div>
                </div>
              </div>
              
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="territory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Territory Information
              </CardTitle>
              <CardDescription>
                Your assigned exclusive territory details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Territory</Label>
                <Input value="Southern California" disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Included Counties</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Los Angeles County</Badge>
                  <Badge variant="secondary">Orange County</Badge>
                  <Badge variant="secondary">Riverside County</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Territory Assignment Date</Label>
                <Input value="January 15, 2023" disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Territory Status</Label>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <span className="text-sm text-muted-foreground">Exclusive rights confirmed</span>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Territory Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You have exclusive rights to develop business within your assigned counties</li>
                  <li>• Territory assignments are non-transferable</li>
                  <li>• All client relationships remain with Easeworks upon partnership termination</li>
                  <li>• Non-compete agreement applies during and after partnership</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Billing & Payment Information
              </CardTitle>
              <CardDescription>
                Manage your payment preferences and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select defaultValue="ach">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ach">ACH Direct Deposit</SelectItem>
                    <SelectItem value="check">Physical Check</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input defaultValue="Wells Fargo Bank" />
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select defaultValue="checking">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Routing Number</Label>
                  <Input defaultValue="121000248" />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input defaultValue="****4567" type="password" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Schedule</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Commission Structure</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• Platform Fee: 30% (reduces to 25% after $20K, 20% after $30K annually)</p>
                  <p>• Payments: Made monthly on collected invoices only</p>
                  <p>• Senior POP Overrides: 5% Level 1, 2% Level 2, 1% Level 3</p>
                  <p>• All commissions subject to client payment collection</p>
                </div>
              </div>
              
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Update Payment Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}