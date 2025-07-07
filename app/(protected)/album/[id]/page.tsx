"use client";
import React, { useState, useEffect } from "react";
import type { PageProps } from "@/.next/types/app/page";
import { getAlbumById, getSongById, Song, isAlbumSaved, Album } from "@/app/client-actions"; // Changed import
import { SongList } from "@/components/song-list";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { createClient } from "@/lib/supabase/client";
import SaveButton from "@/components/save-album-button";
import { Skeleton } from "@/components/ui/skeleton";

/// <summary>
/// AlbumPage component that displays album details, songs, and save functionality.
/// It fetches album data, songs, and user information from the server using client-side actions.
/// </summary>
/// <remarks>
/// This component uses client-side rendering to fetch data securely.
/// It handles loading states and errors gracefully.
/// </remarks>
export default function AlbumPage(props: PageProps) {
  // State management for album details, songs, saved status, user ID, loading state, and album ID
  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [saved, setSaved] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [albumId, setAlbumId] = useState<string>("");


  // Fetch album data, songs, and user information when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        
        const { id } = await props.params;

        if (!id) {
          window.location.href = "/home";
          return;
        }

        setAlbumId(id);
        // Fetch album data by ID
        const albumData = await getAlbumById(id);

        if (!albumData) {
          setAlbum(null);
          setLoading(false);
          return;
        }

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/auth/login";
          return;
        }

        const userIdValue = user.id;
        setUserId(userIdValue);

        // Get initial saved state
        const savedStatus = await isAlbumSaved(userIdValue, id);
        console.log(
          `Album ${id} saved status for user ${userIdValue}:`,
          savedStatus
        );
        console.log(`Type of saved status:`, typeof savedStatus);
        setSaved(Boolean(savedStatus));

        // Load songs
        const songsData: Song[] = await Promise.all(
          albumData?.songIds.map(async (songId: string) => {
            const song: Song = await getSongById(songId);
            return song;
          })
        );

        setAlbum(albumData);
        setSongs(songsData);
      } catch (error) {
        console.error("Error loading album data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle the toggle callback from SaveButton
  const handleSaveToggle = (newSavedState: boolean) => {
    console.log("Album save state changed to:", newSavedState);
    setSaved(newSavedState);
  };

  // If loading, show a loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Skeleton className="w-64 h-64 mb-4" />
        <Skeleton className="w-48 h-8 mb-4" />
      </div>
    );
  }

  // If album not found, show a message
  if (album === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Album Not Found</h1>
        <p className="text-lg text-gray-600">
          The album you are looking for does not exist.
        </p>
        <a href="/discover" className="text-blue-500 hover:underline mt-4">
          Go back to Discover
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full mx-auto">
        {/* Album Header */}
        <img
          src={album?.coverArt}
          alt={album?.name}
          className="w-64 h-64 object-cover rounded-lg mb-4"
        />
        <h1 className="text-4xl font-bold mb-4">{album?.name}</h1>
        <p className="text-lg text-gray-600 mb-4">Artist: {album?.artist}</p>
        <p className="text-base text-gray-800 mb-4">
          {album?.genre} • {album?.metadata?.releaseDate}
        </p>
        <SaveButton
          albumId={albumId}
          isSaved={saved}
          userId={userId}
          onToggle={handleSaveToggle}
        />
        <div className="max-w-3xl mb-4 mt-4">
          <ExpandableDescription
            text={album?.metadata?.description}
            truncateLength={300}
          />
        </div>
      </div>
      {/* Songs List */}
      <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full pl-10 pr-10 mx-auto">
        <SongList songs={songs} />
      </div>
    </>
  );
}
