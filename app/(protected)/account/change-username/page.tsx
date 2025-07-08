"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserDetails } from "@/app/types";
import { Filter } from "bad-words";
import { array as badwordsArray } from "badwords-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X } from "lucide-react";

export default function ChangeUsernamePage() {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [usedUsernames, setUsedUsernames] = useState<string[]>([]);
  const router = useRouter();

  const minUsernameLength = 3;
  const maxUsernameLength = 20;

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userDetails, error: detailsError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (detailsError || !userDetails) {
          toast.error("Failed to fetch user profile.");
          router.push("/auth/login");
          return;
        }
        setUser(userDetails as UserDetails);
        setUsername(userDetails.username || "");

        const { data: usernamesData } = await supabase
          .from("users")
          .select("username");

        if (usernamesData) {
          setUsedUsernames(
            usernamesData
              .map((u: { username: string }) => u.username)
              .filter((name) => name !== userDetails.username)
          );
        }
      } else {
        toast.error("No user found, redirecting to login.");
        router.push("/auth/login");
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const validateUsername = (newUsername: string): boolean => {
    if (newUsername.length < minUsernameLength) {
      setUsernameError(
        `Username must be at least ${minUsernameLength} characters long.`
      );
      return false;
    }
    if (newUsername.length > maxUsernameLength) {
      setUsernameError(
        `Username must be no more than ${maxUsernameLength} characters long.`
      );
      return false;
    }
    if (usedUsernames.includes(newUsername)) {
      setUsernameError("This username is already taken.");
      return false;
    }

    const combinedBadWords = [...new Filter().list, ...badwordsArray];
    const lowerCaseUsername = newUsername.toLowerCase();
    for (const badWord of combinedBadWords) {
      if (lowerCaseUsername.includes(badWord)) {
        setUsernameError("Username contains inappropriate language.");
        return false;
      }
    }

    const hasWhitespace = /\s/.test(newUsername);
    if (hasWhitespace) {
      setUsernameError("Username cannot contain spaces.");
      return false;
    }

    setUsernameError(null);
    return true;
  };

  const usernameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    validateUsername(newUsername.trim());
  };

  const changeUsername = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("No user data available");
      return;
    }

    const newUsername = username.trim();
    if (newUsername === user.username) {
      toast.info("This is already your username.");
      return;
    }

    if (!validateUsername(newUsername)) {
      toast.error("Invalid username. Please check the rules.");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .update({ username: newUsername })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      toast.error("Failed to change username.");
    } else {
      setUser(data as UserDetails);
      toast.success("Username changed successfully!");
      router.push("/account/profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading account details...</p>
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
          <CardTitle>Change Username</CardTitle>
          <CardDescription>
            Your username is how other users will identify you. Choose wisely!
          </CardDescription>
        </CardHeader>
        <form onSubmit={changeUsername}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="username">New Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter new username"
                onChange={(e) => usernameChanged(e)}
                value={username}
                required
                className="mb-2"
              />
              {usernameError && (
                <p className="text-red-500 text-sm">{usernameError}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full mt-4">
              Change Username
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
