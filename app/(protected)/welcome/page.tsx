"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import { UserDetails } from "@/app/client-actions";
import type { User } from "@supabase/auth-js";
import Avatar from "../account/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectGenres } from "../account/multi-select-genres";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [favouriteGenres, setFavouriteGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch user data from the server
    const fetchUser = async () => {
      setLoading(true); // Set loading state
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        toast.error("Failed to fetch user data");
        console.error("Error fetching user:", error);
        redirect("/auth/login"); // Redirect to login if there's an error
      }
      if (user) {
        setUser(user);
      } else {
        toast.error("No user found, redirecting to login");
        router.push("/auth/login"); // Use router.push for client-side navigation
      }

      if (!user) {
        return; // If no user, exit early
      }

      // There is user, now fetch user details
      const { data: userDetails, error: detailsError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (detailsError) {
        toast.error("Failed to fetch user details");
        console.error("Error fetching user details:", detailsError);
        return;
      }

      if (userDetails) {
        setUserDetails(userDetails);
        setAvatarUrl(userDetails.userIcon || null);
        // Set the favorite genres from the fetched data
        setFavouriteGenres(userDetails.fav_genres || []);
      } else {
        toast.error("No user details found");
      }
      setLoading(false); // Reset loading state
    };

    fetchUser();
  }, [router]);

  const updateDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle potential null user
    if (user === null) {
      toast.error("No user found, please log in");
      return;
    }
    // Get form data
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const supabase = createClient();

    // Update user details
    const { error } = await supabase
      .from("users")
      .update({
        name,
        bio,
        date_of_birth: dateOfBirth,
        userIcon: avatarUrl,
        fav_genres: favouriteGenres,
      })
      .eq("id", user.id);
    if (error) {
      toast.error("Failed to update profile");
      console.error("Error updating user details:", error);
      return;
    }
    toast.success("Profile updated successfully");
    window.location.href = "/home"; // Redirect to home page after successful update
  };

  // If user details are already set, redirect to home page
  if (userDetails?.name && userDetails?.bio && userDetails?.date_of_birth) {
    redirect("/home");
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
        </div>
    )
  }
  return (
    <div className="w-full min-h-screen items-center justify-center max-w-4xl mx-auto p-4">
    <div className="text-center mb-8">
      <h1 className="font-extrabold text-2xl">Welcome to FreeStream!</h1>
      <p>
        To get started, answer a couple questions so we can setup your account
      </p>
      </div>
      <form onSubmit={updateDetails} className="mt-4">
        <Avatar
          uid={user?.id}
          url={avatarUrl}
          size={64}
          onUpload={(url: string) => setAvatarUrl(url)}
        />
        <Label htmlFor="email" className="mb-2">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={user?.email || ""}
          disabled
          className="mb-4"
        />
        <Label htmlFor="name" className="mb-2">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={userDetails?.name || ""}
          className="mb-4"
          required
        />
        <Label htmlFor="bio" className="mb-2">
          Bio
        </Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={userDetails?.bio || ""}
          className="mb-4"
        />
        <Label htmlFor="date_of_birth" className="mb-2">
          Date of Birth <span className="text-red-500">*</span>
        </Label>
        <Input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          defaultValue={userDetails?.date_of_birth || ""}
          className="mb-4"
          required
          max={new Date().toISOString().split("T")[0]} // Prevent future dates
          min={"1900-01-01"} // Prevent dates before 1900
        />
        <Label htmlFor="fav_genres" className="mb-2">
          Favorite Genres
        </Label>
        <div className="mb-4">
          <MultiSelectGenres
            selectedGenres={favouriteGenres}
            onChange={setFavouriteGenres}
          />
        </div>
        <Button type="submit">Update Profile</Button>
      </form>
    </div>
  );
}
