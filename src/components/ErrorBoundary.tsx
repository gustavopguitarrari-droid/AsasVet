"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: _, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-destructive-foreground text-destructive p-4 text-center">
          <AlertTriangle className="h-16 w-16 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Ocorreu um erro inesperado!</h1>
          <p className="text-lg mb-4">
            Algo deu errado ao carregar esta parte do aplicativo.
          </p>
          {this.state.error && (
            <details className="text-sm text-destructive/80 max-w-lg whitespace-pre-wrap text-left p-4 bg-destructive/10 rounded-md">
              <summary className="font-semibold cursor-pointer">Detalhes do Erro</summary>
              <p className="mt-2">{this.state.error.message}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-xs overflow-auto">
                  <code>{this.state.errorInfo.componentStack}</code>
                </pre>
              )}
            </details>
          )}
          <Button onClick={() => window.location.reload()} className="mt-6 bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Recarregar Página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;