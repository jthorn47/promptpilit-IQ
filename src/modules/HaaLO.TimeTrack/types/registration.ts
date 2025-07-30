/**
 * Employee Registration Types
 */

export interface RegistrationToken {
  id: string;
  employee_id: string;
  company_id: string;
  token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
  created_by?: string;
}

export interface EmployeeRegistrationData {
  employee_id: string;
  first_name: string;
  last_name: string;
  employee_number?: string;
  email?: string;
  company_name: string;
}

export interface RegistrationFormData {
  pin: string;
  confirmPin: string;
  photoFile?: File;
  photoUrl?: string;
  acceptedTerms: boolean;
}

export interface RegistrationValidation {
  isValid: boolean;
  errors: {
    pin?: string;
    confirmPin?: string;
    photo?: string;
    terms?: string;
  };
}