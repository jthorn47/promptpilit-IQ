import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Building, Chrome } from 'lucide-react';

interface SignupFormProps {
  onSubmit: (email: string, password: string, metadata?: any) => Promise<void>;
  onOAuthSignIn?: (provider: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  config?: any;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  onOAuthSignIn,
  onSwitchToLogin,
  isLoading,
  config
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calculate password strength
    if (field === 'password') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.firstName) return;
    if (formData.password !== formData.confirmPassword) return;
    if (!acceptTerms) return;
    
    const metadata = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      company_name: formData.companyName,
    };
    
    await onSubmit(formData.email, formData.password, metadata);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-destructive';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.firstName &&
      formData.password === formData.confirmPassword &&
      passwordStrength >= 3 &&
      acceptTerms
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
              First Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Doe"
              className="h-11 bg-background/50 border-border/50 focus:border-primary"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@company.com"
              className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Company Field */}
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
            Company Name
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Your Company"
              className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password *
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Create a strong password"
              className="pl-10 pr-10 h-11 bg-background/50 border-border/50 focus:border-primary"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Password strength:</span>
                <span className={`font-medium ${passwordStrength >= 3 ? 'text-green-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-destructive'}`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="w-full bg-border/50 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm Password *
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
              required
              disabled={isLoading}
            />
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        {/* Terms Acceptance */}
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 rounded border-border/50 text-primary focus:ring-primary"
            disabled={isLoading}
          />
          <label htmlFor="acceptTerms" className="text-xs text-muted-foreground leading-relaxed">
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:text-primary/80 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:text-primary/80 underline">
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-xl transition-all duration-300"
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </Button>

        {/* OAuth Providers */}
        {onOAuthSignIn && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Or sign up with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => onOAuthSignIn('google')}
              className="w-full h-11 border-border/50 bg-background/50 hover:bg-background text-foreground"
              disabled={isLoading}
            >
              <Chrome className="h-4 w-4 mr-2" />
              Continue with Google
            </Button>
          </div>
        )}

        {/* Switch to Login */}
        <div className="text-center">
          <span className="text-muted-foreground text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
              disabled={isLoading}
            >
              Sign in
            </button>
          </span>
        </div>
      </form>
    </motion.div>
  );
};