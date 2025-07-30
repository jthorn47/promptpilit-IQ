import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Check } from 'lucide-react';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  config?: any;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  onSwitchToLogin,
  isLoading,
  config
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    await onSubmit(email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Check your email
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            We've sent a password reset link to:
          </p>
          <p className="font-medium text-foreground">{email}</p>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          <Button
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="w-full"
          >
            Try different email
          </Button>
          
          <Button
            onClick={onSwitchToLogin}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
          >
            Back to Sign In
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Reset your password
          </h3>
          <p className="text-muted-foreground text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-xl transition-all duration-300"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Sending reset link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <button
            onClick={onSwitchToLogin}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </button>
        </div>

        {/* Help Text */}
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Need help?</strong> If you can't access your email or don't receive the reset link, 
            please contact our support team for assistance.
          </p>
        </div>
      </div>
    </motion.div>
  );
};