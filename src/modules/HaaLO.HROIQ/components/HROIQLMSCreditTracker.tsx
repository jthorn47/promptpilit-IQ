import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Building,
  AlertCircle
} from 'lucide-react';
import { useLMSCredits } from '../hooks/useLMSCredits';
import { useUserRoles } from '@/hooks/useClientAccess';
import { LMSCreditForm, TrainingType } from '../types/lms';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const TRAINING_TYPES: TrainingType[] = [
  'Harassment',
  'SB553', 
  'AML',
  'Safety',
  'Cybersecurity',
  'Manager_Training',
  'Compliance'
];

const creditFormSchema = z.object({
  training_type: z.enum(['Harassment', 'SB553', 'AML', 'Safety', 'Cybersecurity', 'Manager_Training', 'Compliance']),
  credits_issued: z.number().min(1, 'Must issue at least 1 credit'),
  employee_id: z.string().optional(),
  notes: z.string().optional(),
});

export const HROIQLMSCreditTracker: React.FC = () => {
  const { data: userRoles } = useUserRoles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get company ID from user roles
  const companyId = userRoles?.find(role => 
    role.role === 'company_admin' || role.role === 'super_admin'
  )?.company_id;

  const { 
    credits, 
    summary, 
    totals, 
    loading, 
    error, 
    fetchCredits, 
    issueCredits 
  } = useLMSCredits(companyId || '');

  const form = useForm<z.infer<typeof creditFormSchema>>({
    resolver: zodResolver(creditFormSchema),
    defaultValues: {
      training_type: 'Harassment',
      credits_issued: 1,
      notes: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof creditFormSchema>) => {
    const success = await issueCredits(values as LMSCreditForm);
    if (success) {
      setIsDialogOpen(false);
      form.reset();
    }
  };

  const getTrainingTypeIcon = (type: TrainingType) => {
    switch (type) {
      case 'SB553': return '🛡️';
      case 'Harassment': return '⚠️';
      case 'AML': return '💰';
      case 'Safety': return '🦺';
      case 'Cybersecurity': return '🔒';
      case 'Manager_Training': return '👥';
      case 'Compliance': return '📋';
      default: return '📚';
    }
  };

  const getUsagePercentage = (used: number, issued: number) => {
    return issued > 0 ? Math.round((used / issued) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading LMS credit data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchCredits} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">LMS Credit Tracker</h2>
          <p className="text-muted-foreground">
            Track training credits per company and employee across all training types
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCredits}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Issue Credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Issue Training Credits</DialogTitle>
                <DialogDescription>
                  Add new training credits to your company or specific employees.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="training_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select training type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRAINING_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                <span className="flex items-center gap-2">
                                  <span>{getTrainingTypeIcon(type)}</span>
                                  {type}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="credits_issued"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Credits</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any notes about this credit issuance..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Issue Credits</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Total Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totals.totalIssued}</div>
            <p className="text-muted-foreground text-sm mt-2">Credits issued</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-warning" />
              Total Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{totals.totalUsed}</div>
            <p className="text-muted-foreground text-sm mt-2">Credits consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{totals.totalRemaining}</div>
            <p className="text-muted-foreground text-sm mt-2">Credits available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Usage Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totals.totalIssued > 0 ? Math.round((totals.totalUsed / totals.totalIssued) * 100) : 0}%
            </div>
            <Progress 
              value={totals.totalIssued > 0 ? (totals.totalUsed / totals.totalIssued) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Training Type Summary */}
      {summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Summary by Training Type</CardTitle>
            <CardDescription>
              Breakdown of credits issued, used, and remaining by training category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Training Type</TableHead>
                  <TableHead className="text-right">Issued</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Usage %</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((item) => {
                  const usagePercentage = getUsagePercentage(item.total_used, item.total_issued);
                  
                  return (
                    <TableRow key={item.training_type}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getTrainingTypeIcon(item.training_type as TrainingType)}</span>
                          <span className="font-medium">{item.training_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.total_issued}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.total_used}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={item.total_remaining > 0 ? "secondary" : "destructive"}
                          className={item.total_remaining > 0 ? "bg-success/10 text-success" : ""}
                        >
                          {item.total_remaining}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm">{usagePercentage}%</span>
                          <div className="w-16">
                            <Progress value={usagePercentage} className="h-1" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(item.last_updated), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* No Credits State */}
      {summary.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Training Credits Issued</h3>
              <p className="text-muted-foreground mb-4">
                Start by issuing training credits to track LMS usage and progress.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Issue First Credits
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {/* Reuse the same dialog content from above */}
                  <DialogHeader>
                    <DialogTitle>Issue Training Credits</DialogTitle>
                    <DialogDescription>
                      Add new training credits to your company or specific employees.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="training_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Training Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select training type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRAINING_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    <span className="flex items-center gap-2">
                                      <span>{getTrainingTypeIcon(type)}</span>
                                      {type}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="credits_issued"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Credits</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add any notes about this credit issuance..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Issue Credits</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HROIQLMSCreditTracker;