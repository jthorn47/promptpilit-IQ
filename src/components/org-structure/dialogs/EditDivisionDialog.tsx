import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Division } from '@/hooks/useOrgStructure';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDivisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  division: Division;
  onSuccess: (id: string, updates: Partial<Division>) => Promise<Division>;
}

export const EditDivisionDialog = ({ open, onOpenChange, division, onSuccess }: EditDivisionDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: division.name,
      code: division.code || '',
    },
  });

  useEffect(() => {
    form.reset({
      name: division.name,
      code: division.code || '',
    });
  }, [division, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await onSuccess(division.id, {
        name: values.name,
        code: values.code || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating division:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Division</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Division Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Operations, Sales, Finance" {...field} />
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
                  <FormLabel>Division Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., OPS, SALES, FIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Update Division
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};