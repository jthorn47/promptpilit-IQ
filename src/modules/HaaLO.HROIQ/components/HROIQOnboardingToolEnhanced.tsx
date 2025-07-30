
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useHROIQOnboarding } from '../hooks/useHROIQOnboarding';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export const HROIQOnboardingToolEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [showNewPacket, setShowNewPacket] = useState(false);
  const { onboardingPackets, isLoading, createOnboardingPacket } = useHROIQOnboarding();
  const { toast } = useToast();

  const [newPacket, setNewPacket] = useState({
    retainer_id: '',
    employee_name: '',
    employee_email: '',
    position: '',
    department: '',
    start_date: '',
    manager_name: '',
    manager_email: '',
    special_instructions: '',
    custom_checklist: [] as string[],
    notification_emails: [] as string[],
  });

  const handleCreatePacket = async () => {
    if (!newPacket.employee_name || !newPacket.employee_email || !newPacket.position) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createOnboardingPacket(newPacket);
    setNewPacket({
      retainer_id: '',
      employee_name: '',
      employee_email: '',
      position: '',
      department: '',
      start_date: '',
      manager_name: '',
      manager_email: '',
      special_instructions: '',
      custom_checklist: [],
      notification_emails: [],
    });
    setShowNewPacket(false);
  };

  const launchOnboardingWizard = (packet: any) => {
    const onboardingUrl = `/onboarding/${packet.onboarding_code_id}`;
    window.open(onboardingUrl, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'default';
      case 'expired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/admin/hro-iq')}
        className="flex items-center mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to HRO IQ
      </Button>

      {/* Onboarding Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Packets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onboardingPackets?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {onboardingPackets?.filter(p => p.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {onboardingPackets?.filter(p => p.status === 'in_progress').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {onboardingPackets?.filter(p => p.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Packet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Onboarding Packets
            </div>
            <Dialog open={showNewPacket} onOpenChange={setShowNewPacket}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Packet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Onboarding Packet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee_name">Employee Name *</Label>
                      <Input
                        id="employee_name"
                        value={newPacket.employee_name}
                        onChange={(e) => setNewPacket({...newPacket, employee_name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="employee_email">Employee Email *</Label>
                      <Input
                        id="employee_email"
                        type="email"
                        value={newPacket.employee_email}
                        onChange={(e) => setNewPacket({...newPacket, employee_email: e.target.value})}
                        placeholder="john.doe@company.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="position">Position *</Label>
                      <Input
                        id="position"
                        value={newPacket.position}
                        onChange={(e) => setNewPacket({...newPacket, position: e.target.value})}
                        placeholder="Software Engineer"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newPacket.department}
                        onChange={(e) => setNewPacket({...newPacket, department: e.target.value})}
                        placeholder="Engineering"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newPacket.start_date}
                        onChange={(e) => setNewPacket({...newPacket, start_date: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="manager_name">Manager Name</Label>
                      <Input
                        id="manager_name"
                        value={newPacket.manager_name}
                        onChange={(e) => setNewPacket({...newPacket, manager_name: e.target.value})}
                        placeholder="Jane Smith"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="manager_email">Manager Email</Label>
                    <Input
                      id="manager_email"
                      type="email"
                      value={newPacket.manager_email}
                      onChange={(e) => setNewPacket({...newPacket, manager_email: e.target.value})}
                      placeholder="jane.smith@company.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Textarea
                      id="special_instructions"
                      value={newPacket.special_instructions}
                      onChange={(e) => setNewPacket({...newPacket, special_instructions: e.target.value})}
                      placeholder="Any special requirements or notes for this onboarding..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewPacket(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePacket}>
                      Create Packet
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading packets...</div>
            ) : onboardingPackets && onboardingPackets.length > 0 ? (
              onboardingPackets.map((packet) => (
                <div key={packet.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(packet.status)}
                        <h3 className="font-medium">{packet.employee_name}</h3>
                        <Badge variant={getStatusColor(packet.status)}>
                          {packet.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p><strong>Position:</strong> {'Not specified'}</p>
                          <p><strong>Email:</strong> {packet.employee_email}</p>
                        </div>
                        <div>
                          <p><strong>Department:</strong> {'Not specified'}</p>
                          <p><strong>Start Date:</strong> {'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => launchOnboardingWizard(packet)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Launch Wizard
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {new Date(packet.created_at).toLocaleDateString()}</span>
                    {packet.sent_at && (
                      <span>Sent: {new Date(packet.sent_at).toLocaleDateString()}</span>
                    )}
                    {packet.completed_at && (
                      <span>Completed: {new Date(packet.completed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No onboarding packets found. Click "Create Packet" to send your first onboarding packet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
