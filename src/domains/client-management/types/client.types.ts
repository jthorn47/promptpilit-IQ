export interface Client {
  id: string;
  name: string;
  industry?: string | null;
  size?: 'small' | 'medium' | 'large' | 'enterprise' | null;
  status: 'active' | 'inactive' | 'prospective' | 'churned';
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } | null;
  website_url?: string | null;
  notes?: string | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  status: 'active' | 'inactive' | 'prospective' | 'churned';
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  website_url?: string;
  notes?: string;
  contract_start_date?: string;
  contract_end_date?: string;
}

export interface ClientFilters {
  status?: string;
  industry?: string;
  size?: string;
  search?: string;
}

export interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  prospectiveClients: number;
  churnedClients: number;
  contractsExpiringSoon: number;
}