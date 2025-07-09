"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Pre-fill form from URL parameters (from registration redirect)
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const passwordParam = searchParams.get("password");

    if (emailParam && passwordParam) {
      setFormData({
        email: emailParam,
        password: passwordParam,
      });
      // Show success message from registration
      toast.success("Registration successful! Please login to continue.", {
        duration: 5000,
      });
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);

      const response = await authAPI.login(formData.email, formData.password);

      // Handle response structure: { success: true, message: string, data: { token, user, message } }
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;

      if (token && user) {
        login(token, user);

        toast.success("Login successful! Redirecting to events...");

        // Small delay to show success message before redirect
        setTimeout(() => {
          router.push("/events");
        }, 1000);
      } else {
        toast.error("Login failed - invalid response");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Create user-friendly error messages
      let errorMessage = "Login failed. Please try again.";
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes("invalid") || 
            message.includes("incorrect") || 
            message.includes("wrong") ||
            message.includes("unauthorized") ||
            message.includes("401")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (message.includes("network") || 
                   message.includes("fetch") ||
                   message.includes("connection")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (message.includes("server") || 
                   message.includes("500") ||
                   message.includes("503")) {
          errorMessage = "Server error. Please try again later.";
        } else if (message.includes("not found") || 
                   message.includes("404")) {
          errorMessage = "Account not found. Please check your email or create a new account.";
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {searchParams.get("email") ? (
              "Your credentials are pre-filled. Click sign in to continue."
            ) : (
              <>
                Or{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  create a new account
                </Link>
              </>
            )}
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Quick Login</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    email: "organizer1@example.com",
                    password: "hashedpassword123",
                  });
                }}
                className="w-full"
              >
                Demo Organizer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    email: "user1@example.com",
                    password: "hashedpassword123",
                  });
                }}
                className="w-full"
              >
                Demo Customer
              </Button>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Protected by industry-standard security measures
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
