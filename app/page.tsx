"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError, fetchCurrentUser } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lightbulb, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { isAuthenticated, isLoading, isChecked, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
    
    // Check auth status on mount
    if (!isChecked && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isChecked, isLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Show nothing while checking or if already logged in
  if (!isChecked || isAuthenticated) {
    return null;
  }

  const handleChange = (field: "email" | "password", value: string) => {
    if (field === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }
    // Don't clear error immediately - let user see it
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Extract username from email (part before @)
    const username = email.split("@")[0];
    if (!username || !password) {
      return;
    }
    dispatch(clearError());
    dispatch(login({ username, password }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-primary/20 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-md space-y-4 px-4 sm:px-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Welcome to <span className="text-primary">FinSight</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">The Future of Financial Management.</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="sr-only">Login</CardTitle>
            <CardDescription className="sr-only">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-secondary/50 border-border/50"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="bg-secondary/50 border-border/50 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive font-medium text-center">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 p-4 pt-2">
            <div className="text-center text-xs text-primary hover:underline cursor-pointer">
              Forgot Password?
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 cursor-pointer hover:scale-110 transition-transform">
          <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
