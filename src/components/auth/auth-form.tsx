"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconBrandGithub, IconBrandGoogle, IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { signInWithEmail, signUpWithEmail, signInWithOAuth, resetPassword } from "@/services/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  mode: "login" | "register" | "reset";
  className?: string;
}

export function AuthForm({ mode, className }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const isLoginMode = mode === "login";
  const isRegisterMode = mode === "register";
  const isResetMode = mode === "reset";

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      // Validation
      if (!email.trim()) {
        setFormError("Please enter your email address");
        setIsLoading(false);
        return;
      }

      if (!isResetMode && !password.trim()) {
        setFormError("Please enter your password");
        setIsLoading(false);
        return;
      }

      if (isRegisterMode && password !== confirmPassword) {
        setFormError("Passwords don't match");
        setIsLoading(false);
        return;
      }

      // Authentication logic
      if (isLoginMode) {
        const { user, error } = await signInWithEmail(email, password);
        
        if (error) {
          setFormError(error.message);
          setIsLoading(false);
          return;
        }

        if (user) {
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          // Force a refresh of server components to update auth state
          router.refresh();
          // Removed explicit router.replace("/dashboard") call
          // Now relying on middleware for redirection
        }
      } else if (isRegisterMode) {
        const { user, error } = await signUpWithEmail(email, password);
        
        if (error) {
          setFormError(error.message);
          setIsLoading(false);
          return;
        }

        if (user) {
          toast({
            title: "Registration successful",
            description: "Please check your email to confirm your account.",
          });
          // Force a refresh of server components to update auth state
          router.refresh();
          // Removed explicit router.replace("/") call
          // Now relying on middleware for redirection
        }
      } else if (isResetMode) {
        const { error } = await resetPassword(email);
        
        if (error) {
          setFormError(error.message);
          setIsLoading(false);
          return;
        }

        toast({
          title: "Password reset email sent",
          description: "Please check your email for password reset instructions.",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setFormError("An unexpected error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "github" | "google") => {
    setFormError(null);
    setIsLoading(true);
    
    try {
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        setFormError(error.message);
        setIsLoading(false);
        return;
      }

      // The redirect happens in the signInWithOAuth function
      // We don't reset isLoading here since we're navigating away
    } catch (error) {
      console.error(`Error with ${provider} auth:`, error);
      setFormError("An unexpected error occurred with social login.");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6 w-full max-w-md mx-auto", className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">
          {isLoginMode && "Welcome back"}
          {isRegisterMode && "Create an account"}
          {isResetMode && "Reset your password"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isLoginMode && "Enter your email below to login to your account"}
          {isRegisterMode && "Enter your information to create your account"}
          {isResetMode && "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      {/* Social Auth Buttons */}
      {!isResetMode && (
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
            onClick={() => handleSocialAuth("github")}
            disabled={isLoading}
          >
            <IconBrandGithub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button
            variant="outline"
            className="bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
            onClick={() => handleSocialAuth("google")}
            disabled={isLoading}
          >
            <IconBrandGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-700"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-neutral-900 px-2 text-neutral-500">
            {!isResetMode ? "Or continue with" : "Password reset"}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {formError && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md text-sm">
          {formError}
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
          </div>

          {!isResetMode && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                {isLoginMode && (
                  <Link
                    href="/reset-password"
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-neutral-800 border-neutral-700 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <IconEye className="h-4 w-4 text-neutral-400" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {isRegisterMode && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-neutral-800 border-neutral-700 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <IconEye className="h-4 w-4 text-neutral-400" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLoginMode && "Logging in..."}
                {isRegisterMode && "Creating account..."}
                {isResetMode && "Sending reset link..."}
              </>
            ) : (
              <>
                {isLoginMode && "Sign In"}
                {isRegisterMode && "Create Account"}
                {isResetMode && "Send Reset Link"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Switch between login and register */}
      <div className="text-center text-sm">
        {isLoginMode && (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyan-500 hover:text-cyan-400">
              Sign up
            </Link>
          </>
        )}
        {isRegisterMode && (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-500 hover:text-cyan-400">
              Sign in
            </Link>
          </>
        )}
        {isResetMode && (
          <>
            Remember your password?{" "}
            <Link href="/login" className="text-cyan-500 hover:text-cyan-400">
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}