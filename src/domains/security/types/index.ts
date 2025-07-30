// Security Domain Types
export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  resource_affected?: string;
  event_data?: any;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface SecurityMetrics {
  total_events: number;
  critical_events: number;
  resolved_events: number;
  active_threats: number;
  security_score: number;
  last_scan_date: string;
}

export interface SecurityScan {
  id: string;
  scan_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  vulnerabilities_found: number;
  scan_results?: any;
  started_at: string;
  completed_at?: string;
}

export interface VulnerabilityReport {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cve_id?: string;
  description: string;
  affected_components: string[];
  remediation_steps: string[];
  status: 'open' | 'investigating' | 'mitigated' | 'fixed';
  discovered_at: string;
  fixed_at?: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  policy_type: string;
  is_active: boolean;
  rules: any;
  created_at: string;
  updated_at: string;
}