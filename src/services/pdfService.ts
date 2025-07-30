import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDFFromHTML = async (elementId: string, filename: string): Promise<Blob | null> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return null;
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Return as blob for upload
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};

export const uploadCertificatePDF = async (
  pdfBlob: Blob, 
  certificateId: string
): Promise<string | null> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const filename = `certificate-${certificateId}-${Date.now()}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('training-files')
      .upload(`certificates/${filename}`, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('training-files')
      .getPublicUrl(`certificates/${filename}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadCertificatePDF:', error);
    return null;
  }
};