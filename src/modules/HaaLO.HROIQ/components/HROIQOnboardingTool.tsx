import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Send, Mail, Phone, Globe, Calendar, CheckCircle, Clock } from 'lucide-react';

export const HROIQOnboardingTool: React.FC = () => {
  const [isNewPacketOpen, setIsNewPacketOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [bilingualMode, setBilingualMode] = useState(false);

  // Mock data - will be replaced with real API calls
  const onboardingPackets = [
    {
      id: '1',
      employeeName: 'Sarah Johnson',
      employeeEmail: 'sarah.johnson@company.com',
      employeePhone: '+1 (555) 123-4567',
      language: 'english',
      status: 'completed',
      sentAt: '2024-01-20',
      completedAt: '2024-01-22',
      packetType: 'standard'
    },
    {
      id: '2',
      employeeName: 'Carlos Rodriguez',
      employeeEmail: 'carlos.rodriguez@company.com',
      employeePhone: '+1 (555) 234-5678',
      language: 'spanish',
      status: 'in-progress',
      sentAt: '2024-01-23',
      completedAt: null,
      packetType: 'manager'
    },
    {
      id: '3',
      employeeName: 'Jennifer Wong',
      employeeEmail: 'jennifer.wong@company.com',
      employeePhone: '+1 (555) 345-6789',
      language: 'english',
      status: 'pending',
      sentAt: null,
      completedAt: null,
      packetType: 'executive'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <Mail className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Onboarding Tool</h2>
          <p className="text-muted-foreground">Send bilingual onboarding packets to new hires</p>
        </div>
        
        <Dialog open={isNewPacketOpen} onOpenChange={setIsNewPacketOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Packet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Onboarding Packet</DialogTitle>
              <DialogDescription>
                Generate a personalized onboarding packet for a new hire.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="employee-name">Employee Name</Label>
                <Input id="employee-name" placeholder="Full name" />
              </div>

              <div>
                <Label htmlFor="employee-email">Email Address</Label>
                <Input id="employee-email" type="email" placeholder="email@company.com" />
              </div>

              <div>
                <Label htmlFor="employee-phone">Phone Number</Label>
                <Input id="employee-phone" placeholder="+1 (555) 123-4567" />
              </div>

              <div>
                <Label htmlFor="packet-type">Packet Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select packet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Employee</SelectItem>
                    <SelectItem value="manager">Manager/Supervisor</SelectItem>
                    <SelectItem value="executive">Executive/Director</SelectItem>
                    <SelectItem value="contractor">Contractor/Consultant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Language Options</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="bilingual-mode"
                    checked={bilingualMode}
                    onCheckedChange={setBilingualMode}
                  />
                  <Label htmlFor="bilingual-mode">Send bilingual packet (English + Spanish)</Label>
                </div>
                
                {!bilingualMode && (
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Español</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsNewPacketOpen(false)} className="flex-1">
                  <Send className="h-4 w-4 mr-1" />
                  Send Packet
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewPacketOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Language Toggle */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <h3 className="font-medium">Bilingual Support</h3>
              <p className="text-sm text-muted-foreground">
                Automatically send onboarding materials in both English and Spanish
              </p>
            </div>
            <Badge variant="secondary">🇺🇸 🇪🇸</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Packets Overview */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Packets</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {onboardingPackets.filter(p => p.status !== 'completed').map((packet) => (
              <Card key={packet.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(packet.status)}
                        {packet.employeeName}
                      </CardTitle>
                      <CardDescription>
                        {packet.packetType.charAt(0).toUpperCase() + packet.packetType.slice(1)} onboarding packet
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {packet.language === 'spanish' ? '🇪🇸 Español' : '🇺🇸 English'}
                      </Badge>
                      <Badge variant={getStatusColor(packet.status)}>
                        {packet.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{packet.employeeEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{packet.employeePhone}</span>
                      </div>
                      {packet.sentAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Sent {packet.sentAt}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {packet.status === 'pending' && (
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-1" />
                          Send Now
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {onboardingPackets.filter(p => p.status === 'completed').map((packet) => (
              <Card key={packet.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {packet.employeeName}
                      </CardTitle>
                      <CardDescription>
                        Completed onboarding on {packet.completedAt}
                      </CardDescription>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{packet.employeeEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Sent {packet.sentAt} • Completed {packet.completedAt}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Templates</CardTitle>
              <CardDescription>
                Customize onboarding packet templates for different roles and languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Standard Employee</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Basic onboarding for general staff positions
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">🇺🇸 EN</Badge>
                      <Badge variant="outline" className="text-xs">🇪🇸 ES</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Manager/Supervisor</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Extended onboarding for leadership roles
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">🇺🇸 EN</Badge>
                      <Badge variant="outline" className="text-xs">🇪🇸 ES</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};