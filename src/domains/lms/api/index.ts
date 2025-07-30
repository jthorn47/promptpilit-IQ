import { supabase } from '@/integrations/supabase/client';
import { 
  TrainingModule, 
  TrainingModuleInsert, 
  TrainingModuleUpdate,
  TrainingAssignment,
  TrainingAssignmentInsert,
  TrainingAssignmentUpdate,
  TrainingCompletion,
  TrainingCompletionInsert,
  TrainingCompletionUpdate,
  Certificate,
  CertificateInsert,
  CertificateUpdate,
  TrainingScene,
  TrainingSceneInsert,
  TrainingSceneUpdate,
  SceneCompletion,
  SceneCompletionInsert,
  SceneCompletionUpdate,
  LMSMetrics,
  ModuleReport,
  EmployeeReport,
  CompletionStats,
  LMSFilters,
  TrainingFilters,
  CertificateFilters
} from '../types';

/**
 * Centralized LMS API class following the domain-driven architecture pattern
 */
export class LMSAPI {
  // Training Modules
  static async getTrainingModules(filters?: TrainingFilters) {
    let query = supabase.from('training_modules').select('*');
    
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data as TrainingModule[];
  }

  static async getTrainingModule(id: string) {
    const { data, error } = await supabase
      .from('training_modules')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as TrainingModule;
  }

  static async createTrainingModule(module: TrainingModuleInsert) {
    const { data, error } = await supabase
      .from('training_modules')
      .insert(module)
      .select()
      .single();
    
    if (error) throw error;
    return data as TrainingModule;
  }

