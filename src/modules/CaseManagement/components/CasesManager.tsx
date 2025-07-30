
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePulseCases } from '../hooks/usePulseCases';
import { Case } from '../types';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { CaseDetailDialog } from '@/pages/cases/components/CaseDetailDialog';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export const CasesManager: React.FC = () => {
  const { cases, loading, error, statistics } = usePulseCases();
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(undefined);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleViewCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setDetailsOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Cases</CardTitle>
          <CardDescription>There was a problem loading the case data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalHours.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Cases</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="waiting">Waiting</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="sla_breached" className="text-destructive">
            <AlertTriangle className="h-4 w-4 mr-1" />
            SLA Breached
          </TabsTrigger>
          <TabsTrigger value="sla_warning" className="text-warning">
            <Clock className="h-4 w-4 mr-1" />
            Awaiting Response
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <CasesList cases={cases} onViewCase={handleViewCase} />
        </TabsContent>
        
        <TabsContent value="open" className="mt-4">
          <CasesList 
            cases={cases.filter(c => c.status === 'open')} 
            onViewCase={handleViewCase} 
          />
        </TabsContent>
        
        <TabsContent value="in_progress" className="mt-4">
          <CasesList 
            cases={cases.filter(c => c.status === 'in_progress')} 
            onViewCase={handleViewCase} 
          />
        </TabsContent>
        
        <TabsContent value="waiting" className="mt-4">
          <CasesList 
            cases={cases.filter(c => c.status === 'waiting')} 
            onViewCase={handleViewCase} 
          />
        </TabsContent>
        
        <TabsContent value="closed" className="mt-4">
          <CasesList 
            cases={cases.filter(c => c.status === 'closed')} 
            onViewCase={handleViewCase} 
          />
        </TabsContent>
        
        <TabsContent value="sla_breached" className="mt-4">
          <CasesList 
            cases={cases.filter(c => (c as any).sla_status === 'violated')} 
            onViewCase={handleViewCase} 
          />
        </TabsContent>
        
        <TabsContent value="sla_warning" className="mt-4">
          <CasesList 
            cases={cases.filter(c => (c as any).sla_status === 'warning')} 
            onViewCase={handleViewCase} 
          />
        </TabsContent>
      </Tabs>
      
      <CaseDetailDialog 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        caseId={selectedCaseId} 
      />
    </div>
  );
};

const CasesList: React.FC<{ cases: Case[], onViewCase: (caseId: string) => void }> = ({ cases, onViewCase }) => {
  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <p className="text-muted-foreground mb-4">No cases found</p>
          <Button>Create New Case</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {cases.map(case_ => (
        <Card key={case_.id} className="cursor-pointer hover:bg-accent/5" onClick={() => onViewCase(case_.id)}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{case_.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {case_.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={
                  case_.status === 'open' ? 'default' :
                  case_.status === 'in_progress' ? 'secondary' :
                  case_.status === 'waiting' ? 'outline' :
                  'destructive'
                }>
                  {case_.status}
                </Badge>
                
                {/* SLA Status Badge */}
                {(case_ as any).sla_status === 'violated' && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    SLA Breach
                  </Badge>
                )}
                {(case_ as any).sla_status === 'warning' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    24h+ Open
                  </Badge>
                )}
                
                <Badge variant={
                  case_.priority === 'high' ? 'destructive' :
                  case_.priority === 'medium' ? 'secondary' :
                  'outline'
                }>
                  {case_.priority}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                {case_.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
                {case_.tags.length > 3 && (
                  <Badge variant="outline">+{case_.tags.length - 3}</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(case_.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
