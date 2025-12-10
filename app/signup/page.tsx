"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, fetchCurrentUser } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lightbulb, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { isAuthenticated, isLoading, isChecked, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
    
    if (!isChecked && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isChecked, isLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (!isChecked || isAuthenticated) {
    return null;
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!formData.password2) {
      errors.password2 = "Please confirm your password";
    } else if (formData.password !== formData.password2) {
      errors.password2 = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    dispatch(clearError());

    const payload: {
      username: string;
      email: string;
      password: string;
      password2: string;
      first_name?: string;
      last_name?: string;
    } = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      password2: formData.password2,
    };

    // Only include first_name and last_name if they have values
    const firstName = formData.first_name.trim();
    const lastName = formData.last_name.trim();
    if (firstName) payload.first_name = firstName;
    if (lastName) payload.last_name = lastName;

    dispatch(register(payload));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Don't clear error immediately - let user see it
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[400px] lg:h-[500px] bg-primary/20 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-md space-y-4 px-4 sm:px-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Join <span className="text-primary">FinSight</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Create your account to get started.</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="sr-only">Sign Up</CardTitle>
            <CardDescription className="sr-only">Create a new account</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    className="bg-secondary/50 border-border/50"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    className="bg-secondary/50 border-border/50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="bg-secondary/50 border-border/50"
                  disabled={isLoading}
                />
                {validationErrors.username && (
                  <p className="text-xs text-destructive">{validationErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-secondary/50 border-border/50"
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <p className="text-xs text-destructive">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
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
                {validationErrors.password && (
                  <p className="text-xs text-destructive">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password2">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="password2"
                    type={showPassword2 ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password2}
                    onChange={(e) => handleChange("password2", e.target.value)}
                    className="bg-secondary/50 border-border/50 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword2(!showPassword2)}
                  >
                    {showPassword2 ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword2 ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {validationErrors.password2 && (
                  <p className="text-xs text-destructive">{validationErrors.password2}</p>
                )}
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
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 p-4 pt-2">
            <div className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/" className="text-primary hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>
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

