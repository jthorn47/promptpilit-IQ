import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Proposal {
  id: string;
  title: string;
  company_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  version: number;
  include_investment_analysis: boolean;
  include_risk_assessment: boolean;
  include_recommendations: boolean;
  company_settings?: {
    company_name: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: Clock },
  sent: { label: 'Sent', color: 'bg-blue-500', icon: FileText },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
};

export default function ProposalsDashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          company_settings(company_name)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const proposalsWithCompanyNames = data?.map(proposal => ({
        ...proposal,
        company_name: proposal.company_settings?.company_name || 'Unknown Company'
      })) || [];

      setProposals(proposalsWithCompanyNames);
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch proposals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProposal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;

    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProposals(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Proposal deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete proposal',
        variant: 'destructive',
      });
    }
  };

  const getSectionsList = (proposal: Proposal) => {
    const sections = [];
    if (proposal.include_investment_analysis) sections.push('Investment Analysis');
    if (proposal.include_risk_assessment) sections.push('Risk Assessment');
    if (proposal.include_recommendations) sections.push('Recommendations');
    return sections.join(', ');
  };

  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    approved: proposals.filter(p => p.status === 'approved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">Generate and manage HR service proposals</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/proposals/sample')}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Sample
          </Button>
          <Button onClick={() => navigate('/admin/proposals/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Proposal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Proposals Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No proposals match your filters' 
                        : 'No proposals found'}
                    </div>
                    {(!searchTerm && statusFilter === 'all') && (
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => navigate('/admin/proposals/create')}
                      >
                        Create your first proposal
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map((proposal) => {
                  const statusInfo = statusConfig[proposal.status] || statusConfig.draft;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.title}</TableCell>
                      <TableCell>{proposal.company_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getSectionsList(proposal)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${statusInfo.color} text-white gap-1`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>v{proposal.version}</TableCell>
                      <TableCell>{format(new Date(proposal.updated_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/proposals/${proposal.id}/preview`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/proposals/${proposal.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProposal(proposal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}