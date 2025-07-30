export type BrandIdentity = 'easeworks' | 'easelearn' | 'dual';

export interface BrandConfig {
  identity: BrandIdentity;
  emailDomain: string;
  logoUrl?: string;
  primaryColor?: string;
  displayName: string;
}

export const BRAND_OPTIONS: Array<{ value: BrandIdentity; label: string }> = [
  { value: 'easeworks', label: 'Easeworks' },
  { value: 'easelearn', label: 'Easelearn' },
  { value: 'dual', label: 'Dual (Both Brands)' }
];

export const getBrandConfig = (identity: BrandIdentity, context?: string): BrandConfig => {
  switch (identity) {
    case 'easeworks':
      return {
        identity,
        emailDomain: 'easeworks.com',
        displayName: 'Easeworks',
        primaryColor: '#2563eb'
      };
    case 'easelearn':
      return {
        identity,
        emailDomain: 'easelearn.com', 
        displayName: 'EaseLearn',
        primaryColor: '#059669'
      };
    case 'dual':
      // For dual brand, use context to determine which domain
      const isDualTraining = context === 'training' || context === 'lms' || context === 'learning';
      return {
        identity,
        emailDomain: isDualTraining ? 'easelearn.com' : 'easeworks.com',
        displayName: 'Dual Brand',
        primaryColor: '#7c3aed'
      };
    default:
      return {
        identity: 'easeworks',
        emailDomain: 'easeworks.com',
        displayName: 'Easeworks',
        primaryColor: '#2563eb'
      };
  }
};