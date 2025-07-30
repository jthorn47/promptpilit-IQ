import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PenTool, AlertTriangle } from 'lucide-react';

interface ESignatureStepProps {
  onboardingRecord: any;
  onboardingCode: any;
  language: 'en' | 'es';
  onStepComplete: (data: any) => void;
  stepData: any;
  saving: boolean;
}

const ESignatureStep: React.FC<ESignatureStepProps> = ({
  onboardingRecord,
  onboardingCode,
  language,
  onStepComplete,
  stepData,
  saving
}) => {
  const [signature, setSignature] = useState('');
  const [agreed, setAgreed] = useState(false);

  const translations = {
    en: {
      title: 'Electronic Signature',
      subtitle: 'Complete your onboarding with your electronic signature',
      signaturePlaceholder: 'Type your full legal name as your signature',
      agreement: 'I acknowledge that I have reviewed and agree to all the documents and information provided during this onboarding process.',
      legalNotice: 'By typing my name below, I agree that this electronic signature has the same legal effect as a handwritten signature.',
      complete: 'Complete Onboarding',
      signatureLabel: 'Electronic Signature',
      required: 'Please provide your signature and agree to the terms'
    },
    es: {
      title: 'Firma Electrónica',
      subtitle: 'Complete su incorporación con su firma electrónica',
      signaturePlaceholder: 'Escriba su nombre legal completo como su firma',
      agreement: 'Reconozco que he revisado y acepto todos los documentos e información proporcionados durante este proceso de incorporación.',
      legalNotice: 'Al escribir mi nombre a continuación, acepto que esta firma electrónica tiene el mismo efecto legal que una firma manuscrita.',
      complete: 'Completar Incorporación',
      signatureLabel: 'Firma Electrónica',
      required: 'Proporcione su firma y acepte los términos'
    }
  };

  const t = translations[language];

  const handleComplete = () => {
    if (!signature.trim() || !agreed) {
      return;
    }

    const signatureData = {
      signature,
      agreed,
      signedAt: new Date().toISOString(),
      ipAddress: 'client-ip', // In a real app, you'd get this from the server
      userAgent: navigator.userAgent
    };

    onStepComplete(signatureData);
  };

  const canComplete = signature.trim() && agreed;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <PenTool className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">{t.legalNotice}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signature">{t.signatureLabel}</Label>
          <Input
            id="signature"
            type="text"
            placeholder={t.signaturePlaceholder}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="text-lg font-semibold"
          />
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreement"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <Label htmlFor="agreement" className="text-sm leading-relaxed">
            {t.agreement}
          </Label>
        </div>

        {!canComplete && (signature || agreed) && (
          <p className="text-sm text-destructive">{t.required}</p>
        )}

        <Button
          onClick={handleComplete}
          disabled={!canComplete}
          className="w-full"
          size="lg"
        >
          {t.complete}
        </Button>
      </Card>
    </div>
  );
};

export default ESignatureStep;