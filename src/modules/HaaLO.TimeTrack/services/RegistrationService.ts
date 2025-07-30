/**
 * Employee Registration Service
 * Handles secure token-based employee registration flow
 */

import { supabase } from "@/integrations/supabase/client";
import { 
  RegistrationToken, 
  EmployeeRegistrationData, 
  RegistrationFormData,
  RegistrationValidation 
} from "../types/registration";

export class RegistrationService {
  /**
   * Generate registration token for employee
   */
  static async generateRegistrationToken(employeeId: string, expiresHours: number = 72): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_employee_registration_token', {
        p_employee_id: employeeId,
        p_expires_hours: expiresHours
      });

      if (error) {
        console.error('Error generating registration token:', error);
        throw new Error('Failed to generate registration token');
      }

      return data;
    } catch (error) {
      console.error('Error generating registration token:', error);
      throw error;
    }
  }

  /**
   * Validate and get registration data by token
   */
  static async getRegistrationByToken(token: string): Promise<EmployeeRegistrationData | null> {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from('employee_registration_tokens')
        .select(`
          *,
          employees (
            id,
            first_name,
            last_name,
            employee_number,
            email,
            registration_complete,
            company_settings (
              company_name
            )
          )
        `)
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .is('used_at', null)
        .single();

      if (tokenError || !tokenData) {
        console.error('Invalid or expired token:', tokenError);
        return null;
      }

      const employee = tokenData.employees as any;
      
      // Check if already registered
      if (employee.registration_complete) {
        throw new Error('Employee registration already completed');
      }

      return {
        employee_id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        employee_number: employee.employee_number,
        email: employee.email,
        company_name: employee.company_settings?.company_name || 'Unknown Company'
      };
    } catch (error) {
      console.error('Error validating registration token:', error);
      throw error;
    }
  }

  /**
   * Complete employee registration
   */
  static async completeRegistration(
    token: string, 
    formData: RegistrationFormData
  ): Promise<boolean> {
    try {
      // Validate form data
      const validation = this.validateRegistrationForm(formData);
      if (!validation.isValid) {
        throw new Error('Invalid registration data');
      }

      // Get registration data
      const registrationData = await this.getRegistrationByToken(token);
      if (!registrationData) {
        throw new Error('Invalid registration token');
      }

      // Hash PIN
      const pinHash = await this.hashPin(formData.pin);

      // Upload photo if provided
      let photoUrl = formData.photoUrl;
      if (formData.photoFile) {
        photoUrl = await this.uploadEmployeePhoto(
          registrationData.employee_id, 
          formData.photoFile
        );
      }

      // Generate QR code for badge
      const qrCode = this.generateQRCode();

      // Update employee record
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          time_tracking_pin_hash: pinHash,
          photo_reference_url: photoUrl,
          badge_qr_code: qrCode,
          registration_complete: true,
          registration_completed_at: new Date().toISOString()
        })
        .eq('id', registrationData.employee_id);

      if (updateError) {
        console.error('Error updating employee:', updateError);
        throw new Error('Failed to complete registration');
      }

      // Mark token as used
      const { error: tokenError } = await supabase
        .from('employee_registration_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

      if (tokenError) {
        console.error('Error marking token as used:', tokenError);
      }

      return true;
    } catch (error) {
      console.error('Error completing registration:', error);
      throw error;
    }
  }

  /**
   * Validate registration form data
   */
  static validateRegistrationForm(formData: RegistrationFormData): RegistrationValidation {
    const errors: any = {};
    let isValid = true;

    // Validate PIN
    if (!formData.pin || formData.pin.length < 4) {
      errors.pin = 'PIN must be at least 4 digits';
      isValid = false;
    } else if (!/^\d+$/.test(formData.pin)) {
      errors.pin = 'PIN must contain only numbers';
      isValid = false;
    }

    // Validate PIN confirmation
    if (formData.pin !== formData.confirmPin) {
      errors.confirmPin = 'PINs do not match';
      isValid = false;
    }

    // Validate photo
    if (!formData.photoFile && !formData.photoUrl) {
      errors.photo = 'Photo is required';
      isValid = false;
    }

    // Validate terms acceptance
    if (!formData.acceptedTerms) {
      errors.terms = 'You must accept the terms of service';
      isValid = false;
    }

    return { isValid, errors };
  }

  /**
   * Upload employee photo to storage
   */
  private static async uploadEmployeePhoto(employeeId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `employee-${employeeId}-${Date.now()}.${fileExt}`;
      const filePath = `employee-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  }

  /**
   * Hash PIN for secure storage
   */
  private static async hashPin(pin: string): Promise<string> {
    // Simple hash implementation - in production, use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + 'timetrack_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate unique QR code for employee badge
   */
  private static generateQRCode(): string {
    return 'EMP-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  /**
   * Generate registration URL for employee
   */
  static generateRegistrationUrl(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register/${token}`;
  }
}