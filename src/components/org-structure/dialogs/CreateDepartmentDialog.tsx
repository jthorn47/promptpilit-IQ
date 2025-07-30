import React from 'react';
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

interface CreateDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (department: { name: string; code?: string; division_id: string; }) => Promise<Department>;
  divisions: Division[];
}

export const CreateDepartmentDialog = ({ open, onOpenChange, onSuccess, divisions }: CreateDepartmentDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      division_id: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await onSuccess({
        division_id: values.division_id,
        name: values.name,
        code: values.code || undefined,
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating department:', error);
      
      // Handle duplicate department name error
      if (error?.message?.includes('duplicate key value violates unique constraint') && 
          error?.message?.includes('org_departments_division_id_name_key')) {
        form.setError('name', {
          type: 'manual',
          message: 'A department with this name already exists in the selected division. Please choose a different name.',
        });
      } else {
        // Generic error handling
        form.setError('root', {
          type: 'manual',
          message: `Failed to create department: ${error?.message || 'Unknown error'}`,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="division_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Division</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                Create Department
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};