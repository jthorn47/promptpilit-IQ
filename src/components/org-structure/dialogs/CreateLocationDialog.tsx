import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Location } from '@/hooks/useOrgStructure';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (location: { name: string; code?: string; address_line1?: string; address_line2?: string; city?: string; state?: string; zip?: string; country?: string; timezone?: string; }) => Promise<Location>;
}

export const CreateLocationDialog = ({ open, onOpenChange, onSuccess }: CreateLocationDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      timezone: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await onSuccess({
        name: values.name,
        code: values.code || undefined,
        address_line1: values.address_line1,
        address_line2: values.address_line2,
        city: values.city,
        state: values.state,
        zip: values.zip,
        country: values.country || 'US',
        timezone: values.timezone,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Location</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Office, Branch Office, Warehouse" {...field} />
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
                  <FormLabel>Location Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., HQ, NYC, LA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address_line1"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_line2"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Suite, apartment, floor, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Create Location
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};