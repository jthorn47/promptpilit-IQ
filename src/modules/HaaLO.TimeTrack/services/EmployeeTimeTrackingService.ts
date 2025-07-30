import { supabase } from '@/integrations/supabase/client';
import { KioskService, PayrollEmployee } from './KioskService';

export interface TimeTrackingSettings {
  enabled: boolean;
  pin?: string;
  photoReferenceUrl?: string;
  badgeQrCode?: string;
  defaultLocationId?: string;
  timezone?: string;
}

export interface PunchRecord {
  id: string;
  employeeId: string;
  punchType: string;
  punchTime: string;
  deviceId?: string;
  photoUrl?: string;
  locationName?: string;
  pinVerified: boolean;
  notes?: string;
}

export class EmployeeTimeTrackingService {
  
  static async updateTimeTrackingSettings(
    employeeId: string, 
    settings: Partial<TimeTrackingSettings>
  ): Promise<boolean> {
    try {
      const updateData: any = {};

      if (settings.enabled !== undefined) {
        updateData.time_tracking_enabled = settings.enabled;
      }

      if (settings.pin) {
        updateData.time_tracking_pin_hash = KioskService.hashPin(settings.pin);
      }

      if (settings.photoReferenceUrl !== undefined) {
        updateData.photo_reference_url = settings.photoReferenceUrl;
      }

      if (settings.badgeQrCode !== undefined) {
        updateData.badge_qr_code = settings.badgeQrCode;
      }

      if (settings.defaultLocationId !== undefined) {
        updateData.default_location_id = settings.defaultLocationId;
      }

      if (settings.timezone !== undefined) {
        updateData.time_tracking_timezone = settings.timezone;
      }

      const { error } = await supabase
        .from('payroll_employees')
        .update(updateData)
        .eq('id', employeeId);

      if (error) {
        console.error('Error updating time tracking settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating time tracking settings:', error);
      return false;
    }
  }

  static async generateAndAssignQRCode(employeeId: string): Promise<string | null> {
    try {
      const qrCode = await KioskService.generateQRCode();
      
      const { error } = await supabase
        .from('payroll_employees')
        .update({ badge_qr_code: qrCode })
        .eq('id', employeeId);

      if (error) {
        console.error('Error assigning QR code:', error);
        return null;
      }

      return qrCode;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  static async uploadEmployeePhoto(employeeId: string, photoFile: File): Promise<string | null> {
    try {
      const fileName = `employee_photo_${employeeId}_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('biometric-photos')
        .upload(fileName, photoFile, {
          contentType: photoFile.type,
          upsert: true
        });

      if (error) {
        console.error('Error uploading photo:', error);
        return null;
      }

      // Update employee record with photo URL
      const { error: updateError } = await supabase
        .from('payroll_employees')
        .update({ photo_reference_url: data.path })
        .eq('id', employeeId);

      if (updateError) {
        console.error('Error updating employee photo URL:', updateError);
        return null;
      }

      return data.path;
    } catch (error) {
      console.error('Error uploading employee photo:', error);
      return null;
    }
  }

  static async getEmployeePunchHistory(
    employeeId: string, 
    startDate?: string, 
    endDate?: string,
    limit: number = 50
  ): Promise<PunchRecord[]> {
    try {
      let query = supabase
        .from('time_punches')
        .select('*')
        .eq('employee_id', employeeId)
        .order('punch_time', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('punch_time', startDate);
      }

      if (endDate) {
        query = query.lte('punch_time', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching punch history:', error);
        return [];
      }

      return data?.map(punch => ({
        id: punch.id,
        employeeId: punch.employee_id,
        punchType: punch.punch_type,
        punchTime: punch.punch_time,
        deviceId: punch.device_id,
        photoUrl: punch.photo_url,
        locationName: punch.location_name,
        pinVerified: punch.pin_verified || false,
        notes: punch.notes
      })) || [];
    } catch (error) {
      console.error('Error fetching punch history:', error);
      return [];
    }
  }

  static async getEmployeeLastPunchInfo(employeeId: string): Promise<{
    lastPunch: PunchRecord | null;
    currentStatus: 'clocked_in' | 'clocked_out' | 'on_break' | 'on_meal';
    nextAction: string;
  }> {
    try {
      const lastPunch = await KioskService.getLastPunch(employeeId);
      
      if (!lastPunch) {
        return {
          lastPunch: null,
          currentStatus: 'clocked_out',
          nextAction: 'Clock In'
        };
      }

      const punchRecord: PunchRecord = {
        id: lastPunch.id,
        employeeId: lastPunch.employee_id,
        punchType: lastPunch.punch_type,
        punchTime: lastPunch.punch_time,
        deviceId: lastPunch.device_id,
        photoUrl: lastPunch.photo_url,
        locationName: lastPunch.location_name,
        pinVerified: lastPunch.pin_verified || false,
        notes: lastPunch.notes
      };

      let currentStatus: 'clocked_in' | 'clocked_out' | 'on_break' | 'on_meal';
      let nextAction: string;

      switch (lastPunch.punch_type) {
        case 'clock_in':
          currentStatus = 'clocked_in';
          nextAction = 'Clock Out';
          break;
        case 'clock_out':
          currentStatus = 'clocked_out';
          nextAction = 'Clock In';
          break;
        case 'break_start':
          currentStatus = 'on_break';
          nextAction = 'End Break';
          break;
        case 'break_end':
          currentStatus = 'clocked_in';
          nextAction = 'Clock Out';
          break;
        case 'meal_start':
          currentStatus = 'on_meal';
          nextAction = 'End Meal';
          break;
        case 'meal_end':
          currentStatus = 'clocked_in';
          nextAction = 'Clock Out';
          break;
        default:
          currentStatus = 'clocked_out';
          nextAction = 'Clock In';
      }

      return {
        lastPunch: punchRecord,
        currentStatus,
        nextAction
      };
    } catch (error) {
      console.error('Error getting employee last punch info:', error);
      return {
        lastPunch: null,
        currentStatus: 'clocked_out',
        nextAction: 'Clock In'
      };
    }
  }

  static async resetEmployeePin(employeeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payroll_employees')
        .update({ time_tracking_pin_hash: null })
        .eq('id', employeeId);

      if (error) {
        console.error('Error resetting PIN:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error resetting PIN:', error);
      return false;
    }
  }

  static async deleteEmployeePhoto(employeeId: string): Promise<boolean> {
    try {
      // Get current photo URL
      const { data: employee, error: fetchError } = await supabase
        .from('payroll_employees')
        .select('photo_reference_url')
        .eq('id', employeeId)
        .single();

      if (fetchError || !employee?.photo_reference_url) {
        return true; // No photo to delete
      }

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('biometric-photos')
        .remove([employee.photo_reference_url]);

      if (deleteError) {
        console.error('Error deleting photo from storage:', deleteError);
      }

      // Update employee record
      const { error: updateError } = await supabase
        .from('payroll_employees')
        .update({ photo_reference_url: null })
        .eq('id', employeeId);

      if (updateError) {
        console.error('Error updating employee photo URL:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting employee photo:', error);
      return false;
    }
  }

  static formatPunchType(punchType: string): string {
    const typeMap: Record<string, string> = {
      'clock_in': 'Clock In',
      'clock_out': 'Clock Out',
      'break_start': 'Break Start',
      'break_end': 'Break End',
      'meal_start': 'Meal Start',
      'meal_end': 'Meal End'
    };
    
    return typeMap[punchType] || punchType;
  }

  static formatPunchTime(punchTime: string): string {
    return new Date(punchTime).toLocaleString();
  }
}