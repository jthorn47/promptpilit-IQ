-- Create clients table for won deals and client management
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  date_won TIMESTAMP WITH TIME ZONE NOT NULL,
  original_deal_owner UUID NOT NULL,
  key_contacts JSONB DEFAULT '[]'::jsonb,
  services_purchased JSONB DEFAULT '[]'::jsonb,
  onboarding_status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  contract_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  contract_start_date DATE,
  contract_end_date DATE,
  account_manager UUID,
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, churned
  notes TEXT,
  linked_documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Sales reps and account managers can view clients" 
ON public.clients FOR SELECT 
USING (has_crm_role(auth.uid(), 'sales_rep'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps and account managers can manage clients" 
ON public.clients FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create client record when deal is won
CREATE OR REPLACE FUNCTION public.create_client_from_won_deal()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'won' and actual_close_date is set
  IF NEW.status = 'won' AND NEW.actual_close_date IS NOT NULL AND 
     (OLD.status IS NULL OR OLD.status != 'won' OR OLD.actual_close_date IS NULL) THEN
    
    -- Insert new client record
    INSERT INTO public.clients (
      deal_id,
      company_name,
      date_won,
      original_deal_owner,
      contract_value,
      currency,
      account_manager,
      notes
    ) VALUES (
      NEW.id,
      NEW.company_name,
      NEW.actual_close_date,
      NEW.assigned_to,
      NEW.value,
      NEW.currency,
      NEW.assigned_to, -- Initially same as deal owner
      NEW.notes
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic client creation
CREATE TRIGGER create_client_on_deal_won
  AFTER UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.create_client_from_won_deal();

-- Add index for performance
CREATE INDEX idx_clients_deal_id ON public.clients(deal_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_account_manager ON public.clients(account_manager);
CREATE INDEX idx_clients_date_won ON public.clients(date_won);

-- Add some sample data to demonstrate (only if deals exist)
DO $$
DECLARE
    deal_rec RECORD;
    closed_won_stage_id UUID;
BEGIN
    -- Get the Closed Won stage ID
    SELECT id INTO closed_won_stage_id FROM public.deal_stages WHERE name = 'Closed Won';
    
    -- Update a sample deal to won status if it exists (for demo purposes)
    FOR deal_rec IN 
        SELECT id FROM public.deals 
        WHERE status = 'open' 
        LIMIT 1
    LOOP
        UPDATE public.deals 
        SET 
            status = 'won',
            stage_id = closed_won_stage_id,
            actual_close_date = CURRENT_DATE
        WHERE id = deal_rec.id;
    END LOOP;
END $$;