import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  industry: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
  status: z.enum(['active', 'inactive', 'prospective', 'churned']),
  contact_name: z.string().max(100, "Contact name must be less than 100 characters").optional(),
  contact_email: z.string().email("Invalid email format").optional().or(z.literal("")),
  contact_phone: z.string().max(20, "Phone number must be less than 20 characters").optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  website_url: z.string().url("Invalid URL format").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  contract_start_date: z.string().optional(),
  contract_end_date: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;