import { supabase } from '@/integrations/supabase/client';

export interface CertificateData {
  id: string;
  user_id: string;
  employee_id: string;
  training_module_id: string;
  course_title: string;
  learner_name: string;
  instructor_name: string;
  score?: number;
  completion_date: string;
  expiration_date?: string;
  certificate_number: string;
  qr_code_data: string;
  verification_token: string;
  status: 'active' | 'revoked' | 'expired';
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateGenerationRequest {
  userId: string;
  courseTitle: string;
  learnerName: string;
  completionDate: Date;
  score?: number;
  instructorName?: string;
  expirationDate?: Date;
  companyId?: string;
}

export const generateCertificate = async (request: CertificateGenerationRequest): Promise<CertificateData> => {
  const certificateNumber = crypto.randomUUID();
  const verificationToken = crypto.randomUUID();
  const qrCodeData = `https://easelearn.com/verify?id=${certificateNumber}`;

  const certificateData = {
    user_id: request.userId,
    course_title: request.courseTitle,
    learner_name: request.learnerName,
    instructor_name: request.instructorName || 'Jeffrey D Thorn',
    score: request.score,
    completion_date: request.completionDate.toISOString(),
    expires_at: request.expirationDate?.toISOString(),
    certificate_number: certificateNumber,
    qr_code_data: qrCodeData,
    verification_token: verificationToken,
    status: 'active' as const,
    company_id: request.companyId,
    employee_id: request.userId,
    training_module_id: certificateNumber
  };

  const { data, error } = await supabase
    .from('certificates')
    .insert(certificateData)
    .select()
    .single();

  if (error) {
    console.error('Supabase error creating certificate:', error);
    throw new Error(`Failed to generate certificate: ${error.message}`);
  }
  return data as CertificateData;
};

export const getCertificateByNumber = async (certificateNumber: string): Promise<CertificateData | null> => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_number', certificateNumber)
    .single();

  if (error) return null;
  return data as CertificateData;
};

export const getUserCertificates = async (userId: string): Promise<CertificateData[]> => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as CertificateData[];
};

export const searchCertificates = async (
  query: string, 
  companyId?: string, 
  dateRange?: { start: Date; end: Date }
): Promise<CertificateData[]> => {
  let queryBuilder = supabase.from('certificates').select('*');
  
  if (companyId) queryBuilder = queryBuilder.eq('company_id', companyId);
  if (query) queryBuilder = queryBuilder.or(`learner_name.ilike.%${query}%,course_title.ilike.%${query}%`);
  if (dateRange) {
    queryBuilder = queryBuilder
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false });
  if (error) return [];
  return data as CertificateData[];
};

// Legacy function names for backwards compatibility
export const getCompanyCertificates = async (companyId: string): Promise<CertificateData[]> => {
  return searchCertificates('', companyId);
};

export const generateCertificateNumber = (): string => {
  return crypto.randomUUID();
};

export const generateVerificationToken = (): string => {
  return crypto.randomUUID();
};

export const createCertificate = async (data: CertificateData): Promise<string | null> => {
  const { data: result, error } = await supabase
    .from('certificates')
    .insert(data)
    .select('id')
    .single();
  
  if (error) return null;
  return result.id;
};

export const generateCertificateOnCompletion = async (
  completionId: string,
  employeeId: string,
  trainingModuleId: string
): Promise<boolean> => {
  try {
    // This would typically integrate with your completion tracking system
    // For now, return true to indicate success
    console.log('Certificate generation triggered for completion:', { completionId, employeeId, trainingModuleId });
    return true;
  } catch (error) {
    console.error('Failed to generate certificate on completion:', error);
    return false;
  }
};

export const revokeCertificate = async (certificateId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('certificates')
    .update({ status: 'revoked' })
    .eq('id', certificateId);
  return !error;
};

export const reactivateCertificate = async (certificateId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('certificates')
    .update({ status: 'active' })
    .eq('id', certificateId);
  return !error;
};