import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CertificateModule } from "@/components/certificates/CertificateModule";
import { useToast } from "@/hooks/use-toast";

export default function CertificateViewer() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          training_modules(title, description, credit_value)
        `)
        .eq('id', certificateId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      
      setCertificate(data);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      toast({
        title: "Certificate Not Found",
        description: "The requested certificate could not be found or has been revoked.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
          <p className="text-muted-foreground">The requested certificate could not be found.</p>
        </div>
      </div>
    );
  }

  // Transform certificate data for the CertificateModule
  const certificateInitialData = {
    learnerName: certificate.learner_name,
    courseTitle: certificate.course_title,
    completionDate: new Date(certificate.completion_date),
    instructor: certificate.instructor_name || 'Jeffrey D. Thorn',
    certificateNumber: certificate.certificate_number,
    score: certificate.score,
  };

  return (
    <div className="min-h-screen bg-background">
      <CertificateModule 
        initialData={certificateInitialData}
        readonly={true}
      />
    </div>
  );
}