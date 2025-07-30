import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateCertificateNumber,
  generateVerificationToken,
  createCertificate,
  generateCertificateOnCompletion,
  type CertificateData,
} from '../certificateService';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client');

describe('Certificate Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCertificateNumber', () => {
    it('should generate certificate number with correct format', () => {
      const certNumber = generateCertificateNumber();
      expect(certNumber).toMatch(/^ELN-\d{8}-[A-Z0-9]{4}$/);
    });

    it('should generate unique certificate numbers', () => {
      const cert1 = generateCertificateNumber();
      const cert2 = generateCertificateNumber();
      expect(cert1).not.toBe(cert2);
    });
  });

  describe('generateVerificationToken', () => {
    it('should generate a verification token', () => {
      const token = generateVerificationToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });

    it('should generate unique tokens', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('createCertificate', () => {
    const mockCertificateData: CertificateData = {
      id: 'cert-123',
      user_id: 'user-123',
      employee_id: 'emp-123',
      training_module_id: 'module-123',
      course_title: 'Safety Training',
      learner_name: 'John Doe',
      instructor_name: 'Jeffrey Thorn',
      completion_date: '2024-01-01T00:00:00Z',
      certificate_number: 'CERT-123',
      qr_code_data: 'https://easelearn.com/verify?id=CERT-123',
      verification_token: 'token-123',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should create certificate successfully', async () => {
      const mockCertificate = { id: 'cert-123' };
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCertificate,
              error: null,
            }),
          }),
        }),
      });

      const result = await createCertificate(mockCertificateData);
      expect(result).toBe('cert-123');
    });

    it('should handle database errors', async () => {
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      });

      const result = await createCertificate(mockCertificateData);
      expect(result).toBe(null);
    });

    it('should include legal notice in certificate data', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'cert-123' },
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      await createCertificate(mockCertificateData);

      const insertCall = mockInsert.mock.calls[0][0][0];
      expect(insertCall.certificate_data.legal_notice).toContain('California Labor Code §6401.9');
    });
  });

  describe('generateCertificateOnCompletion', () => {
    it('should not create duplicate certificates', async () => {
      // Mock existing certificate
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'existing-cert' },
              error: null,
            }),
          }),
        }),
      });

      const result = await generateCertificateOnCompletion('comp-123', 'emp-123', 'module-123');
      expect(result).toBe(true);
    });

    it('should generate certificate for completed training', async () => {
      // Mock no existing certificate
      (supabase.from as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        })
        // Mock employee data
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { first_name: 'John', last_name: 'Doe' },
                error: null,
              }),
            }),
          }),
        })
        // Mock module data
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { title: 'Safety Training', estimated_duration: 60 },
                error: null,
              }),
            }),
          }),
        })
        // Mock completion data
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { completed_at: '2024-01-01T00:00:00Z', status: 'completed' },
                error: null,
              }),
            }),
          }),
        })
        // Mock certificate creation
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'new-cert-123' },
                error: null,
              }),
            }),
          }),
        });

      // Mock Promise.all behavior
      global.Promise.all = vi.fn().mockResolvedValue([
        { data: { first_name: 'John', last_name: 'Doe' }, error: null },
        { data: { title: 'Safety Training', estimated_duration: 60 }, error: null },
        { data: { completed_at: '2024-01-01T00:00:00Z', status: 'completed' }, error: null },
      ]);

      const result = await generateCertificateOnCompletion('comp-123', 'emp-123', 'module-123');
      expect(result).toBe(true);
    });

    it('should handle missing employee data', async () => {
      // Mock no existing certificate
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      // Mock Promise.all with error
      global.Promise.all = vi.fn().mockResolvedValue([
        { data: null, error: new Error('Employee not found') },
        { data: null, error: null },
        { data: null, error: null },
      ]);

      const result = await generateCertificateOnCompletion('comp-123', 'emp-123', 'module-123');
      expect(result).toBe(false);
    });
  });
});