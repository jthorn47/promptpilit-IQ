
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug, Copy } from 'lucide-react';
import { errorReporter } from '@/services/errorReporting';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'section' | 'component';
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  retryCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report error with context
    const errorId = errorReporter.reportError(error, {
      component: this.props.context || 'ErrorBoundary',
      action: 'component_error',
      route: window.location.pathname
    }, this.props.level === 'page' ? 'high' : 'medium');

    this.setState({ errorId });

    // Enhanced logging for debugging
    console.error('🚨 Enhanced Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      errorInfo,
      context: this.props.context,
      level: this.props.level,
      route: window.location.pathname,
      props: this.props
    });
    
    // Also log to make sure we see it
    console.error('Error details:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prev => ({
        hasError: false,
        error: undefined,
        errorId: undefined,
        retryCount: prev.retryCount + 1
      }));
    }
  };

  private copyErrorDetails = () => {
    const errorText = [
      `Error ID: ${this.state.errorId}`,
      `Component: ${this.props.context || 'Unknown'}`,
      `Route: ${window.location.pathname}`,
      `Message: ${this.state.error?.message}`,
      `Stack: ${this.state.error?.stack}`
    ].join('\n');

    navigator.clipboard.writeText(errorText).then(() => {
      console.log('Error details copied to clipboard');
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const isPageLevel = this.props.level === 'page';

      if (!isPageLevel) {
        // Component/section level error - minimal UI
        return (
          <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Component Error</AlertTitle>
            <AlertDescription className="mt-2">
              {this.props.context || 'This component'} failed to load.
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry ({this.maxRetries - this.state.retryCount} left)
                </Button>
              )}
            </AlertDescription>
          </Alert>
        );
      }

      // Page level error - full UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {this.props.context 
                  ? `The ${this.props.context} component encountered an error.`
                  : 'An unexpected error occurred.'
                } We apologize for the inconvenience.
              </p>

              {this.state.errorId && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Error ID:</p>
                  <code className="text-xs">{this.state.errorId}</code>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </Button>
                )}
                
                <Button
                  onClick={this.copyErrorDetails}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Error Details
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="ghost"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    <Bug className="inline h-4 w-4 mr-1" />
                    Developer Details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
