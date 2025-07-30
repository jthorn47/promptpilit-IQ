import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Mail,
  ArrowLeft,
  Building2,
  FileText,
  Send
} from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id?: string;
  position?: string;
  department?: string;
  status: string;
  preferred_language?: string;
  created_at: string;
  updated_at: string;
  company_id?: string;
}

interface Company {
  id: string;
  company_name: string;
}

export const EmployeeDetail = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [sendingAssessment, setSendingAssessment] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails(employeeId);
    }
  }, [employeeId]);

  const fetchEmployeeDetails = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch employee
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (employeeError) throw employeeError;

      setEmployee(employeeData);

      // Fetch company if employee has company_id
      if (employeeData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('company_settings')
          .select('id, company_name')
          .eq('id', employeeData.company_id)
          .single();

        if (companyError) {
          console.error('Error fetching company:', companyError);
        } else {
          setCompany(companyData);
        }
      }

    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employee details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendAssessment = async () => {
    if (!employee || !company) return;

    setSendingAssessment(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-assessment-invitation', {
        body: {
          to: employee.email,
          firstName: employee.first_name,
          companyName: company.company_name,
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
      setSendingAssessment(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Employee Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNav items={[
        { label: "Admin", href: "/admin" },
        { label: "Employees", href: "/admin/employees" },
        { label: `${employee.first_name} ${employee.last_name}` }
      ]} />
      
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">{employee.first_name} {employee.last_name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleSendAssessment}
            disabled={sendingAssessment || !company}
            className="flex items-center space-x-2"
          >
            {sendingAssessment ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Send HR Assessment</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Company Link */}
      {company && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Company</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => navigate(`/admin/company/${company.id}`)}
              className="flex items-center space-x-2 text-primary hover:underline cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{company.company_name}</span>
            </button>
          </CardContent>
        </Card>
      )}

      {/* Employee Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Full Name:</strong> {employee.first_name} {employee.last_name}
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{employee.email}</span>
            </div>
            {employee.employee_id && (
              <div>
                <strong>Employee ID:</strong> {employee.employee_id}
              </div>
            )}
            <div>
              <strong>Preferred Language:</strong> {employee.preferred_language || 'English'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Position:</strong> {employee.position || 'Not specified'}
            </div>
            <div>
              <strong>Department:</strong> {employee.department || 'Not specified'}
            </div>
            <div>
              <strong>Status:</strong>
              <Badge 
                variant={employee.status === 'active' ? 'default' : 'outline'}
                className="ml-2"
              >
                {employee.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <strong>Date Joined:</strong> {new Date(employee.created_at).toLocaleDateString()}
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date(employee.updated_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};