import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyInfo } from "./types";
import { sanitizeText, isValidEmail } from "@/utils/security";

interface CompanyInfoFormFieldsProps {
  formData: CompanyInfo;
  errors: Partial<CompanyInfo>;
  onUpdate: (updates: Partial<CompanyInfo>) => void;
}

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "500+ employees"
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail",
  "Construction",
  "Professional Services",
  "Education",
  "Non-profit",
  "Government",
  "Other"
];


export const CompanyInfoFormFields = ({ formData, errors, onUpdate }: CompanyInfoFormFieldsProps) => {
  const handleTextChange = (field: keyof CompanyInfo, value: string) => {
    const sanitized = sanitizeText(value);
    onUpdate({ [field]: sanitized });
  };

  const handleEmailChange = (value: string) => {
    const sanitized = sanitizeText(value);
    if (sanitized && !isValidEmail(sanitized) && sanitized.length > 0) {
      // Still update the field but let validation handle the error
    }
    onUpdate({ company_email: sanitized });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          value={formData.company_name}
          onChange={(e) => handleTextChange('company_name', e.target.value)}
          placeholder="Enter your company name"
          className={errors.company_name ? "border-destructive" : ""}
          maxLength={100}
        />
        {errors.company_name && (
          <p className="text-sm text-destructive mt-1">{errors.company_name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="company_email">Business Email</Label>
        <Input
          id="company_email"
          type="email"
          value={formData.company_email}
          onChange={(e) => handleEmailChange(e.target.value)}
          placeholder="your@company.com"
          className={errors.company_email ? "border-destructive" : ""}
          maxLength={254}
        />
        {errors.company_email && (
          <p className="text-sm text-destructive mt-1">{errors.company_email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="company_size">Company Size</Label>
        <Select
          value={formData.company_size}
          onValueChange={(value) => onUpdate({ company_size: value })}
        >
          <SelectTrigger id="company_size" className={errors.company_size ? "border-destructive" : ""}>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.company_size && (
          <p className="text-sm text-destructive mt-1">{errors.company_size}</p>
        )}
      </div>

      <div>
        <Label htmlFor="industry">Industry</Label>
        <Select
          value={formData.industry}
          onValueChange={(value) => onUpdate({ industry: value })}
        >
          <SelectTrigger id="industry" className={errors.industry ? "border-destructive" : ""}>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-sm text-destructive mt-1">{errors.industry}</p>
        )}
      </div>

    </div>
  );
};