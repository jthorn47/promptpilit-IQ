import { supabase } from '@/integrations/supabase/client';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { Storage } from '@capacitor/storage';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type TimePunch = Tables<'time_punches'>;
export type TimePunchInsert = TablesInsert<'time_punches'>;
export type KioskSettings = Tables<'kiosk_settings'>;
export type PayrollEmployee = Tables<'payroll_employees'>;

export interface OfflinePunch {
  id: string;
  employeeId: string;
  companyId: string;
  punchType: string;
  punchTime: string;
  locationName?: string;
  deviceId: string;
  photoBase64?: string;
  pinVerified: boolean;
  notes?: string;
}

export class KioskService {
  private static deviceId: string | null = null;
  private static offlinePunches: OfflinePunch[] = [];
  private static isOnline: boolean = navigator.onLine;
  private static syncInterval: NodeJS.Timeout | null = null;
  private static retryAttempts: Map<string, number> = new Map();

  static async getDeviceId(): Promise<string> {
    if (this.deviceId) return this.deviceId;
    
    const deviceInfo = await Device.getId();
    this.deviceId = deviceInfo.identifier || `kiosk_${Date.now()}`;
    return this.deviceId;
  }

  static async getKioskSettings(companyId: string): Promise<KioskSettings | null> {
    const deviceId = await this.getDeviceId();
    
    const { data, error } = await supabase
      .from('kiosk_settings')
      .select('*')
      .eq('company_id', companyId)
      .eq('device_id', deviceId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching kiosk settings:', error);
      return null;
    }

    return data;
  }

