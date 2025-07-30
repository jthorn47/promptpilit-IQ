import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
          <Card className="w-full max-w-md mx-auto border-destructive/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="p-4 bg-muted rounded-lg text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleRefresh} variant="outline" className="w-full">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                <Button onClick={this.handleGoHome} variant="ghost" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
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

// Simple functional error boundary for specific sections
export const SectionErrorBoundary: React.FC<{ children: ReactNode; title?: string }> = ({ 
  children, 
  title = "Section Error" 
}) => {
  return (
    <ErrorBoundary
      fallback={
        <Card className="border-destructive/20">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <h3 className="font-semibold text-destructive mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">
              This section failed to load. Please refresh the page.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              <RefreshCcw className="h-3 w-3 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
};