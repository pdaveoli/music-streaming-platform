"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Change the props to be based on the Card component
export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Card>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const repeatPasswordUpdated = (value: string) => {
    setRepeatPassword(value);
    if (value !== password) {
      setError("Passwords do not match");
    } else {
      setError(null);
    }
  };

  const passwordChanged = (value: string) => {
     // check the password strength
    setPassword(value);
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    }
    else if (!/[A-Z]/.test(value)) {
      setPasswordError("Password must contain at least one uppercase letter");
    }
    else if (!/[a-z]/.test(value)) { 
      setPasswordError("Password must contain at least one lowercase letter");
    }
    else if (!/[0-9]/.test(value)) {
      setPasswordError("Password must contain at least one number");
    }
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      setPasswordError("Password must contain at least one special character");
    } else {
      setPasswordError(null);
    }
  }

  // The root element is now the Card, and we apply the className to it.
  // The unnecessary wrapping div has been removed.
  return (
    <Card className={cn(className)} {...props}>
      <CardHeader>
        <CardTitle className="text-2xl">Sign up</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => passwordChanged(e.target.value)}
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="repeat-password">Repeat Password</Label>
              </div>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => repeatPasswordUpdated(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating an account..." : "Sign up"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
