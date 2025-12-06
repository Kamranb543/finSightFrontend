"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, isChecked } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Only check once if we haven't checked yet
    if (!isChecked && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isChecked, isLoading]);

  useEffect(() => {
    // Redirect only after we've checked and user is not authenticated
    if (isChecked && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isChecked, router]);

  // Show loading while checking auth
  if (!isChecked || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
