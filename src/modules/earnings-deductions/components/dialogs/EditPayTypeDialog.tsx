import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdatePayType, PayType } from '@/hooks/usePayTypes';

const payTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  pay_category: z.enum(['earnings', 'deductions']),
  description: z.string().optional(),
  is_taxable_federal: z.boolean().default(true),
  is_taxable_state: z.boolean().default(true),
  is_taxable_fica: z.boolean().default(true),
  is_taxable_medicare: z.boolean().default(true),
  is_taxable_sdi: z.boolean().default(true),
  is_taxable_sui: z.boolean().default(true),
  subject_to_overtime: z.boolean().default(false),
  counts_toward_hours_worked: z.boolean().default(true),
  includable_in_regular_rate: z.boolean().default(true),
  default_rate_multiplier: z.number().min(0).default(1.0),
  reportable_on_w2: z.boolean().default(true),
  w2_box_code: z.string().optional(),
  gl_code: z.string().optional(),
  show_on_pay_stub: z.boolean().default(true),
  include_in_overtime_calculation: z.boolean().default(false),
  employer_match_percentage: z.number().min(0).max(100).default(0),
  per_check_limit: z.number().min(0).optional(),
  annual_limit: z.number().min(0).optional(),
  calculation_method: z.enum(['flat_amount', 'percentage', 'hours']).default('flat_amount'),
  deduction_schedule: z.enum(['every_check', 'monthly', 'quarterly', 'annually']).default('every_check'),
  is_reimbursable: z.boolean().default(false),
  w2_reporting_code: z.string().optional(),
  effective_start_date: z.string(),
  effective_end_date: z.string().optional(),
});

type FormValues = z.infer<typeof payTypeSchema>;

interface EditPayTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payType: PayType;
  companyId?: string;
}

export const EditPayTypeDialog = ({
  open,
  onOpenChange,
  payType,
  companyId,
}: EditPayTypeDialogProps) => {
  const updatePayType = useUpdatePayType();

  const form = useForm<FormValues>({
    resolver: zodResolver(payTypeSchema),
  });

  // Reset form when payType changes
  useEffect(() => {
    if (payType) {
      form.reset({
        name: payType.name,
        code: payType.code,
        pay_category: payType.pay_category,
        description: payType.description || '',
        is_taxable_federal: payType.is_taxable_federal ?? true,
        is_taxable_state: payType.is_taxable_state ?? true,
        is_taxable_fica: payType.is_taxable_fica ?? true,
        is_taxable_medicare: payType.is_taxable_medicare ?? true,
        is_taxable_sdi: payType.is_taxable_sdi ?? true,
        is_taxable_sui: payType.is_taxable_sui ?? true,
        subject_to_overtime: payType.subject_to_overtime ?? false,
        counts_toward_hours_worked: payType.counts_toward_hours_worked ?? true,
        includable_in_regular_rate: payType.includable_in_regular_rate ?? true,
        default_rate_multiplier: payType.default_rate_multiplier ?? 1.0,
        reportable_on_w2: payType.reportable_on_w2 ?? true,
        w2_box_code: payType.w2_box_code || '',
        gl_code: payType.gl_code || '',
        show_on_pay_stub: payType.show_on_pay_stub ?? true,
        include_in_overtime_calculation: payType.include_in_overtime_calculation ?? false,
        employer_match_percentage: payType.employer_match_percentage ?? 0,
        per_check_limit: payType.per_check_limit || undefined,
        annual_limit: payType.annual_limit || undefined,
        calculation_method: (payType.calculation_method as any) || 'flat_amount',
        deduction_schedule: (payType.deduction_schedule as any) || 'every_check',
        is_reimbursable: payType.is_reimbursable ?? false,
        w2_reporting_code: payType.w2_reporting_code || '',
        effective_start_date: payType.effective_start_date,
        effective_end_date: payType.effective_end_date || '',
      });
    }
  }, [payType, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updatePayType.mutateAsync({
        id: payType.id,
        ...data,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isReadOnly = payType.is_global && !companyId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly ? 'View' : 'Edit'} Pay Type - {payType.name}
          </DialogTitle>
          {isReadOnly && (
            <p className="text-sm text-muted-foreground">
              Global pay types are read-only for company administrators
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Regular Pay" 
                        {...field} 
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., REG" 
                        {...field} 
                        disabled={isReadOnly}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pay_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="earnings">Earnings</SelectItem>
                        <SelectItem value="deductions">Deductions</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_rate_multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Multiplier</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0"
                        placeholder="1.0"
                        {...field}
                        disabled={isReadOnly}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      e.g., 1.5 for overtime, 2.0 for double time
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Optional description..."
                      {...field}
                      disabled={isReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tax Treatment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tax Treatment</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="is_taxable_federal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Federal Tax</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_taxable_state"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>State Tax</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_taxable_fica"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>FICA</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_taxable_medicare"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Medicare</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_taxable_sdi"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>SDI</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_taxable_sui"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>SUI</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Other Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Other Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subject_to_overtime"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Subject to Overtime</FormLabel>
                        <FormDescription>
                          Hours count toward overtime calculation
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reportable_on_w2"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Reportable on W2</FormLabel>
                        <FormDescription>
                          Include on W2 tax forms
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="show_on_pay_stub"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Show on Pay Stub</FormLabel>
                        <FormDescription>
                          Display on employee pay stubs
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_reimbursable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Reimbursable</FormLabel>
                        <FormDescription>
                          Employee can be reimbursed
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* GL and W2 Codes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gl_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GL Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 5000" 
                        {...field} 
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="w2_box_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>W2 Box Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 1" 
                        {...field} 
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button 
                  type="submit" 
                  disabled={updatePayType.isPending}
                >
                  {updatePayType.isPending ? 'Updating...' : 'Update Pay Type'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
