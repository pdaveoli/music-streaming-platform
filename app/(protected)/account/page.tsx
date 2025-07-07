"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserDetails } from "@/app/client-actions";
import { Textarea } from "@/components/ui/textarea";
import Avatar from "./avatar";
import { MultiSelectGenres } from "./multi-select-genres"; 
import type { User } from "@supabase/auth-js";

/// <summary>
/// AccountPage component that allows users to view and update their account information.
/// It fetches user data, user details, and allows updating profile information including avatar and favorite genres.
/// </summary>
/// <remarks>
/// This component uses client-side rendering to fetch data securely.
/// It handles loading states and errors gracefully.
/// </remarks>
export default function AccountPage() {
  // Client-side state management
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [favouriteGenres, setFavouriteGenres] = useState<string[]>([]);
  const router = useRouter(); 

  useEffect(() => {
    // Fetch user data from the server
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        toast.error("Failed to fetch user data");
        console.error("Error fetching user:", error);
        redirect("/login");
      }
      if (user) {
        setUser(user);
      } else {
        toast.error("No user found, redirecting to login");
        router.push("/login"); // Use router.push for client-side navigation
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
    router.refresh(); // Refresh the page to show updated data
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Account Information</h1>
      {user ? (
        <>
          <div className="max-w-2xl w-full shadow-md rounded-lg p-6">
            {/* Account details (not editable) */}
            <p className="mb-2">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="mb-2">
              <strong>Created At:</strong>{" "}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
            <p className="mb-2">
              <strong>Last Sign In:</strong>{" "}
              {new Date(user.last_sign_in_at ?? "").toLocaleDateString()}
            </p>
            {/* Editable Account details */}
            <form onSubmit={updateDetails} className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
              <Avatar
                uid={user.id}
                url={avatarUrl}
                size={64}
                onUpload={(url: string) => setAvatarUrl(url)}
              />
              <Label htmlFor="name" className="mb-2">
                Name
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
                required
              />
              <Label htmlFor="date_of_birth" className="mb-2">
                Date of Birth
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
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}
