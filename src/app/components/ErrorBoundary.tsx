import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Production-ready Error Boundary Component
 * 
 * Catches React errors in child components and displays a user-friendly fallback UI.
 * Complies with WCAG 2.1 AA accessibility standards.
 * 
 * Features:
 * - Graceful error handling
 * - User-friendly error messages
 * - Recovery actions (reload/home)
 * - Accessible error display
 * - Production-safe (no sensitive info leaked)
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    
    // Production: Send error to monitoring service
    // logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertTriangle 
                    className="h-12 w-12 text-red-600" 
                    aria-hidden="true"
                  />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-900">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-base mt-2">
                We encountered an unexpected error. Don't worry, your data is safe.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* User-friendly error message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>What happened?</strong> The application encountered a problem and couldn't continue.
                </p>
                
                {/* Show error details in development only */}
                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-red-900 hover:text-red-700">
                      Technical Details (Development Only)
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded border border-red-200 overflow-auto">
                      <pre className="text-xs text-red-800 whitespace-pre-wrap break-words">
                        {this.state.error.toString()}
                        {this.state.errorInfo && (
                          <>
                            {"\n\n"}
                            {this.state.errorInfo.componentStack}
                          </>
                        )}
                      </pre>
                    </div>
                  </details>
                )}
              </div>

              {/* Recovery actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  What can you do?
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={this.handleReload}
                    className="flex-1 gap-2"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Reload Page
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    className="flex-1 gap-2"
                    variant="outline"
                  >
                    <Home className="h-4 w-4" aria-hidden="true" />
                    Go to Home
                  </Button>
                </div>
              </div>

              {/* Help text */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  If this problem persists, please contact technical support at{" "}
                  <a 
                    href="mailto:support@unc.edu.ph" 
                    className="text-[#7A1E1E] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7A1E1E] rounded"
                  >
                    support@unc.edu.ph
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to use error boundary programmatically
 * 
 * Usage:
 * ```tsx
 * const throwError = useErrorHandler();
 * 
 * try {
 *   // risky operation
 * } catch (error) {
 *   throwError(error);
 * }
 * ```
 */
export function useErrorHandler() {
  const [, setError] = React.useState<Error | null>(null);
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}