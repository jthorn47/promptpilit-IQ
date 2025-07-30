import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, User, Mail, Phone, Building, Edit, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useLeads } from "../hooks/useLeads";
import { LeadCreateDialog } from "@/components/leads/LeadCreateDialog";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "../types";

export const LeadsManager = () => {
  const { leads, loading, createLead, updateLead } = useLeads();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'nurturing':
        return 'bg-purple-100 text-purple-800';
      case 'unqualified':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateLead = async (leadData: any) => {
    try {
      if (editingLead) {
        await updateLead(editingLead.id, leadData);
      } else {
        await createLead(leadData);
      }
      return true;
    } catch (error) {
      console.error('Error saving lead:', error);
      return false;
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowCreateDialog(true);
  };

  const handleContactLead = (lead: Lead) => {
    // Open email client or show contact options
    const subject = `Follow up with ${lead.first_name} ${lead.last_name}`;
    const body = `Hi ${lead.first_name},\n\nI wanted to follow up on our previous conversation...\n\nBest regards`;
    const mailtoLink = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    toast({
      title: "Email client opened",
      description: `Contacting ${lead.first_name} ${lead.last_name}`,
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-2">Manage and nurture your sales prospects</p>
        </div>
        
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4" />
          <span>New Lead</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "new" ? "default" : "outline"}
            onClick={() => setStatusFilter("new")}
            size="sm"
          >
            New
          </Button>
          <Button
            variant={statusFilter === "contacted" ? "default" : "outline"}
            onClick={() => setStatusFilter("contacted")}
            size="sm"
          >
            Contacted
          </Button>
          <Button
            variant={statusFilter === "qualified" ? "default" : "outline"}
            onClick={() => setStatusFilter("qualified")}
            size="sm"
          >
            Qualified
          </Button>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {lead.first_name} {lead.last_name}
                </CardTitle>
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
              </div>
              {lead.title && (
                <CardDescription>{lead.title}</CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{lead.company_name}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{lead.email}</span>
              </div>

              {lead.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{lead.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Source: {lead.source}</span>
              </div>

              {lead.score && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lead Score:</span>
                  <Badge variant="outline">{lead.score}/100</Badge>
                </div>
              )}

              {lead.notes && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {lead.notes}
                </p>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-400">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditLead(lead)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleContactLead(lead)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No leads found matching your criteria.</p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Lead
            </Button>
          </CardContent>
        </Card>
      )}

      <LeadCreateDialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingLead(null);
        }}
        onSubmit={handleCreateLead}
        editData={editingLead}
      />
    </div>
  );
};