import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Globe, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DomainValidationStepProps {
  onValidated: (domain: string, companyName: string, hasDuplicates: boolean) => void;
  initialDomain?: string;
  validateCompany: (companyName: string, website?: string) => Promise<any>;
  isValidating: boolean;
}

export const DomainValidationStep = ({
  onValidated,
  initialDomain = '',
  validateCompany,
  isValidating
}: DomainValidationStepProps) => {
  const [domain, setDomain] = useState(initialDomain);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [hasValidated, setHasValidated] = useState(false);

  // Debounced validation
  useEffect(() => {
    if (!domain || domain.length < 3) {
      setValidationResult(null);
      setError('');
      setHasValidated(false);
      return;
    }

    const timer = setTimeout(async () => {
      await handleValidation();
    }, 800);

    return () => clearTimeout(timer);
  }, [domain]);

  const extractCompanyName = (websiteUrl: string): string => {
    try {
      // Remove protocol and www
      let cleaned = websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
      
      // Get domain part (before first slash)
      cleaned = cleaned.split('/')[0];
      
      // Get the main domain (remove subdomain)
      const parts = cleaned.split('.');
      if (parts.length >= 2) {
        // Take the second-to-last part as company name
        const companyPart = parts[parts.length - 2];
        
        // Capitalize first letter
        return companyPart.charAt(0).toUpperCase() + companyPart.slice(1);
      }
      
      return cleaned;
    } catch {
      return websiteUrl;
    }
  };

  const normalizeDomain = (input: string): string => {
    if (!input) return '';
    
    // If it looks like an email, extract domain
    if (input.includes('@')) {
      const domain = input.split('@')[1];
      return `https://${domain}`;
    }
    
    // Add protocol if missing
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      return `https://${input}`;
    }
    
    return input;
  };

  const handleValidation = async () => {
    if (!domain) return;

    setError('');
    setHasValidated(false);

    try {
      const normalizedDomain = normalizeDomain(domain);
      const extractedName = extractCompanyName(normalizedDomain);
      
      const result = await validateCompany(extractedName, normalizedDomain);
      setValidationResult(result);
      setHasValidated(true);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to validate domain. Please check the URL and try again.');
      setHasValidated(true);
    }
  };

  const handleContinue = () => {
    if (!validationResult) return;
    
    const normalizedDomain = normalizeDomain(domain);
    const extractedName = extractCompanyName(normalizedDomain);
    const hasDuplicates = validationResult.duplicates && validationResult.duplicates.length > 0;
    
    onValidated(normalizedDomain, extractedName, hasDuplicates);
  };

  const handleSkip = () => {
    const extractedName = domain ? extractCompanyName(domain) : 'New Company';
    onValidated(domain, extractedName, false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domain">Company Website or Email</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://company.com or contact@company.com"
              className="pl-10"
              autoFocus
            />
            {isValidating && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Enter the company's website or email to check for duplicates and extract company information.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {validationResult && hasValidated && !error && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {validationResult.duplicates && validationResult.duplicates.length > 0 ? (
                <span className="text-amber-700">
                  Found {validationResult.duplicates.length} potential duplicate(s). 
                  Extracted company name: <strong>{extractCompanyName(normalizeDomain(domain))}</strong>
                </span>
              ) : (
                <span className="text-green-700">
                  No duplicates found. 
                  Extracted company name: <strong>{extractCompanyName(normalizeDomain(domain))}</strong>
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handleSkip}
        >
          Skip Validation
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={!hasValidated || !!error || !domain}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};