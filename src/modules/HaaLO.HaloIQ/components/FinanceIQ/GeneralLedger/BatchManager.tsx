import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Eye, 
  Send, 
  Archive,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users
} from 'lucide-react';
import { useGLBatches, useGLJournals } from '@/modules/HaaLO.Shared/hooks/useGLModule';
import { supabase } from '@/integrations/supabase/client';

interface BatchManagerProps {
  companyId: string;
}

interface BatchFormData {
  batch_name: string;
  description: string;
}

export const BatchManager: React.FC<BatchManagerProps> = ({ companyId }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BatchFormData>({
    batch_name: '',
    description: '',
  });

  const { batches, createBatch, updateBatch, postBatch, isLoading } = useGLBatches(companyId);
  const { journals } = useGLJournals(companyId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCreateBatch = async () => {
    if (!formData.batch_name.trim()) return;

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    try {
      await createBatch({
        company_id: companyId,
        batch_name: formData.batch_name,
        description: formData.description,
        status: 'Draft',
        created_by: userId,
      });

      setFormData({ batch_name: '', description: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const handleUpdateBatchStatus = async (batchId: string, status: string) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const updateData: any = { id: batchId, status };
      
      if (status === 'Ready') {
        updateData.reviewed_by = userId;
        updateData.reviewed_at = new Date().toISOString();
      }

      await updateBatch(updateData);
    } catch (error) {
      console.error('Error updating batch status:', error);
    }
  };

  const handlePostBatch = async (batchId: string) => {
    try {
      await postBatch(batchId);
    } catch (error) {
      console.error('Error posting batch:', error);
    }
  };

  const getBatchJournals = (batchId: string) => {
    return journals.filter(j => j.batch_id === batchId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Clock className="h-4 w-4" />;
      case 'Ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'Posted':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'secondary';
      case 'Ready':
        return 'default';
      case 'Posted':
        return 'default';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Archive className="h-8 w-8" />
            Batch Manager
          </h1>
          <p className="text-muted-foreground">
            Create and manage journal entry batches for review and posting
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="batch_name">Batch Name</Label>
                <Input
                  id="batch_name"
                  value={formData.batch_name}
                  onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                  placeholder="Enter batch name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBatch} disabled={!formData.batch_name.trim()}>
                  Create Batch
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Batch Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Batches</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {batches.filter(b => b.status === 'Draft').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Posting</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {batches.filter(b => b.status === 'Ready').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted Batches</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {batches.filter(b => b.status === 'Posted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Journals</TableHead>
                <TableHead className="text-right">Total Debits</TableHead>
                <TableHead className="text-right">Total Credits</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => {
                const batchJournals = getBatchJournals(batch.id);
                const unbalancedJournals = batchJournals.filter(j => !j.is_balanced);
                
                return (
                  <TableRow key={batch.id}>
                    <TableCell className="font-mono">{batch.batch_number}</TableCell>
                    <TableCell className="font-medium">{batch.batch_name}</TableCell>
                    <TableCell>{batch.description || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(batch.status)}
                        <Badge variant={getStatusColor(batch.status) as any}>
                          {batch.status}
                        </Badge>
                        {unbalancedJournals.length > 0 && (
                          <Badge variant="destructive">
                            {unbalancedJournals.length} Unbalanced
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{batch.total_journals}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(batch.total_debits)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(batch.total_credits)}
                    </TableCell>
                    <TableCell>{formatDate(batch.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBatchId(batch.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {batch.status === 'Draft' && batch.total_journals > 0 && unbalancedJournals.length === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateBatchStatus(batch.id, 'Ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                        
                        {batch.status === 'Ready' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePostBatch(batch.id)}
                          >
                            <Send className="h-4 w-4" />
                            Post
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Batch Details Dialog */}
      {selectedBatchId && (
        <Dialog open={!!selectedBatchId} onOpenChange={() => setSelectedBatchId(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Batch Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(() => {
                const batch = batches.find(b => b.id === selectedBatchId);
                const batchJournals = getBatchJournals(selectedBatchId);
                
                if (!batch) return null;
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Batch Number</Label>
                        <div className="font-mono">{batch.batch_number}</div>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(batch.status)}
                          <Badge variant={getStatusColor(batch.status) as any}>
                            {batch.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <div>{batch.description || 'No description'}</div>
                    </div>
                    
                    <div>
                      <Label>Journals in Batch ({batchJournals.length})</Label>
                      <Table className="mt-2">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Journal #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Memo</TableHead>
                            <TableHead className="text-right">Debits</TableHead>
                            <TableHead className="text-right">Credits</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batchJournals.map((journal) => (
                            <TableRow key={journal.id}>
                              <TableCell className="font-mono">{journal.journal_number}</TableCell>
                              <TableCell>{formatDate(journal.date)}</TableCell>
                              <TableCell>{journal.memo || '—'}</TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(journal.total_debits)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(journal.total_credits)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Badge variant={journal.status === 'Posted' ? "default" : "secondary"}>
                                    {journal.status}
                                  </Badge>
                                  {!journal.is_balanced && (
                                    <Badge variant="destructive">
                                      Unbalanced
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};