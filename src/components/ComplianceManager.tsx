import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload
} from "lucide-react";

type CompliancePolicy = Database['public']['Tables']['compliance_policies']['Row'];
type ComplianceAssessment = Database['public']['Tables']['compliance_assessments']['Row'];

export const ComplianceManager = () => {
  const [policies, setPolicies] = useState<CompliancePolicy[]>([]);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<CompliancePolicy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newPolicy, setNewPolicy] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    compliance_frameworks: [] as string[],
    requirements: [] as string[],
    implementation_notes: '',
    review_frequency_months: 12,
    assigned_to: ''
  });

  useEffect(() => {
    fetchPolicies();
    fetchAssessments();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast({
        title: "Error",
        description: "Failed to load compliance policies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const createPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_policies')
        .insert([{
          ...newPolicy,
          next_review_date: new Date(Date.now() + newPolicy.review_frequency_months * 30 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setPolicies([data, ...policies]);
      setNewPolicy({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        compliance_frameworks: [] as string[],
        requirements: [] as string[],
        implementation_notes: '',
        review_frequency_months: 12,
        assigned_to: ''
      });

      toast({
        title: "Success",
        description: "Compliance policy created successfully"
      });
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        title: "Error",
        description: "Failed to create compliance policy",
        variant: "destructive"
      });
    }
  };

  const updatePolicy = async (policy: CompliancePolicy) => {
    try {
      const { error } = await supabase
        .from('compliance_policies')
        .update(policy)
        .eq('id', policy.id);

      if (error) throw error;

      setPolicies(policies.map(p => p.id === policy.id ? policy : p));
      setIsEditing(false);
      setSelectedPolicy(null);

      toast({
        title: "Success",
        description: "Policy updated successfully"
      });
    } catch (error) {
      console.error('Error updating policy:', error);
      toast({
        title: "Error",
        description: "Failed to update policy",
        variant: "destructive"
      });
    }
  };

  const deletePolicy = async (policyId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_policies')
        .delete()
        .eq('id', policyId);

      if (error) throw error;

      setPolicies(policies.filter(p => p.id !== policyId));
      setSelectedPolicy(null);

      toast({
        title: "Success",
        description: "Policy deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        title: "Error",
        description: "Failed to delete policy",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compliance Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Policies
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="policies" className="w-full">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          {/* Policy Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create New Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Policy Title</Label>
                  <Input
                    id="title"
                    value={newPolicy.title}
                    onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                    placeholder="Enter policy title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newPolicy.category} onValueChange={(value) => setNewPolicy({ ...newPolicy, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_protection">Data Protection</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="privacy">Privacy</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="Enter policy description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newPolicy.priority} onValueChange={(value) => setNewPolicy({ ...newPolicy, priority: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="review_frequency">Review Frequency (months)</Label>
                  <Input
                    id="review_frequency"
                    type="number"
                    value={newPolicy.review_frequency_months}
                    onChange={(e) => setNewPolicy({ ...newPolicy, review_frequency_months: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="assigned_to">Assigned To</Label>
                  <Input
                    id="assigned_to"
                    value={newPolicy.assigned_to}
                    onChange={(e) => setNewPolicy({ ...newPolicy, assigned_to: e.target.value })}
                    placeholder="Assignee email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="implementation_notes">Implementation Notes</Label>
                <Textarea
                  id="implementation_notes"
                  value={newPolicy.implementation_notes}
                  onChange={(e) => setNewPolicy({ ...newPolicy, implementation_notes: e.target.value })}
                  placeholder="Enter implementation details"
                  rows={2}
                />
              </div>

              <Button onClick={createPolicy} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Policy
              </Button>
            </CardContent>
          </Card>

          {/* Policies List */}
          <div className="grid gap-4">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>{policy.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(policy.priority)}>
                        {policy.priority.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusColor(policy.status)}>
                        {policy.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{policy.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="text-sm">{policy.category.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Review Frequency</Label>
                      <p className="text-sm">{policy.review_frequency_months} months</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Next Review</Label>
                      <p className="text-sm">{new Date(policy.next_review_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {policy.compliance_frameworks && policy.compliance_frameworks.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Compliance Frameworks</Label>
                      <div className="flex flex-wrap gap-2">
                        {policy.compliance_frameworks.map((framework, index) => (
                          <Badge key={index} variant="outline">{framework}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePolicy(policy.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Compliance Assessments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Assessment functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Compliance Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reporting functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Compliance Frameworks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'GDPR', description: 'General Data Protection Regulation' },
                  { name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
                  { name: 'SOX', description: 'Sarbanes-Oxley Act' },
                  { name: 'PCI DSS', description: 'Payment Card Industry Data Security Standard' },
                  { name: 'ISO 27001', description: 'Information Security Management' },
                  { name: 'CCPA', description: 'California Consumer Privacy Act' }
                ].map((framework, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{framework.name}</h4>
                      <p className="text-sm text-muted-foreground">{framework.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};