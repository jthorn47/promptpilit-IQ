/**
 * Photo Capture Service
 * Handles photo upload and management for punch workflows
 */

import { supabase } from "@/integrations/supabase/client";

export interface PhotoUploadResult {
  success: boolean;
  photoUrl?: string;
  error?: string;
}

export interface CompanyPhotoSettings {
  requirePunchPhotos: boolean;
  photoVerificationEnabled: boolean;
  qualityThreshold: number;
}

export class PhotoCaptureService {
  /**
   * Upload punch photo to storage
   */
  static async uploadPunchPhoto(
    employeeId: string,
    photoBlob: Blob,
    punchType: 'clock_in' | 'clock_out'
  ): Promise<PhotoUploadResult> {
    try {
      const timestamp = new Date().toISOString();
      const fileName = `${employeeId}/${punchType}_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('punch-photos')
        .upload(fileName, photoBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Photo upload failed:', error);
        return {
          success: false,
          error: 'Failed to upload photo'
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('punch-photos')
        .getPublicUrl(fileName);

      return {
        success: true,
        photoUrl: urlData.publicUrl
      };
    } catch (error) {
      console.error('Photo upload error:', error);
      return {
        success: false,
        error: 'Upload failed'
      };
    }
  }

  /**
   * Get company photo requirements
   */
  static async getCompanyPhotoSettings(companyId: string): Promise<CompanyPhotoSettings> {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('require_punch_photos, photo_verification_enabled, punch_photo_quality_threshold')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error('Failed to get photo settings:', error);
        return {
          requirePunchPhotos: false,
          photoVerificationEnabled: false,
          qualityThreshold: 80
        };
      }

      return {
        requirePunchPhotos: data.require_punch_photos || false,
        photoVerificationEnabled: data.photo_verification_enabled || false,
        qualityThreshold: data.punch_photo_quality_threshold || 80
      };
    } catch (error) {
      console.error('Error fetching photo settings:', error);
      return {
        requirePunchPhotos: false,
        photoVerificationEnabled: false,
        qualityThreshold: 80
      };
    }
  }

  /**
   * Update company photo settings
   */
  static async updateCompanyPhotoSettings(
    companyId: string,
    settings: Partial<CompanyPhotoSettings>
  ): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (settings.requirePunchPhotos !== undefined) {
        updateData.require_punch_photos = settings.requirePunchPhotos;
      }
      if (settings.photoVerificationEnabled !== undefined) {
        updateData.photo_verification_enabled = settings.photoVerificationEnabled;
      }
      if (settings.qualityThreshold !== undefined) {
        updateData.punch_photo_quality_threshold = settings.qualityThreshold;
      }

      const { error } = await supabase
        .from('company_settings')
        .update(updateData)
        .eq('id', companyId);

      if (error) {
        console.error('Failed to update photo settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating photo settings:', error);
      return false;
    }
  }

  /**
   * Validate photo quality (basic client-side checks)
   */
  static async validatePhotoQuality(
    photoBlob: Blob,
    qualityThreshold: number = 80
  ): Promise<{ isValid: boolean; score: number; issues: string[] }> {
    return new Promise((resolve) => {
      const img = new Image();
      const issues: string[] = [];
      let score = 100;

      img.onload = () => {
        // Check resolution
        if (img.width < 200 || img.height < 200) {
          issues.push('Image resolution too low');
          score -= 30;
        }

        // Check file size (too small might indicate poor quality)
        if (photoBlob.size < 10000) {
          issues.push('Image file size too small');
          score -= 20;
        }

        // Check file size (too large might cause upload issues)
        if (photoBlob.size > 5000000) {
          issues.push('Image file size too large');
          score -= 10;
        }

        // Check aspect ratio (should be roughly portrait/square for faces)
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 2 || aspectRatio < 0.5) {
          issues.push('Unusual aspect ratio - may not show face clearly');
          score -= 15;
        }

        resolve({
          isValid: score >= qualityThreshold,
          score,
          issues
        });
      };

      img.onerror = () => {
        resolve({
          isValid: false,
          score: 0,
          issues: ['Failed to load image']
        });
      };

      img.src = URL.createObjectURL(photoBlob);
    });
  }

  /**
   * Get recent punch photos for employee
   */
  static async getEmployeePunchPhotos(
    employeeId: string,
    limit: number = 10
  ): Promise<{ url: string; timestamp: string; punchType: string }[]> {
    try {
      const { data, error } = await supabase
        .from('time_punches')
        .select('photo_url, punch_time, punch_type')
        .eq('employee_id', employeeId)
        .not('photo_url', 'is', null)
        .order('punch_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get punch photos:', error);
        return [];
      }

      return data.map(punch => ({
        url: punch.photo_url!,
        timestamp: punch.punch_time!,
        punchType: punch.punch_type!
      }));
    } catch (error) {
      console.error('Error fetching punch photos:', error);
      return [];
    }
  }

  /**
   * Delete punch photo
   */
  static async deletePunchPhoto(photoUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderPath = urlParts[urlParts.length - 2];
      const filePath = `${folderPath}/${fileName}`;

      const { error } = await supabase.storage
        .from('punch-photos')
        .remove([filePath]);

      if (error) {
        console.error('Failed to delete photo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }

  /**
   * Check if photo is required for punch
   */
  static async isPunchPhotoRequired(companyId: string): Promise<boolean> {
    const settings = await this.getCompanyPhotoSettings(companyId);
    return settings.requirePunchPhotos;
  }

  /**
   * Flag punch with missing photo
   */
  static async flagMissingPhoto(punchId: string): Promise<void> {
    try {
      await supabase
        .from('time_punches')
        .update({
          compliance_flags: ['missing_photo'],
          updated_at: new Date().toISOString()
        })
        .eq('id', punchId);
    } catch (error) {
      console.error('Failed to flag missing photo:', error);
    }
  }

  /**
   * Flag punch with poor quality photo
   */
  static async flagPoorQualityPhoto(punchId: string, issues: string[]): Promise<void> {
    try {
      await supabase
        .from('time_punches')
        .update({
          compliance_flags: [`poor_photo_quality: ${issues.join(', ')}`],
          updated_at: new Date().toISOString()
        })
        .eq('id', punchId);
    } catch (error) {
      console.error('Failed to flag poor quality photo:', error);
    }
  }
}