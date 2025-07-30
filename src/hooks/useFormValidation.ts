import { useState } from "react";
import { CompanyInfo } from "@/components/forms/types";

export const useCompanyInfoValidation = () => {
  const [errors, setErrors] = useState<Partial<CompanyInfo>>({});

  const validateForm = (formData: CompanyInfo) => {
    const newErrors: Partial<CompanyInfo> = {};
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }
    
    if (!formData.company_email.trim()) {
      newErrors.company_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.company_email)) {
      newErrors.company_email = "Please enter a valid email";
    }
    
    if (!formData.company_size) {
      newErrors.company_size = "Company size is required";
    }
    
    if (!formData.industry) {
      newErrors.industry = "Industry is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateForm, setErrors };
};