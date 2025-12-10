"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, isChecked, error, isConnecting } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isChecked && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isChecked, isLoading]);

  useEffect(() => {
    if (isChecked && !isAuthenticated && !error) {
      router.push("/");
    }
  }, [isAuthenticated, isChecked, router, error]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    dispatch(fetchCurrentUser());
  };

  // Show loading while checking auth
  if (!isChecked || isLoading) {
    const isServerStarting = error && (error.includes("starting up") || error.includes("connect"));
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {isServerStarting ? "Connecting to server..." : "Loading..."}
            </p>
            {isServerStarting && (
              <p className="text-xs text-muted-foreground max-w-md">
                The server may be starting up. This usually takes a few seconds.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show connection error with retry option
  if (error && (error.includes("starting up") || error.includes("connect") || error.includes("timeout"))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-4 max-w-md">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Connection Issue</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={handleRetry} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
