import { Database } from '@/integrations/supabase/types';

// Core LMS types based on Supabase schema
export type TrainingModule = Database['public']['Tables']['training_modules']['Row'];
export type TrainingModuleInsert = Database['public']['Tables']['training_modules']['Insert'];
export type TrainingModuleUpdate = Database['public']['Tables']['training_modules']['Update'];

export type TrainingAssignment = Database['public']['Tables']['training_assignments']['Row'];
export type TrainingAssignmentInsert = Database['public']['Tables']['training_assignments']['Insert'];
export type TrainingAssignmentUpdate = Database['public']['Tables']['training_assignments']['Update'];

export type TrainingCompletion = Database['public']['Tables']['training_completions']['Row'];
export type TrainingCompletionInsert = Database['public']['Tables']['training_completions']['Insert'];
export type TrainingCompletionUpdate = Database['public']['Tables']['training_completions']['Update'];

export type Certificate = Database['public']['Tables']['certificates']['Row'];
export type CertificateInsert = Database['public']['Tables']['certificates']['Insert'];
export type CertificateUpdate = Database['public']['Tables']['certificates']['Update'];

export type TrainingScene = Database['public']['Tables']['training_scenes']['Row'];
export type TrainingSceneInsert = Database['public']['Tables']['training_scenes']['Insert'];
export type TrainingSceneUpdate = Database['public']['Tables']['training_scenes']['Update'];

export type SceneCompletion = Database['public']['Tables']['scene_completions']['Row'];
export type SceneCompletionInsert = Database['public']['Tables']['scene_completions']['Insert'];
export type SceneCompletionUpdate = Database['public']['Tables']['scene_completions']['Update'];

// Extended types with relations
export interface TrainingModuleWithStats extends TrainingModule {
  assignment_count?: number;
  completion_count?: number;
  completion_rate?: number;
  average_score?: number;
}

export interface TrainingAssignmentWithDetails extends TrainingAssignment {
  training_module?: TrainingModule;
  employee?: any; // Define employee type as needed
  training_completion?: TrainingCompletion;
}

export interface CertificateWithDetails extends Certificate {
  training_module?: TrainingModule;
  employee?: any; // Define employee type as needed
}

// Analytics and reporting types
export interface LMSMetrics {
  totalModules: number;
  activeModules: number;
  totalAssignments: number;
  completedAssignments: number;
  completionRate: number;
  totalCertificates: number;
  activeCertificates: number;
  averageScore: number;
}

export interface ModuleReport {
  moduleId: string;
  moduleTitle: string;
  assignmentCount: number;
  completionCount: number;
  completionRate: number;
  averageScore: number;
  totalTimeSpent: number;
}

export interface EmployeeReport {
  employeeId: string;
  employeeName: string;
  assignedModules: number;
  completedModules: number;
  completionRate: number;
  averageScore: number;
  totalTimeSpent: number;
  certificatesEarned: number;
  lastActivity: string;
}

export interface CompletionStats {
  totalEmployees: number;
  totalModules: number;
  totalAssignments: number;
  completedAssignments: number;
  completionRate: number;
  totalCertificates: number;
  averageScore: number;
}

// Filters and search types
export interface LMSFilters {
  search?: string;
  status?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  companyId?: string;
}

export interface TrainingFilters extends LMSFilters {
  moduleType?: string;
  difficulty?: string;
}

export interface CertificateFilters extends LMSFilters {
  certificateStatus?: string;
  expiryStatus?: string;
}