  static async updateTrainingModule(id: string, updates: TrainingModuleUpdate) {
    const { data, error } = await supabase
      .from('training_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as TrainingModule;
  }

  static async deleteTrainingModule(id: string) {
    const { error } = await supabase
      .from('training_modules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Training Assignments
  static async getTrainingAssignments(filters?: LMSFilters) {
    let query = supabase
      .from('training_assignments')
      .select(`
        *,
        training_module:training_modules(*),
        employee:employees(*),
        training_completion:training_completions(*)
      `);
    
    if (filters?.search) {
      query = query.or(`training_module.title.ilike.%${filters.search}%,employee.full_name.ilike.%${filters.search}%`);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    query = query.order('assigned_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async createTrainingAssignment(assignment: TrainingAssignmentInsert) {
    const { data, error } = await supabase
      .from('training_assignments')
      .insert(assignment)
      .select()
      .single();
    
    if (error) throw error;
    return data as TrainingAssignment;
  }

  static async updateTrainingAssignment(id: string, updates: TrainingAssignmentUpdate) {
    const { data, error } = await supabase
      .from('training_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as TrainingAssignment;
  }

  // Training Completions
  static async getTrainingCompletions(filters?: LMSFilters) {
    let query = supabase
      .from('training_completions')
      .select(`
        *,
        training_assignment:training_assignments(
          *,
          training_module:training_modules(*),
          employee:employees(*)
        )
      `);
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    query = query.order('completed_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async createTrainingCompletion(completion: TrainingCompletionInsert) {
    const { data, error } = await supabase
      .from('training_completions')
      .insert(completion)
      .select()
      .single();
    
    if (error) throw error;
    return data as TrainingCompletion;
  }

  static async updateTrainingCompletion(id: string, updates: TrainingCompletionUpdate) {
    const { data, error } = await supabase
      .from('training_completions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as TrainingCompletion;
  }

  // Certificates
  static async getCertificates(filters?: CertificateFilters) {
    let query = supabase
      .from('certificates')
      .select(`
        *,
        training_module:training_modules(*),
        employee:employees(*)
      `);
    
    if (filters?.search) {
      query = query.or(`learner_name.ilike.%${filters.search}%,course_title.ilike.%${filters.search}%`);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    query = query.order('issued_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getCertificate(id: string) {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        training_module:training_modules(*),
        employee:employees(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createCertificate(certificate: CertificateInsert) {
    const { data, error } = await supabase
      .from('certificates')
      .insert(certificate)
      .select()
      .single();
    
    if (error) throw error;
    return data as Certificate;
  }

  static async updateCertificate(id: string, updates: CertificateUpdate) {
    const { data, error } = await supabase
      .from('certificates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Certificate;
  }

  // Training Scenes
  static async getTrainingScenes(moduleId: string) {
    const { data, error } = await supabase
      .from('training_scenes')
      .select('*')
      .eq('training_module_id', moduleId)
      .order('scene_order');
    
    if (error) throw error;
    return data as TrainingScene[];
  }

  static async createTrainingScene(scene: TrainingSceneInsert) {
    const { data, error } = await supabase
      .from('training_scenes')
      .insert(scene)
      .select()
      .single();
    
    if (error) throw error;
    return data as TrainingScene;
  }

  static async updateTrainingScene(id: string, updates: TrainingSceneUpdate) {
    const { data, error } = await supabase
      .from('training_scenes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as TrainingScene;
  }

  // Scene Completions
  static async getSceneCompletions(employeeId: string, sceneId?: string) {
    let query = supabase
      .from('scene_completions')
      .select('*')
      .eq('employee_id', employeeId);
    
    if (sceneId) {
      query = query.eq('scene_id', sceneId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as SceneCompletion[];
  }

  static async createSceneCompletion(completion: SceneCompletionInsert) {
    const { data, error } = await supabase
      .from('scene_completions')
      .insert(completion)
      .select()
      .single();
    
    if (error) throw error;
    return data as SceneCompletion;
  }

  static async updateSceneCompletion(id: string, updates: SceneCompletionUpdate) {
    const { data, error } = await supabase
      .from('scene_completions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as SceneCompletion;
  }

  // Analytics and Reporting
  static async getLMSMetrics(): Promise<LMSMetrics> {
    const [
      { data: modules },
      { data: assignments },
      { data: completions },
      { data: certificates }
    ] = await Promise.all([
      supabase.from('training_modules').select('id, status'),
      supabase.from('training_assignments').select('id, status'),
      supabase.from('training_completions').select('id, status, progress_percentage'),
      supabase.from('certificates').select('id, status')
    ] as const);

    const totalModules = modules?.length || 0;
    const activeModules = modules?.filter(m => m.status === 'published').length || 0;
    const totalAssignments = assignments?.length || 0;
    const completedAssignments = completions?.filter(c => c.status === 'completed').length || 0;
    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
    const totalCertificates = certificates?.length || 0;
    const activeCertificates = certificates?.filter(c => c.status === 'active').length || 0;
    const averageScore = completions?.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / (completions?.length || 1);

    return {
      totalModules,
      activeModules,
      totalAssignments,
      completedAssignments,
      completionRate,
      totalCertificates,
      activeCertificates,
      averageScore
    };
  }

  static async getModuleReports(): Promise<ModuleReport[]> {
    const { data: modules, error } = await supabase
      .from('training_modules')
      .select(`
        id,
        title,
        training_assignments(
          id,
          training_completions(*)
        )
      `);

    if (error) throw error;

    return modules?.map(module => {
      const assignments = module.training_assignments || [];
      const completions = assignments.flatMap(a => a.training_completions || []);
      const completedCount = completions.filter(c => c.status === 'completed').length;
      const averageScore = completions.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / (completions.length || 1);
      const totalTimeSpent = completions.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0);

      return {
        moduleId: module.id,
        moduleTitle: module.title,
        assignmentCount: assignments.length,
        completionCount: completedCount,
        completionRate: assignments.length > 0 ? (completedCount / assignments.length) * 100 : 0,
        averageScore,
        totalTimeSpent
      };
    }) || [];
  }

  static async getEmployeeReports(): Promise<EmployeeReport[]> {
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        training_assignments(
          id,
          training_completions(*)
        )
      `);

    if (error) throw error;

    // Get certificates separately
    const { data: certificates } = await supabase
      .from('certificates')
      .select('employee_id');

    return employees?.map(employee => {
      const assignments = employee.training_assignments || [];
      const completions = assignments.flatMap(a => a.training_completions || []);
      const completedCount = completions.filter(c => c.status === 'completed').length;
      const averageScore = completions.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / (completions.length || 1);
      const totalTimeSpent = completions.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0);
      const lastCompletion = completions.sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())[0];
      const employeeCertificates = certificates?.filter(cert => cert.employee_id === employee.id) || [];

      return {
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        assignedModules: assignments.length,
        completedModules: completedCount,
        completionRate: assignments.length > 0 ? (completedCount / assignments.length) * 100 : 0,
        averageScore,
        totalTimeSpent,
        certificatesEarned: employeeCertificates.length,
        lastActivity: lastCompletion?.completed_at || 'Never'
      };
    }) || [];
  }

  static async getCompletionStats(): Promise<CompletionStats> {
    const [
      { data: employees },
      { data: modules },
      { data: assignments },
      { data: completions },
      { data: certificates }
    ] = await Promise.all([
      supabase.from('employees').select('id').eq('status', 'active'),
      supabase.from('training_modules').select('id').eq('status', 'published'),
      supabase.from('training_assignments').select('id'),
      supabase.from('training_completions').select('progress_percentage, status'),
      supabase.from('certificates').select('id').eq('status', 'active')
    ] as const);

    const totalEmployees = employees?.length || 0;
    const totalModules = modules?.length || 0;
    const totalAssignments = assignments?.length || 0;
    const completedAssignments = completions?.filter(c => c.status === 'completed').length || 0;
    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
    const totalCertificates = certificates?.length || 0;
    const averageScore = completions?.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / (completions?.length || 1);

    return {
      totalEmployees,
      totalModules,
      totalAssignments,
      completedAssignments,
      completionRate,
      totalCertificates,
      averageScore
    };
  }
}