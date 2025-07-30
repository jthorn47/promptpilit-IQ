import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Upload, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface I9FormStepProps {
  onboardingRecord: any;
  onboardingCode: any;
  language: 'en' | 'es';
  onStepComplete: (data: any) => void;
  stepData: any;
  saving: boolean;
}

const I9FormStep: React.FC<I9FormStepProps> = ({
  onboardingRecord,
  onboardingCode,
  stepData,
  saving,
  language,
  onStepComplete
}) => {
  const [formData, setFormData] = useState({
    citizenship_status: '',
    alien_number: '',
    uscis_number: '',
    i94_number: '',
    passport_number: '',
    country_of_issuance: '',
    document_list_a: '',
    document_list_b: '',
    document_list_c: '',
    attestation_signed: false
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Form I-9 Employment Eligibility Verification',
      subtitle: 'Section 1: Employee Information and Attestation',
      citizenshipStatus: 'Citizenship/Immigration Status',
      citizen: 'A citizen of the United States',
      nonCitizenNational: 'A noncitizen national of the United States',
      permanentResident: 'A lawful permanent resident',
      authorized: 'An alien authorized to work',
      alienNumber: 'Alien Registration Number/USCIS Number',
      uscisNumber: 'USCIS Number',
      i94Number: 'Form I-94 Admission Number',
      passportNumber: 'Foreign Passport Number',
      countryOfIssuance: 'Country of Issuance',
      documentUpload: 'Upload Identity Documents',
      documentListA: 'List A Documents (Identity & Work Authorization)',
      documentListB: 'List B Documents (Identity)',
      documentListC: 'List C Documents (Work Authorization)',
      uploadHint: 'Upload clear photos or scans of your documents',
      save: 'Save I-9 Information',
      required: 'This field is required'
    },
    es: {
      title: 'Formulario I-9 Verificación de Elegibilidad de Empleo',
      subtitle: 'Sección 1: Información del Empleado y Declaración',
      citizenshipStatus: 'Estado de Ciudadanía/Inmigración',
      citizen: 'Un ciudadano de los Estados Unidos',
      nonCitizenNational: 'Un nacional no ciudadano de los Estados Unidos',
      permanentResident: 'Un residente permanente legal',
      authorized: 'Un extranjero autorizado para trabajar',
      alienNumber: 'Número de Registro de Extranjero/Número USCIS',
      uscisNumber: 'Número USCIS',
      i94Number: 'Número de Admisión Formulario I-94',
      passportNumber: 'Número de Pasaporte Extranjero',
      countryOfIssuance: 'País de Emisión',
      documentUpload: 'Subir Documentos de Identidad',
      documentListA: 'Documentos Lista A (Identidad y Autorización de Trabajo)',
      documentListB: 'Documentos Lista B (Identidad)',
      documentListC: 'Documentos Lista C (Autorización de Trabajo)',
      uploadHint: 'Suba fotos claras o escaneos de sus documentos',
      save: 'Guardar Información I-9',
      required: 'Este campo es obligatorio'
    }
  };

  const t = translations[language];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.citizenship_status) {
      toast({
        title: language === 'en' ? 'Validation Error' : 'Error de Validación',
        description: language === 'en' ? 'Please select your citizenship status' : 'Por favor seleccione su estado de ciudadanía',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Upload documents if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileName = `${onboardingRecord.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('onboarding-documents')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Save document record
          await supabase
            .from('onboarding_documents')
            .insert({
              employee_onboarding_id: onboardingRecord.id,
              document_type: 'id_document',
              file_name: file.name,
              file_path: fileName,
              file_size: file.size,
              mime_type: file.type
            });
        }
      }

      // Save form data
      const { error: formError } = await supabase
        .from('onboarding_form_data')
        .upsert({
          employee_onboarding_id: onboardingRecord.id,
          form_type: 'i9',
          form_data: formData,
          completed_at: new Date().toISOString()
        });

      if (formError) throw formError;

      // Update onboarding record
      const { error: recordError } = await supabase
        .from('employee_onboarding')
        .update({
          i9_section1_completed: true,
          current_step: Math.max(onboardingRecord.current_step, 4)
        })
        .eq('id', onboardingRecord.id);

      if (recordError) throw recordError;

      toast({
        title: language === 'en' ? 'I-9 Form Saved' : 'Formulario I-9 Guardado',
        description: language === 'en' ? 'Your I-9 information has been saved successfully' : 'Su información I-9 ha sido guardada exitosamente'
      });

      onStepComplete(formData);

    } catch (err) {
      console.error('Error saving I-9 form:', err);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' ? 'Failed to save I-9 form' : 'No se pudo guardar el formulario I-9',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Building className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Citizenship Status */}
        <Card className="p-6">
          <div>
            <Label>{t.citizenshipStatus} *</Label>
            <Select value={formData.citizenship_status} onValueChange={(value) => handleInputChange('citizenship_status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select citizenship status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="citizen">{t.citizen}</SelectItem>
                <SelectItem value="noncitizen_national">{t.nonCitizenNational}</SelectItem>
                <SelectItem value="permanent_resident">{t.permanentResident}</SelectItem>
                <SelectItem value="authorized_alien">{t.authorized}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional fields based on status */}
          {(formData.citizenship_status === 'permanent_resident' || formData.citizenship_status === 'authorized_alien') && (
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="alienNumber">{t.alienNumber}</Label>
                <Input
                  id="alienNumber"
                  value={formData.alien_number}
                  onChange={(e) => handleInputChange('alien_number', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="uscisNumber">{t.uscisNumber}</Label>
                <Input
                  id="uscisNumber"
                  value={formData.uscis_number}
                  onChange={(e) => handleInputChange('uscis_number', e.target.value)}
                />
              </div>
            </div>
          )}

          {formData.citizenship_status === 'authorized_alien' && (
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="i94Number">{t.i94Number}</Label>
                <Input
                  id="i94Number"
                  value={formData.i94_number}
                  onChange={(e) => handleInputChange('i94_number', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="passportNumber">{t.passportNumber}</Label>
                <Input
                  id="passportNumber"
                  value={formData.passport_number}
                  onChange={(e) => handleInputChange('passport_number', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="countryOfIssuance">{t.countryOfIssuance}</Label>
                <Input
                  id="countryOfIssuance"
                  value={formData.country_of_issuance}
                  onChange={(e) => handleInputChange('country_of_issuance', e.target.value)}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Document Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.documentUpload}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t.uploadHint}</p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentUpload" className="block mb-2">Upload Documents</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="documentUpload"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Label htmlFor="documentUpload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </Label>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Uploaded Files:</h4>
                <ul className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : null}
          {t.save}
        </Button>
      </form>
    </div>
  );
};

export default I9FormStep;