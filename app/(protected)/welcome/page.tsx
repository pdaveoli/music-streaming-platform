"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import type { UserDetails } from "@/app/types";
import type { User } from "@supabase/auth-js";
import Avatar from "../account/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectGenres } from "../account/multi-select-genres";
import { Button } from "@/components/ui/button";
import { Filter } from "bad-words";
import { array as badwordsArray } from "badwords-list"
import { properFilter } from "@/lib/utils";

// Step indicator UI component
const SetupSteps = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, name: "Choose Username" },
    { id: 2, name: "Complete Profile" },
  ];

  return (
    <div className="flex items-center justify-center w-full max-w-md mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                currentStep >= step.id
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {step.id}
            </div>
            <p
              className={`mt-2 text-sm font-medium transition-colors duration-300 ${
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.name}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-auto border-t-2 transition-colors duration-500 ease-in-out mx-4 ${
                currentStep > step.id ? "border-primary" : "border-border"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [favouriteGenres, setFavouriteGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  // Rename state to avoid conflict and clarify its purpose
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [usedUsernames, setUsedUsernames] = useState<string[]>([]);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const router = useRouter();

  const minUsernameLength = 3; // Minimum username length
  const maxUsernameLength = 20; // Maximum username length

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
        // Set the input value from fetched details, but don't use it for step logic
        setUsernameInput(userDetails.username || "");
        setFavouriteGenres(userDetails.fav_genres || []);
      } else {
        toast.error("No user details found");
      }

      // get all the used usernames
      const { data: usernamesData, error: usernamesError } = await supabase
        .from("users")
        .select("username");
      if (usernamesError) {
        console.error("Error fetching usernames:", usernamesError);
        toast.error("Failed to fetch usernames");
        return;
      }
      // Extract usernames from the fetched data
      const usernames = (usernamesData ?? []).map((u: { username: string }) => u.username);
      setUsedUsernames(usernames);

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
    let name = formData.get("name") as string;
    let bio = formData.get("bio") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const supabase = createClient(); const filter = new Filter();
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
    window.location.href = "/home"; // Redirect to home page after successful update
  };

  // If user details are already set, redirect to home page
  if (userDetails?.name && userDetails?.bio && userDetails?.date_of_birth && userDetails?.username) {
    redirect("/home");
  }

  const validateUsername = (newUsername: string): boolean => {
    // Rule 1: Check length
    if (newUsername.length < minUsernameLength) {
      setUsernameError(`Username must be at least ${minUsernameLength} characters long.`);
      return false;
    }
    if (newUsername.length > maxUsernameLength) {
      setUsernameError(`Username must be no more than ${maxUsernameLength} characters long.`);
      return false;
    }

    // Rule 2: Check if already taken
    if (usedUsernames.includes(newUsername)) {
      setUsernameError("This username is already taken. Please choose another.");
      return false;
    }

    // Rule 3: Check for profanity. This is the definitive fix.
    // We will manually check if the username contains any bad word as a substring.
    const combinedBadWords = [...new Filter().list, ...badwordsArray];
    const lowerCaseUsername = newUsername.toLowerCase();

    for (const badWord of combinedBadWords) {
      if (lowerCaseUsername.includes(badWord)) {
        setUsernameError("Username contains inappropriate language. Please choose another.");
        return false;
      }
    }

    // Rule 4: Check for whitespace
    const trimmedUsername = newUsername.trim();
    if (trimmedUsername !== newUsername) {
      setUsernameError("Username cannot start or end with whitespace.");
      return false;
    }
    const hasWhitespace = /\s/.test(newUsername);
    if (hasWhitespace) {
      setUsernameError("Username cannot contain spaces.");
      return false;
    }
    setUsernameError(null); // Clear any previous errors
    return true;
  }

  const usernameValChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.trim();
    // Update the input state
    setUsernameInput(newUsername);
    validateUsername(newUsername);
  };

  const updateUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Use the input's state for the update logic
    if (!user || !usernameInput) {
      toast.error("User or username is not set");
      return;
    }

    // Validate the username before proceeding
    if (!validateUsername(usernameInput)) {
      toast.error("Invalid username. Please fix the errors and try again.");
      return;
    }

    // just make sure the username is clean and trimmed
    const cleanedUsername = properFilter(usernameInput.trim());

    // Update the username in the database
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ username: cleanedUsername }) // Use the cleaned username here
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update username");
      console.error("Error updating username:", error);
      return;
    }

    // Update the local state
    setUserDetails((prevDetails) => {
      if (!prevDetails) return null;
      return {
        ...prevDetails,
        username: usernameInput, // Update local details with the new username
      };
    });
    toast.success("Username updated successfully");
    window.location.href = "/welcome";
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
        </div>
    )
  }

  // This is the key change: Base the current step on the saved userDetails,
  // not the live input state.
  const currentStep = !userDetails?.username ? 1 : 2;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center max-w-4xl mx-auto p-4">
      <SetupSteps currentStep={currentStep} />
      <div className="text-center mb-8">
        <h1 className="font-extrabold text-3xl">Welcome to FreeStream!</h1>
        <p className="text-muted-foreground mt-2">
          To get started, please complete your account setup.
        </p>
      </div>

      {currentStep === 1 ? (
        <form
          onSubmit={updateUsername}
          className="mt-4 w-full max-w-sm text-left"
        >
          <Label htmlFor="username" className="mb-2">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            value={usernameInput} // Bind to the new input state
            onChange={(e) => usernameValChanged(e)}
            className="mb-2"
            required
          />
          {usernameError && (
            <p className="text-red-500 text-sm mb-4">{usernameError}</p>
          )}
          <Button type="submit" className="w-full">
            Set Username
          </Button>
        </form>
      ) : (
        <form
          onSubmit={updateDetails}
          className="mt-4 w-full max-w-lg text-left"
        >
          <div className="flex justify-center mb-6">
            <Avatar
              uid={user?.id}
              url={avatarUrl}
              size={80}
              onUpload={(url: string) => setAvatarUrl(url)}
            />
          </div>
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
          <Button type="submit" className="w-full">
            Update Profile & Finish
          </Button>
        </form>
      )}
    </div>
  );
}
