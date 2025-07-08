"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X } from "lucide-react";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state
  const router = useRouter();

  useEffect(() => {
    const checkUserProvider = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to access this page.");
        router.push("/auth/login");
        return;
      }

      // This is the key logic: check the user's sign-up method.
      if (user.app_metadata.provider && user.app_metadata.provider !== "email") {
        toast.error(
          "Cannot change password for accounts created with an external provider."
        );
        router.push("/account/");
      } else {
        // If the user is an email user, allow them to see the page.
        setLoading(false);
      }
    };

    checkUserProvider();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error on new submission

    // 1. Client-side validation
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // 2. Call Supabase auth to update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    // 3. Handle the response
    if (updateError) {
      toast.error(updateError.message);
      setError(updateError.message);
    } else {
      toast.success("Password updated successfully!");
      router.push("/account"); // Redirect after success
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verifying account type...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => router.back()}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Choose a new password. Make sure it's secure.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Updating..." : "Change Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
