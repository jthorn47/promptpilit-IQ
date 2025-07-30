import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Send, Calculator } from 'lucide-react';
import { useGLJournals, useGLEntries, GLJournal, GLEntry } from '@/modules/HaaLO.Shared/hooks/useGLModule';
import { useChartOfAccounts } from '@/modules/HaaLO.Shared/hooks/useChartOfAccounts';
import { supabase } from '@/integrations/supabase/client';

interface JournalEntryFormProps {
  companyId: string;
  journalId?: string;
  onSave?: (journal: GLJournal) => void;
  onCancel?: () => void;
}

interface EntryLine {
  id?: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
  entity_type?: string;
  entity_id?: string;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  companyId,
  journalId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memo: '',
    source: 'Manual',
    source_id: '',
  });

  const [entries, setEntries] = useState<EntryLine[]>([
    { account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
    { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }
  ]);

  const { createJournal, updateJournal, isCreating, isUpdating } = useGLJournals(companyId);
  const { createEntry, updateEntry, deleteEntry, entries: existingEntries } = useGLEntries(journalId || '');
  const { accounts } = useChartOfAccounts(companyId);

  // Load existing journal data
  useEffect(() => {
    if (journalId && existingEntries.length > 0) {
      setEntries(existingEntries.map(entry => ({
        id: entry.id,
        account_id: entry.account_id,
        debit_amount: entry.debit_amount,
        credit_amount: entry.credit_amount,
        description: entry.description || '',
        entity_type: entry.entity_type,
        entity_id: entry.entity_id
      })));
    }
  }, [journalId, existingEntries]);

  const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0);
  const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
  const difference = totalDebits - totalCredits;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleAddLine = () => {
    setEntries([...entries, { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    if (entries.length > 2) {
      const entry = entries[index];
      if (entry.id) {
        deleteEntry(entry.id);
      }
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index: number, field: keyof EntryLine, value: any) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    
    // Ensure only debit or credit is filled, not both
    if (field === 'debit_amount' && value > 0) {
      updatedEntries[index].credit_amount = 0;
    } else if (field === 'credit_amount' && value > 0) {
      updatedEntries[index].debit_amount = 0;
    }
    
    setEntries(updatedEntries);
  };

  const handleSaveDraft = async () => {
    try {
      if (journalId) {
        // Update existing journal
        await updateJournal({
          id: journalId,
          ...formData,
        });
        
        // Update entries
        for (const entry of entries) {
          if (entry.id) {
            await updateEntry({
              id: entry.id,
              account_id: entry.account_id,
              debit_amount: entry.debit_amount,
              credit_amount: entry.credit_amount,
              description: entry.description,
              entity_type: entry.entity_type,
              entity_id: entry.entity_id,
            });
          } else {
            await createEntry({
              journal_id: journalId,
              line_number: entries.indexOf(entry) + 1,
              account_id: entry.account_id,
              debit_amount: entry.debit_amount,
              credit_amount: entry.credit_amount,
              description: entry.description,
              entity_type: entry.entity_type,
              entity_id: entry.entity_id,
            });
          }
        }
      } else {
        // Create new journal
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) return;

        createJournal({
          company_id: companyId,
          date: formData.date,
          memo: formData.memo,
          source: formData.source,
          source_id: formData.source_id || undefined,
          created_by: userId,
          status: 'Draft',
        });
      }
      
      onSave?.(undefined);
    } catch (error) {
      console.error('Error saving journal:', error);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? `${account.account_number} - ${account.full_name}` : '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {journalId ? 'Edit Journal Entry' : 'New Journal Entry'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual Entry</SelectItem>
                  <SelectItem value="Payroll">Payroll</SelectItem>
                  <SelectItem value="AP">Accounts Payable</SelectItem>
                  <SelectItem value="AR">Accounts Receivable</SelectItem>
                  <SelectItem value="Adjustment">Journal Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="source_id">Reference ID</Label>
              <Input
                id="source_id"
                value={formData.source_id}
                onChange={(e) => setFormData({ ...formData, source_id: e.target.value })}
                placeholder="Optional reference ID"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="memo">Memo</Label>
            <Textarea
              id="memo"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="Description of this journal entry"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Entry Lines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Journal Entry Lines</span>
            <Button onClick={handleAddLine} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Line
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={entry.account_id}
                      onValueChange={(value) => handleEntryChange(index, 'account_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_number} - {account.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell>
                    <Input
                      value={entry.description}
                      onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={entry.debit_amount || ''}
                      onChange={(e) => handleEntryChange(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="text-right"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={entry.credit_amount || ''}
                      onChange={(e) => handleEntryChange(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="text-right"
                    />
                  </TableCell>
                  
                  <TableCell>
                    {entries.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLine(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Totals Row */}
              <TableRow className="border-t-2 font-semibold">
                <TableCell colSpan={2}>TOTALS</TableCell>
                <TableCell className="text-right">{formatCurrency(totalDebits)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalCredits)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          {/* Balance Status */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={isBalanced ? "default" : "destructive"}>
                {isBalanced ? "Balanced" : "Unbalanced"}
              </Badge>
              {!isBalanced && (
                <span className="text-sm text-muted-foreground">
                  Difference: {formatCurrency(Math.abs(difference))} {difference > 0 ? 'Debit' : 'Credit'}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveDraft}
                disabled={isCreating || isUpdating || !entries.some(e => e.account_id)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSaveDraft}
                disabled={isCreating || isUpdating || !isBalanced || !entries.some(e => e.account_id)}
                variant="default"
              >
                <Send className="h-4 w-4 mr-2" />
                Save & Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};