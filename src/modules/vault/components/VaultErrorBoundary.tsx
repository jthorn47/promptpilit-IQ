import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class VaultErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Vault Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/halo/vault';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                An error occurred while loading the Vault module. This has been logged and will be investigated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Error Details (Development Only):</h4>
                  <pre className="text-sm text-red-600 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Vault Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const VaultErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({ 
  error, 
  retry 
}) => (
  <Card className="max-w-md mx-auto">
    <CardHeader className="text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
      <CardTitle className="text-lg">Unable to Load</CardTitle>
      <CardDescription>
        {error?.message || 'This component failed to load properly.'}
      </CardDescription>
    </CardHeader>
    {retry && (
      <CardContent className="text-center">
        <Button onClick={retry} size="sm" className="flex items-center gap-2 mx-auto">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    )}
  </Card>
);