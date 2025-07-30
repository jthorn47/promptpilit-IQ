import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCertificateGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const generateCertificate = async (assignmentId: string, employeeId: string, moduleId: string) => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: {
          assignmentId,
          employeeId,
          moduleId,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Certificate Generated!",
          description: "Your certificate has been created successfully.",
        });
        return data.certificate;
      } else {
        throw new Error(data?.error || 'Failed to generate certificate');
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast({
        title: "Certificate Generation Failed",
        description: error.message || "Unable to generate certificate at this time.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyCertificate = async (certificateNumber: string) => {
    try {
      setIsVerifying(true);
      
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_number', certificateNumber)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        throw new Error('Certificate not found or invalid');
      }

      return data;
    } catch (error) {
      console.error('Certificate verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Certificate not found or invalid.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    generateCertificate,
    verifyCertificate,
    isGenerating,
    isVerifying
  };
};
