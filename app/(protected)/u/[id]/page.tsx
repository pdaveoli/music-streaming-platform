"use client";
import { PageProps } from "@/.next/types/app/page";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Album, Playlist, UserDetails } from "@/app/types";
import { toast } from "sonner";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import AlbumList from "@/components/album-list";
import PlaylistList from "@/components/playlist-list";
import { set } from "react-hook-form";

export default function UserPage(props: PageProps) {
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [pageuser, setPageUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [savedAlbums, setSavedAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const getUsersPublicPlaylists = async (user: UserDetails): Promise<void> => {
      if (!user || !user.id) {
        toast.error("No user data available");
        console.error("No user data available");
        setPlaylists([]);
        return;
      };
      const supabase = createClient();
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("userId", user?.id)
        .eq("public", 1);

      if (error) {
        toast.error("Failed to fetch public playlists");
        console.error(error);
        setPlaylists([]);
        return;
      }

      setPlaylists(data || []);
      if (data && data.length === 0) {
        toast.info("No public playlists found for this user");
      }
      return;
    };

    const getUsersSavedAlbums = async (user: UserDetails) => {
      if (!user || !user.id) {
        toast.error("No user data available");
        setSavedAlbums([]);
        return;
      };
      const supabase = createClient();
      const savedAlbums = user?.library_albums || [];
      if (savedAlbums.length === 0) {
        setSavedAlbums([]);
        toast.info("No saved albums found for this user");
        return;
      };

      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .in("id", savedAlbums);

      if (error) {
        toast.error("Failed to fetch saved albums");
        console.error(error);
        return [];
      }

      setSavedAlbums(data || []);
    };
    const loadData = async () => {
      setLoading(true);
      const supabase = createClient();
      // Get currently logged in user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // If no user is logged in, redirect to login page
        window.location.href = "/auth/login";
        return;
      }
      // Get the current user details
      const { data: currentUserData, error: currentUserError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (currentUserError) {
        toast.error("Failed to fetch current user details");
        console.error(currentUserError);
        return;
      }

      setCurrentUser(currentUserData as UserDetails);

      const params = await props.params;
      const userId = params?.id;

      if (!userId) {
        // If no user ID is provided, redirect to home page
        toast.error("No user ID provided");
        window.location.href = "/home";
        return;
      }

      // Fetch the user details from the database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", userId)
        .single();
      if (error) {
        toast.error("Failed to fetch user details");
        console.error(error);
        return;
      }

      if (!data) {
        toast.error("User not found");
        window.location.href = "/home";
        return;
      }


      setPageUser(data as UserDetails);
      
      
    // Fetch public playlists and saved albums for the user
    getUsersPublicPlaylists(data);
    getUsersSavedAlbums(data);
      setLoading(false);
    };

    loadData();
    // Add the dependency array here. The effect will now only run when the
    // component mounts or when the user ID in the URL changes.
  }, [props.params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="animate-spin rounded-full h-16 w-16 border-t-
4 border-blue-500"
        ></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-6xl mx-auto">
        {/* Artist Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <Image
            src={"https://smtdqezdamcycolojywa.supabase.co/storage/v1/object/public/avatars/" + (pageuser?.userIcon || "default-avatar.png")}
            alt={pageuser?.username || "User Avatar"}
            width={200}
            height={200}
            className="w-48 h-48 object-cover rounded-full flex-shrink-0 shadow-lg"
          />
          <div className="flex flex-col items-center md:items-start flex-1 pt-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-center md:text-left">
              {pageuser?.name}
            </h1>
            <p className="text-muted-foreground font-light text-sm mb-4">@{pageuser?.username || "Unknown User"}</p>

            {/* Artist metadata */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
              <p>
                <span className="font-semibold text-foreground">Top Genres:</span>{" "}
                {pageuser?.fav_genres ? pageuser.fav_genres.join(", ") : "Not specified"}
              </p>
            </div>

            {/* Artist Description */}
            <div className="w-full text-center md:text-left">
              <ExpandableDescription
                truncateLength={500}
                text={pageuser?.bio || "No bio available."}
              />
            </div>
          </div>
        </div>

        {/* Playlists and Saved albums */}
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-4">Public Playlists</h2>
          {playlists.length === 0 ? (
            <p className="text-muted-foreground">
              No public playlists found for this user.
            </p>
          ) : (
            <PlaylistList playlists={playlists} />
          )}
          <h2 className="text-2xl font-semibold mt-8 mb-4">Saved Albums</h2>
          <div>
            {savedAlbums.length === 0 ? (
              <p className="text-muted-foreground">
                No saved albums found for this user.
              </p>
            ) : (
              <AlbumList albums={savedAlbums} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
