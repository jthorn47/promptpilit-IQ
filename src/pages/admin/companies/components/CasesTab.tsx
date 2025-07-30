import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { useCases } from '@/hooks/useCases';
import { CaseFormDialog } from '@/pages/cases/components/CaseFormDialog';
import { CaseDetailDialog } from '@/pages/cases/components/CaseDetailDialog';
import { TimeLogDialog } from '@/pages/cases/components/TimeLogDialog';
import { formatDistance } from 'date-fns';

interface CasesTabProps {
  companyId: string;
  companyName: string;
}

export const CasesTab = ({ companyId, companyName }: CasesTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showTimeLog, setShowTimeLog] = useState<string | null>(null);

  const { cases, loading } = useCases({ company_id: companyId });

  const statusColors = {
    open: 'bg-blue-500/10 text-blue-600 border-blue-200',
    in_progress: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', 
    waiting: 'bg-orange-500/10 text-orange-600 border-orange-200',
    closed: 'bg-green-500/10 text-green-600 border-green-200',
  };

  const priorityColors = {
    high: 'bg-red-500/10 text-red-600 border-red-200',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    low: 'bg-green-500/10 text-green-600 border-green-200',
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalCases = cases.length;
  const openCases = cases.filter(c => c.status === 'open').length;
  const totalHours = cases.reduce((sum, c) => sum + c.actual_hours, 0);
  const avgResolutionTime = cases.filter(c => c.status === 'closed').length > 0 
    ? cases.filter(c => c.status === 'closed').reduce((sum, c) => {
        if (c.closed_at) {
          const days = (new Date(c.closed_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }
        return sum;
      }, 0) / cases.filter(c => c.status === 'closed').length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cases for {companyName}</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage all support cases for this company
          </p>
        </div>
        <Button onClick={() => setShowCaseForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Case
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalCases}</div>
              <div className="text-xs text-muted-foreground">Total Cases</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{openCases}</div>
              <div className="text-xs text-muted-foreground">Open Cases</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
              <div className="text-xs text-muted-foreground">Time Logged</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}d</div>
              <div className="text-xs text-muted-foreground">Avg Resolution</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {cases.length === 0 
                ? "No cases found for this company yet."
                : "No cases match your search criteria."
              }
            </div>
            {cases.length === 0 && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowCaseForm(true)}
              >
                Create First Case
              </Button>
            )}
          </div>
        ) : (
          filteredCases.map((case_) => (
            <Card key={case_.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCase(case_.id)}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{case_.title}</h4>
                    <Badge className={statusColors[case_.status]}>
                      {case_.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={priorityColors[case_.priority]}>
                      {case_.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {case_.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {case_.actual_hours}h logged
                    </div>
                    <div>
                      Created {formatDistance(new Date(case_.created_at), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTimeLog(case_.id);
                    }}
                  >
                    Log Time
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      <CaseFormDialog 
        open={showCaseForm} 
        onOpenChange={setShowCaseForm}
        companyId={companyId}
      />
      
      {selectedCase && (
        <CaseDetailDialog 
          caseId={selectedCase}
          open={!!selectedCase} 
          onOpenChange={(open) => !open && setSelectedCase(null)}
        />
      )}

      {showTimeLog && (
        <TimeLogDialog 
          caseId={showTimeLog}
          open={!!showTimeLog} 
          onOpenChange={(open) => !open && setShowTimeLog(null)}
        />
      )}
    </div>
  );
};