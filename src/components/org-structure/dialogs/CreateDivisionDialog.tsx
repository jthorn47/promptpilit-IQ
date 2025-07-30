import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Division, Location } from '@/hooks/useOrgStructure';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  location_id: z.string().min(1, 'Location is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateDivisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (division: { name: string; code?: string; location_id: string; }) => Promise<Division>;
  locations: Location[];
}

export const CreateDivisionDialog = ({ open, onOpenChange, onSuccess, locations }: CreateDivisionDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      location_id: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await onSuccess({
        location_id: values.location_id,
        name: values.name,
        code: values.code || undefined,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating division:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Division</DialogTitle>
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
               name="location_id"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Location</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select a location" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {locations.map((location) => (
                         <SelectItem key={location.id} value={location.id}>
                           {location.name}
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
                Create Division
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};