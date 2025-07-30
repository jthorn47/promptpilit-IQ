import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onOAuthSignIn?: (provider: string) => Promise<void>;
  onSwitchToSignup?: () => void;
  onSwitchToForgotPassword?: () => void;
  isLoading: boolean;
  config?: any;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onOAuthSignIn,
  onSwitchToSignup,
  onSwitchToForgotPassword,
  isLoading,
  config
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    await onSubmit(email, password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:border-primary"
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
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-border/50 text-primary focus:ring-primary"
              disabled={isLoading}
            />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          
          {onSwitchToForgotPassword && (
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-xl transition-all duration-300"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Signing in...
            </div>
          ) : (
            'Sign In'
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
                <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOAuthSignIn('google')}
                className="h-12 border-border/50 bg-background/50 hover:bg-background text-foreground"
                disabled={isLoading}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>
            </div>
          </div>
        )}

        {/* Switch to Signup */}
        {onSwitchToSignup && (
          <div className="text-center">
            <span className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
                disabled={isLoading}
              >
                Sign up
              </button>
            </span>
          </div>
        )}
      </form>
    </motion.div>
  );
};