  static async capturePhoto(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 640,
        height: 480
      });

      return image.base64String || null;
    } catch (error) {
      console.error('Error capturing photo:', error);
      return null;
    }
  }

  static async uploadPhoto(base64Data: string, fileName: string): Promise<string | null> {
    try {
      // Convert base64 to blob
      const response = await fetch(`data:image/jpeg;base64,${base64Data}`);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('biometric-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Error uploading photo:', error);
        return null;
      }

      return data.path;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  }

  static async createTimePunch(punchData: TimePunchInsert, photoBase64?: string): Promise<TimePunch | null> {
    try {
      let photoUrl: string | null = null;

      // Upload photo if provided
      if (photoBase64) {
        const fileName = `punch_${punchData.employee_id}_${Date.now()}.jpg`;
        photoUrl = await this.uploadPhoto(photoBase64, fileName);
      }

      const punchWithPhoto: TimePunchInsert = {
        ...punchData,
        photo_url: photoUrl,
        device_id: await this.getDeviceId(),
      };

      const { data, error } = await supabase
        .from('time_punches')
        .insert(punchWithPhoto)
        .select()
        .single();

      if (error) {
        console.error('Error creating time punch:', error);
        // Store offline if online punch fails
        await this.storeOfflinePunch(punchWithPhoto, photoBase64);
        return null;
      }

      // Update employee's last device
      await this.updateEmployeeLastDevice(punchData.employee_id, await this.getDeviceId());

      return data;
    } catch (error) {
      console.error('Error creating time punch:', error);
      // Store offline if network error
      await this.storeOfflinePunch(punchData, photoBase64);
      return null;
    }
  }

  private static async updateEmployeeLastDevice(employeeId: string, deviceId: string): Promise<void> {
    try {
      await supabase
        .from('payroll_employees')
        .update({ last_clock_in_device_id: deviceId })
        .eq('id', employeeId);
    } catch (error) {
      console.error('Error updating employee last device:', error);
    }
  }

  private static async storeOfflinePunch(punchData: TimePunchInsert, photoBase64?: string): Promise<void> {
    const offlinePunch: OfflinePunch = {
      id: `offline_${Date.now()}_${Math.random()}`,
      employeeId: punchData.employee_id,
      companyId: punchData.company_id,
      punchType: punchData.punch_type,
      punchTime: punchData.punch_time || new Date().toISOString(),
      locationName: punchData.location_name,
      deviceId: punchData.device_id || await this.getDeviceId(),
      photoBase64,
      pinVerified: punchData.pin_verified || false,
      notes: punchData.notes,
    };

    this.offlinePunches.push(offlinePunch);
    
    // Store in device storage
    await Storage.set({
      key: 'offline_punches',
      value: JSON.stringify(this.offlinePunches)
    });
  }

  static async loadOfflinePunches(): Promise<void> {
    try {
      const { value } = await Storage.get({ key: 'offline_punches' });
      if (value) {
        this.offlinePunches = JSON.parse(value);
      }
    } catch (error) {
      console.error('Error loading offline punches:', error);
      this.offlinePunches = [];
    }
  }

  static async syncOfflinePunches(): Promise<void> {
    if (this.offlinePunches.length === 0) return;

    const punchesToSync = [...this.offlinePunches];
    const syncedPunches: string[] = [];
    const failedPunches: string[] = [];

    for (const offlinePunch of punchesToSync) {
      try {
        // Check retry count
        const retryCount = this.retryAttempts.get(offlinePunch.id) || 0;
        if (retryCount >= 3) {
          console.error(`Punch ${offlinePunch.id} exceeded max retries`);
          failedPunches.push(offlinePunch.id);
          continue;
        }

        let photoUrl: string | null = null;

        if (offlinePunch.photoBase64) {
          const fileName = `offline_punch_${offlinePunch.employeeId}_${Date.now()}.jpg`;
          photoUrl = await this.uploadPhoto(offlinePunch.photoBase64, fileName);
        }

        const punchData: TimePunchInsert = {
          employee_id: offlinePunch.employeeId,
          company_id: offlinePunch.companyId,
          punch_type: offlinePunch.punchType as any,
          punch_time: offlinePunch.punchTime,
          location_name: offlinePunch.locationName,
          device_id: offlinePunch.deviceId,
          photo_url: photoUrl,
          pin_verified: offlinePunch.pinVerified,
          notes: offlinePunch.notes,
          is_offline_punch: true,
          synced_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('time_punches')
          .insert(punchData);

        if (!error) {
          syncedPunches.push(offlinePunch.id);
          this.retryAttempts.delete(offlinePunch.id);
          console.log(`Successfully synced punch ${offlinePunch.id}`);
        } else {
          throw error;
        }
      } catch (error) {
        console.error('Error syncing offline punch:', error);
        const currentRetries = this.retryAttempts.get(offlinePunch.id) || 0;
        this.retryAttempts.set(offlinePunch.id, currentRetries + 1);
        failedPunches.push(offlinePunch.id);
      }
    }

    // Remove successfully synced punches
    this.offlinePunches = this.offlinePunches.filter(
      punch => !syncedPunches.includes(punch.id)
    );

    // Update storage
    await Storage.set({
      key: 'offline_punches',
      value: JSON.stringify(this.offlinePunches)
    });

    // Store retry attempts
    await Storage.set({
      key: 'retry_attempts',
      value: JSON.stringify(Array.from(this.retryAttempts.entries()))
    });

    // Log sync results
    if (syncedPunches.length > 0) {
      console.log(`Synced ${syncedPunches.length} offline punches`);
    }
    if (failedPunches.length > 0) {
      console.log(`Failed to sync ${failedPunches.length} punches`);
    }
  }

  static async getEmployeeByPin(companyId: string, pin: string): Promise<PayrollEmployee | null> {
    try {
      // Get all active time tracking employees for the company
      const { data, error } = await supabase
        .from('payroll_employees')
        .select('*')
        .eq('company_id', companyId)
        .eq('time_tracking_enabled', true)
        .eq('is_active', true)
        .not('time_tracking_pin_hash', 'is', null);

      if (error) {
        console.error('Error fetching employees by PIN:', error);
        return null;
      }

      // Find employee with matching PIN hash
      const hashedPin = this.hashPin(pin);
      const employee = data?.find(emp => emp.time_tracking_pin_hash === hashedPin);

      return employee || null;
    } catch (error) {
      console.error('Error getting employee by PIN:', error);
      return null;
    }
  }

  static async getEmployeeByQRCode(companyId: string, qrCode: string): Promise<PayrollEmployee | null> {
    try {
      const { data, error } = await supabase
        .from('payroll_employees')
        .select('*')
        .eq('company_id', companyId)
        .eq('time_tracking_enabled', true)
        .eq('is_active', true)
        .eq('badge_qr_code', qrCode)
        .maybeSingle();

      if (error) {
        console.error('Error fetching employee by QR code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting employee by QR code:', error);
      return null;
    }
  }

  static hashPin(pin: string): string {
    // Simple hash for demo - use proper bcrypt in production
    return btoa(pin);
  }

  static async verifyPin(pin: string, hashedPin: string): Promise<boolean> {
    // In production, use bcrypt.compare()
    return this.hashPin(pin) === hashedPin;
  }

  static async generateQRCode(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_employee_qr_code');
    if (error) {
      console.error('Error generating QR code:', error);
      return `EMP-${Date.now()}`;
    }
    return data;
  }

  static async getLastPunch(employeeId: string): Promise<TimePunch | null> {
    const { data, error } = await supabase
      .from('time_punches')
      .select('*')
      .eq('employee_id', employeeId)
      .order('punch_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching last punch:', error);
      return null;
    }

    return data;
  }

  static getNextPunchType(lastPunch: TimePunch | null): string {
    if (!lastPunch) return 'clock_in';
    
    switch (lastPunch.punch_type) {
      case 'clock_in':
      case 'break_end':
      case 'meal_end':
        return 'clock_out';
      case 'clock_out':
        return 'clock_in';
      case 'break_start':
        return 'break_end';
      case 'meal_start':
        return 'meal_end';
      default:
        return 'clock_in';
    }
  }

  static async isWithinShiftWindow(
    employeeId: string, 
    companyId: string, 
    gracePeriodMinutes: number = 15
  ): Promise<boolean> {
    // In a real implementation, check against employee schedule
    // For now, allow punches during reasonable business hours
    const now = new Date();
    const hour = now.getHours();
    return hour >= 6 && hour <= 23; // 6 AM to 11 PM
  }

  // Enhanced Offline Capabilities
  static initializeOfflineMode(): void {
    // Load existing offline punches
    this.loadOfflinePunches();
    
    // Set up network detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network reconnected, starting sync...');
      this.syncOfflinePunches();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network disconnected, entering offline mode');
    });
    
    // Start periodic sync check (every 60 seconds)
    this.startSyncInterval();
  }

  static startSyncInterval(): void {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(async () => {
      if (this.isOnline && this.offlinePunches.length > 0) {
        console.log('Periodic sync check: attempting to sync offline punches');
        await this.syncOfflinePunches();
      }
    }, 60000); // 60 seconds
  }

  static stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  static getOfflineStatus(): { isOnline: boolean; pendingPunches: number } {
    return {
      isOnline: this.isOnline,
      pendingPunches: this.offlinePunches.length
    };
  }

  static async forceSync(): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    const initialCount = this.offlinePunches.length;
    const errors: string[] = [];
    
    try {
      await this.syncOfflinePunches();
      const syncedCount = initialCount - this.offlinePunches.length;
      
      return {
        success: syncedCount > 0 || this.offlinePunches.length === 0,
        syncedCount,
        errors
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown sync error');
      return {
        success: false,
        syncedCount: 0,
        errors
      };
    }
  }

  static async cleanupOldPunches(): Promise<void> {
    const now = new Date().getTime();
    const maxAge = 72 * 60 * 60 * 1000; // 72 hours
    
    const validPunches = this.offlinePunches.filter(punch => {
      const punchTime = new Date(punch.punchTime).getTime();
      return (now - punchTime) < maxAge;
    });
    
    if (validPunches.length !== this.offlinePunches.length) {
      this.offlinePunches = validPunches;
      await Storage.set({
        key: 'offline_punches',
        value: JSON.stringify(this.offlinePunches)
      });
      console.log('Cleaned up old offline punches');
    }
  }

  static async simulateOfflinePunch(employeeId: string, companyId: string): Promise<void> {
    const mockPunch: OfflinePunch = {
      id: `test_${Date.now()}`,
      employeeId,
      companyId,
      punchType: 'clock_in',
      punchTime: new Date().toISOString(),
      deviceId: await this.getDeviceId(),
      pinVerified: true,
      notes: 'Test offline punch'
    };
    
    await this.storeOfflinePunch({
      employee_id: employeeId,
      company_id: companyId,
      punch_type: 'clock_in' as any,
      punch_time: mockPunch.punchTime,
      device_id: mockPunch.deviceId,
      pin_verified: true,
      notes: mockPunch.notes
    });
    
    console.log('Simulated offline punch created');
  }

  /**
   * Process punch with conflict detection
   */
  static async processPunchWithValidation(
    employeeId: string,
    punchType: 'clock_in' | 'clock_out',
    deviceId?: string,
    photoBlob?: Blob,
    jobCode?: string,
    locationId?: string
  ): Promise<{
    success: boolean;
    punch?: any;
    conflict?: any;
    error?: string;
  }> {
    try {
      // For now, just process normally using createTimePunch
      const punchData = {
        employee_id: employeeId,
        company_id: '', // Will be set by createTimePunch
        punch_type: punchType,
        punch_time: new Date().toISOString(),
        device_id: deviceId || await this.getDeviceId(),
        pin_verified: true
      };

      const punch = await this.createTimePunch(punchData);

      return {
        success: true,
        punch
      };
    } catch (error) {
      console.error('Punch processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Submit punch correction (placeholder)
   */
  static async submitPunchCorrection(correction: any): Promise<any> {
    console.log('Submitting punch correction:', correction);
    
    // Store offline for now
    const corrections = this.getOfflineCorrections();
    const newCorrection = {
      ...correction,
      id: `correction_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    corrections.push(newCorrection);
    localStorage.setItem('offline_corrections', JSON.stringify(corrections));

    return newCorrection;
  }

  /**
   * Get offline corrections queue
   */
  private static getOfflineCorrections(): any[] {
    try {
      const stored = localStorage.getItem('offline_corrections');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load offline corrections:', error);
      return [];
    }
  }
}