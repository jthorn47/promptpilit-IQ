import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { sanitizeText, isValidEmail, RateLimiter } from "@/utils/security";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Building, 
  User,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  GraduationCap,
  FileText
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Employee {
  id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  position: string | null;
  department: string | null;
  status: string | null;
  company_id: string;
  created_at: string;
}

interface Company {
  id: string;
  company_name: string;
}

interface TrainingModule {
  id: string;
  title: string;
  status: string;
}

export const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignTrainingDialog, setShowAssignTrainingDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    position: "",
    department: "",
    company_id: ""
  });
  
  const [trainingFormData, setTrainingFormData] = useState({
    training_module_id: "",
    due_date: "",
    priority: "normal",
    send_email: true
  });
  const [sendingAssessment, setSendingAssessment] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchCompanies();
    fetchTrainingModules();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('id, company_name')
        .order('company_name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchTrainingModules = async () => {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('id, title, status')
        .eq('status', 'published')
        .order('title');
      
      if (error) throw error;
      setTrainingModules(data || []);
    } catch (error) {
      console.error('Error fetching training modules:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          company_settings!inner(company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load learners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data being submitted:', formData);

    // Validate email
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate required fields
      if (!formData.company_id) {
        toast({
          title: "Error",
          description: "Please select a company",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicate email
      const { data: existingEmployee, error: emailCheckError } = await supabase
        .from('employees')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      if (emailCheckError) {
        throw emailCheckError;
      }

      if (existingEmployee) {
        toast({
          title: "Email Already Exists",
          description: "A learner with this email address already exists in the system.",
          variant: "destructive",
        });
        return;
      }

      // Sanitize all form data before saving
      const sanitizedData = {
        employee_id: sanitizeText(formData.employee_id),
        first_name: sanitizeText(formData.first_name),
        last_name: sanitizeText(formData.last_name),
        email: sanitizeText(formData.email),
        position: sanitizeText(formData.position),
        department: sanitizeText(formData.department),
        location: 'Not Specified', // Required field, will be updated via org structure
        company_id: formData.company_id,
        status: 'active'
      };

      console.log('Sanitized data:', sanitizedData);

      const { data, error } = await supabase
        .from('employees')
        .insert(sanitizedData)
        .select();

      console.log('Insert result:', { data, error });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Learner added successfully",
      });

      setShowAddDialog(false);
      setFormData({
        employee_id: "",
        first_name: "",
        last_name: "",
        email: "",
        position: "",
        department: "",
        company_id: ""
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "Failed to add learner",
        variant: "destructive",
      });
    }
  };

  const handleAssignTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      // First, insert the training assignment
      const { data: assignmentData, error } = await supabase
        .from('training_assignments')
        .insert({
          employee_id: selectedEmployee.id,
          training_module_id: trainingFormData.training_module_id,
          due_date: trainingFormData.due_date || null,
          priority: trainingFormData.priority,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // If email should be sent, send the training invitation email
      if (trainingFormData.send_email) {
        try {
          // Get the training module details
          const selectedModule = trainingModules.find(m => m.id === trainingFormData.training_module_id);
          
          // Get company details
          const company = companies.find(c => c.id === selectedEmployee.company_id);
          
           // Generate learner portal URL - direct link to training assignment
           const learnerPortalUrl = `${window.location.origin}/training-login?learner=${selectedEmployee.id}&assignment=${assignmentData.id}`;
           
           const emailResponse = await supabase.functions.invoke('send-training-invitation', {
             body: {
               learnerEmail: selectedEmployee.email,
               learnerName: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
               trainingTitle: selectedModule?.title || 'Training Module',
               companyName: company?.company_name || 'Your Company',
               dueDate: trainingFormData.due_date,
               priority: trainingFormData.priority,
               learnerPortalUrl: learnerPortalUrl
             }
           });

          if (emailResponse.error) {
            console.error('Email sending error:', emailResponse.error);
            // Don't fail the entire operation if email fails
            toast({
              title: "Training Assigned",
              description: "Training assigned successfully, but email notification failed to send.",
              variant: "default",
            });
          } else {
            toast({
              title: "Success",
              description: "Training assigned and invitation email sent successfully",
            });
          }
        } catch (emailError) {
          console.error('Error sending training invitation email:', emailError);
          toast({
            title: "Training Assigned",
            description: "Training assigned successfully, but email notification failed to send.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Training assigned successfully",
        });
      }

      setShowAssignTrainingDialog(false);
      setSelectedEmployee(null);
      setTrainingFormData({
        training_module_id: "",
        due_date: "",
        priority: "normal",
        send_email: true
      });
    } catch (error) {
      console.error('Error assigning training:', error);
      toast({
        title: "Error",
        description: "Failed to assign training",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          employee_id: formData.employee_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          position: formData.position,
          department: formData.department
        })
        .eq('id', editingEmployee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Learner updated successfully",
      });

      setEditingEmployee(null);
      setFormData({
        employee_id: "",
        first_name: "",
        last_name: "",
        email: "",
        position: "",
        department: "",
        company_id: ""
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "Failed to update learner",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this learner?")) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Learner deleted successfully",
      });

      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete learner",
        variant: "destructive",
      });
    }
  };

  const handleSendAssessment = async (employee: Employee) => {
    setSendingAssessment(employee.id);
    try {
      // Get company details
      const company = companies.find(c => c.id === employee.company_id);
      
      const { data, error } = await supabase.functions.invoke('send-assessment-invitation', {
        body: {
          to: employee.email,
          firstName: employee.first_name,
          companyName: company?.company_name || 'Your Company',
          senderName: 'EaseLearn Team'
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Assessment Invitation Sent",
          description: `HR Risk Assessment invitation sent to ${employee.email}`,
        });
      } else {
        throw new Error(data?.error || 'Failed to send assessment invitation');
      }
    } catch (error: any) {
      console.error('Error sending assessment invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send assessment invitation",
        variant: "destructive",
      });
    } finally {
      setSendingAssessment(null);
    }
  };

  const startEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id || "",
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      position: employee.position || "",
      department: employee.department || "",
      company_id: employee.company_id
    });
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = `${employee.first_name} ${employee.last_name} ${employee.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Learner Management</h1>
        <div className="text-center py-8">Loading learners...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learner Management</h1>
          <p className="text-muted-foreground">Manage learners and their training information</p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const emailResponse = await supabase.functions.invoke('send-training-invitation', {
                  body: {
                    learnerEmail: 'jeffrey@easeworks.com',
                    learnerName: 'Jeffrey Test',
                    trainingTitle: 'Test Training Module',
                    companyName: 'Easeworks Test Company',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
                    priority: 'normal',
                    learnerPortalUrl: `${window.location.origin}/training-login?learner=test-id&assignment=test-assignment-id`
                  }
                });

                if (emailResponse.error) {
                  toast({
                    title: "Test Email Failed",
                    description: emailResponse.error.message || "Failed to send test email",
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Test Email Sent",
                    description: "Test training invitation sent to jeffrey@easeworks.com",
                  });
                }
              } catch (error) {
                console.error('Test email error:', error);
                toast({
                  title: "Test Email Failed",
                  description: "Failed to send test email",
                  variant: "destructive",
                });
              }
            }}
          >
            Send Test Email
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Add Learner</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Learner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company_id">Company *</Label>
                <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={companySearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.company_id
                        ? companies.find((company) => company.id === formData.company_id)?.company_name
                        : "Select company..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search companies..." />
                      <CommandList>
                        <CommandEmpty>No company found.</CommandEmpty>
                        <CommandGroup>
                          {companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              value={company.company_name}
                              onSelect={() => {
                                setFormData({...formData, company_id: company.id});
                                setCompanySearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.company_id === company.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {company.company_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_id">Learner ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Learner</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.filter(e => e.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => {
                const createdDate = new Date(e.created_at);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search learners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Learner List */}
      <Card>
        <CardHeader>
          <CardTitle>Learner Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No learners found</h3>
              <p className="text-muted-foreground mb-4">
                {employees.length === 0 
                  ? "Get started by adding your first learner"
                  : "Try adjusting your search or filters"
                }
              </p>
              {employees.length === 0 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Learner
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map(employee => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{employee.first_name} {employee.last_name}</h3>
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status || 'active'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {employee.email}
                        </span>
                        {employee.position && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {employee.position}
                          </span>
                        )}
                        {employee.department && (
                          <span className="flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            {employee.department}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Building className="w-3 h-3 mr-1" />
                          {(employee as any).company_settings?.company_name || 'Unknown Company'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(employee)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedEmployee(employee);
                        setShowAssignTrainingDialog(true);
                      }}>
                        <Users className="w-4 h-4 mr-2" />
                        Assign Training
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/employees/${employee.id}`)}>
                        <User className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                       <DropdownMenuItem 
                         onClick={() => handleSendAssessment(employee)}
                         disabled={sendingAssessment === employee.id}
                       >
                         {sendingAssessment === employee.id ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                             Sending Assessment...
                           </>
                         ) : (
                           <>
                             <FileText className="w-4 h-4 mr-2" />
                             Send HR Assessment
                           </>
                         )}
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => {
                         const learnerUrl = `${window.location.origin}/learner/${employee.id}`;
                         navigator.clipboard.writeText(learnerUrl);
                         toast({
                           title: "Link Copied",
                           description: "Learner portal link copied to clipboard",
                         });
                       }}>
                         <Mail className="w-4 h-4 mr-2" />
                         Copy Learner Link
                       </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Learner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_first_name">First Name *</Label>
                <Input
                  id="edit_first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_last_name">Last Name *</Label>
                <Input
                  id="edit_last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_email">Email *</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_employee_id">Learner ID</Label>
                <Input
                  id="edit_employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_position">Position</Label>
                <Input
                  id="edit_position"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_department">Department</Label>
              <Input
                id="edit_department"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Learner</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Training Assignment Dialog */}
      <Dialog open={showAssignTrainingDialog} onOpenChange={setShowAssignTrainingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Training to {selectedEmployee?.first_name} {selectedEmployee?.last_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignTraining} className="space-y-4">
            <div>
              <Label htmlFor="training_module">Training Module *</Label>
              <Select value={trainingFormData.training_module_id} onValueChange={(value) => setTrainingFormData({...trainingFormData, training_module_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select training module" />
                </SelectTrigger>
                <SelectContent>
                  {trainingModules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        {module.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={trainingFormData.due_date}
                  onChange={(e) => setTrainingFormData({...trainingFormData, due_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={trainingFormData.priority} onValueChange={(value) => setTrainingFormData({...trainingFormData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Email notification option */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="send_email" 
                checked={trainingFormData.send_email}
                onCheckedChange={(checked) => setTrainingFormData({...trainingFormData, send_email: !!checked})}
              />
              <Label htmlFor="send_email" className="text-sm">
                Send email invitation to learner
              </Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowAssignTrainingDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Assign Training</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};