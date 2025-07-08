"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserDetails } from "@/app/types";
import { Textarea } from "@/components/ui/textarea";
import Avatar from "./avatar";
import { MultiSelectGenres } from "./multi-select-genres"; 
import type { User } from "@supabase/auth-js";
import { properFilter } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    let name = formData.get("name") as string;
    let bio = formData.get("bio") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const supabase = createClient();

    name = properFilter(name); // Clean the name using bad-words filter
    bio = properFilter(bio); // Clean the bio using bad-words filter
    
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
    <div className="flex max-w-[100vh_-_84px] justify-center min-h-screen py-8 px-4 overflow-x-hidden truncate overflow-y-auto ">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>

        {user ? (
          <form onSubmit={updateDetails} className="space-y-8">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  This is how others will see you on the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <Avatar
                    uid={user.id}
                    url={avatarUrl}
                    size={80}
                    onUpload={(url: string) => setAvatarUrl(url)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={userDetails?.name || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={userDetails?.bio || ""}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-grow min-w-0">
                      <Input
                        id="username"
                        value={userDetails?.username || ""}
                        disabled
                      />
                    </div>
                    <Button asChild variant="outline">
                      <Link
                        href="/account/change-username"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Change</span>
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex items-center gap-4">
                    {/* This is the fix: adding min-w-0 allows the div to shrink */}
                    <div className="flex-grow min-w-0">
                      <Input
                        id="password"
                        type="password"
                        value="********"
                        disabled
                      />
                    </div>
                    <Button asChild variant="outline">
                      <Link
                        href="/account/change-password"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Change</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
                <CardDescription>
                  Manage your personal details and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    defaultValue={userDetails?.date_of_birth || ""}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    min={"1900-01-01"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Favorite Genres</Label>
                  <MultiSelectGenres
                    selectedGenres={favouriteGenres}
                    onChange={setFavouriteGenres}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">
              Update Profile
            </Button>
          </form>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
}
