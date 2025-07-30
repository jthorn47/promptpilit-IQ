import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department, Division } from '@/hooks/useOrgStructure';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  division_id: z.string().min(1, 'Division is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department;
  divisions: Division[];
  onSuccess: (id: string, updates: Partial<Department>) => Promise<Department>;
}

export const EditDepartmentDialog = ({ open, onOpenChange, department, divisions, onSuccess }: EditDepartmentDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: department.name,
      code: department.code || '',
      division_id: department.division_id,
    },
  });

  useEffect(() => {
    form.reset({
      name: department.name,
      code: department.code || '',
      division_id: department.division_id,
    });
  }, [department, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      await onSuccess(department.id, {
        name: values.name,
        code: values.code || undefined,
        division_id: values.division_id,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="division_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Division</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a division" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Human Resources, Engineering, Marketing" {...field} />
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
                  <FormLabel>Department Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., HR, ENG, MKT" {...field} />
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
                Update Department
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};