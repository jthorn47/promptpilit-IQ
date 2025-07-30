
export interface SystemHealth {
  uptime: number;
  aiAssistants: number;
  activeOrgs: number;
  totalUsers: number;
  activeUsers24h: number;
  microservicesOnline: number;
  microservicesTotal: number;
  lastSyncTimestamp: string;
}

export interface ModuleStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  version: string;
  orgsUsing: number;
  errorCount: number;
  lastUpdate: string;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface RecentItem {
  id: string;
  type: 'impersonation' | 'proposal' | 'config' | 'tool';
  title: string;
  subtitle: string;
  url: string;
  timestamp: string;
}

export interface SecurityMetrics {
  mfaEnforcementRate: number;
  lastPasswordPolicyUpdate: string;
  auditLogSize: number;
  threatLevel: 'low' | 'medium' | 'high';
}

export interface LaunchpadData {
  systemHealth: SystemHealth;
  modules: ModuleStatus[];
  alerts: SystemAlert[];
  recentActivity: RecentItem[];
  securitySummary: SecurityMetrics;
}
