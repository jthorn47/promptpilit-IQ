import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class AccessibleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // Announce error to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('role', 'alert');
    announcement.className = 'sr-only';
    announcement.textContent = `An error has occurred: ${error.message}. Please try refreshing the page or contact support if the problem persists.`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 5000);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: ''
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error;
      const errorMessage = error?.message || 'An unexpected error occurred';
      const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network');
      
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4 bg-background"
          role="main"
          aria-labelledby="error-title"
        >
          <div className="max-w-md w-full space-y-6">
            <Alert 
              className="border-danger bg-danger-muted"
              role="alert"
              aria-describedby="error-description"
            >
              <AlertTriangle 
                className="h-4 w-4" 
                aria-hidden="true"
              />
              <AlertTitle id="error-title" className="text-danger-foreground">
                Something went wrong
              </AlertTitle>
              <AlertDescription 
                id="error-description" 
                className="text-danger-foreground mt-2"
              >
                {isNetworkError ? (
                  <>
                    It looks like there's a network connection issue. Please check your internet connection and try again.
                  </>
                ) : (
                  <>
                    {errorMessage}. We apologize for the inconvenience.
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h2 className="sr-only">Error Recovery Options</h2>
              
              <Button
                onClick={this.handleRetry}
                className="w-full"
                size="lg"
                aria-describedby="retry-description"
              >
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
                size="lg"
                aria-describedby="home-description"
              >
                <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                Go to Homepage
              </Button>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              <p>
                Error ID: <code className="font-mono text-xs">{this.state.errorId}</code>
              </p>
              <p className="mt-2">
                If this problem continues, please contact support with the error ID above.
              </p>
            </div>

            {/* Hidden descriptions for screen readers */}
            <div className="sr-only">
              <div id="retry-description">
                Reload the current page and attempt to recover from the error
              </div>
              <div id="home-description">
                Navigate back to the main homepage
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}