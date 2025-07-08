"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Album, UserDetails, getAlbumById, getSavedAlbums } from "@/app/client-actions";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CompassIcon, LibraryIcon } from "lucide-react";
import AlbumList from "@/components/album-list";

/// <summary>
/// Home page component that displays the user's saved albums and provides navigation options.
/// It fetches user details and saved albums from Supabase, handling errors and redirects as needed.
/// </summary>
/// <remarks>
/// This component uses React hooks to manage state and side effects.
/// It redirects to the login page if the user is not authenticated.
/// </remarks>
export default function HomePage() {
  // Client-side state management for user details and saved albums
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [savedAlbums, setSavedAlbums] = useState<Album[] | null>(null);


  // Fetch user details and saved albums on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error);
        toast.error("You are not logged in.");
        redirect("/auth/login");
      }

      const userId = user.id;
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        toast.error("Failed to fetch user data");
        redirect("/welcome");
      }
      setUserDetails(userData); // Set userDetails, even if null

      // Get saved album IDs
      const savedAlbumIds = await getSavedAlbums(userId);
      if (savedAlbumIds && savedAlbumIds.length > 0) {
        // Fetch all album details concurrently
        const albumPromises = savedAlbumIds.map((id) => getAlbumById(id));
        const albumsData = await Promise.all(albumPromises);

        // Filter out any potential nulls if getAlbumById can return them
        const validAlbums = albumsData.filter(
          (album): album is Album => album !== null
        );
        setSavedAlbums(validAlbums);
      } else {
        // If no saved albums, set to an empty array for consistent handling
        setSavedAlbums([]);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-center p-4">
      {/* Welcome message */}
      <h1 className="flex items-baseline justify-center text-4xl font-bold mb-4 max-w-lg w-full">
        <span className="flex-shrink-0">Welcome back,&nbsp;</span>
        <span className="truncate">
          {userDetails ? userDetails.name : "..."}
        </span>
      </h1>
      <p className="text-lg text-gray-400">
        Your one-stop destination for all your music needs.
      </p>
      {/* Quick Access buttons */}
      <div className="mt-8 flex space-x-4 flex-row justify-center">
        <Link href="/library">
          <Button variant="outline" size="sm">
            <LibraryIcon className="mr-2 h-4 w-4" /> Library
          </Button>
        </Link>
        <Link href="/discover">
          <Button variant="outline" size="sm">
            <CompassIcon className="mr-2 h-4 w-4" /> Discover
          </Button>
        </Link>
      </div>
      <div className="mt-8 text-gray-500">
        <p className="text-sm">
          Get back to listening to your favorite music, or discover new tracks!
        </p>
        { /* Saved albums list */}
        <div className="max-w-4xl w-full mt-6">
        <AlbumList albums={savedAlbums ? savedAlbums : []} />
        </div>
      </div>
    </div>
  );
}
