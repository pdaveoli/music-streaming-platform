"use client";

import type { PageProps } from "@/.next/types/app/page";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Playlist,
  Song,
  getSongById,
  getSavedSongs,
} from "@/app/client-actions";

// UI imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, Lock } from "lucide-react";
import { toast } from "sonner";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { SongList } from "@/components/song-list";
import { redirect } from "next/navigation";
import { Filter } from "bad-words";

/// <summary>
/// PlaylistPage component that displays the details of a specific playlist.
/// It fetches the playlist data, including its songs, and allows users to interact with the playlist.
/// </summary>
export default function PlaylistPage(props: PageProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [showAddSong, setShowAddSong] = useState(false);
  const [showEditPlaylist, setShowEditPlaylist] = useState(false);
  const [userSavedSongs, setUserSavedSongs] = useState<Song[]>([]);
  const [songToRemove, setSongToRemove] = useState<Song | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [denied, setDenied] = useState(false);
  const [visibility, setVisibility] = useState<string>("private");
  const [isUsersPlaylist, setIsUsersPlaylist] = useState<boolean>(false);
  const [savedPlaylist, setSavedPlaylist] = useState<boolean>(false);
  const [playlistOwner, setPlaylistOwner] = useState<string>(""); // UUID of the playlist owner
  const [playlistOwnerName, setPlaylistOwnerName] = useState<string>(""); // Name of the playlist owner
  const [playlistOwnerImage, setPlaylistOwnerImage] = useState<string>(""); // Image of the playlist owner

  // Load user data and playlist details when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await props.params;

        if (!id) {
          window.location.href = "/home";
          return;
        }

        const supabase = createClient();
        const { data: playlistData, error } = await supabase
          .from("playlists")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw new Error("Failed to fetch playlist");
        }

        setPlaylist(playlistData);
        if (playlistData) {
          setVisibility(playlistData.public === 1 ? "public" : "private");
        }

        if (playlistData?.songs) {
          // get playlist songs using the fetched data directly
          const songsData: Song[] = await Promise.all(
            playlistData.songs.map(async (songId: string) => {
              const song: Song = await getSongById(songId);
              return song;
            })
          );
          setSongs(songsData);
        }

        // Get user ID
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/auth/login";
          return;
        }

        setUserId(user.id);

        // Check if the playlist is private
        if (playlistData.public === 0 && user.id !== playlistData.userId) {
          // Check if the user is shared
          if (!playlistData.sharedIds?.includes(user.id)) {
            setDenied(true);
            toast.error("This playlist is private and you do not have access.");
            window.location.href = "/home";
            return;
          }
          setIsUsersPlaylist(false);
        } else if (
          playlistData.public === 1 &&
          user.id !== playlistData.userId
        ) {
          setIsUsersPlaylist(false);
        } else {
          setIsUsersPlaylist(true);
        }

        setPlaylistOwner(playlistData.userId);
        
        // Get details for the playlist owner

        const { data: ownerData, error: ownerError } = await supabase
          .from("users")
          .select("id, name, userIcon")
          .eq("id", playlistData.userId)
          .single();

        if (ownerError) {
          console.error("Error fetching playlist owner details:", ownerError);
          toast.error("Failed to fetch playlist owner details.");
        } else {
          setPlaylistOwnerName(ownerData?.name);
          setPlaylistOwnerImage(ownerData?.userIcon);
        }

        // Load user's saved songs
        if (user.id) {
          const savedSongsData: Song[] = await getSavedSongs(user.id);
          setUserSavedSongs(savedSongsData);
        }

        // Check if the playlist is saved
        if (user.id) {
          const { data: userPlaylists, error } = await supabase
            .from("users")
            .select("id, playlists")
            .eq("id", user.id)
            .single();

            if (error) {
              console.error("Error fetching user playlists:", error);
              toast.error("Failed to fetch user playlists.");
              return;
            }

            // Check if the playlist is already saved
            if (userPlaylists.playlists && userPlaylists.playlists.includes(playlistData?.id)) {
              setSavedPlaylist(true);
            } else {
              setSavedPlaylist(false);
            }
            
        }
      } catch (error) {
        console.error("Error loading playlist:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [props.params]);

  /// <summary>
  /// Function to add a song to the playlist.
  /// It checks if the song already exists in the playlist before adding it.
  /// </summary>
  /// <param name="song">The song to be added.</param>
  const addToPlaylist = async (song: Song) => {
    // add song to playlist
    console.log("Adding song to playlist:", song);
    // check if song already exists in playlist
    if (playlist?.songs && !playlist.songs.includes(song.id)) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("playlists")
        .update({
          songs: [...(playlist.songs || []), song.id],
        })
        .eq("id", playlist.id);
      if (error) {
        console.error("Error adding song to playlist:", error);
        toast.error("Failed to add song to playlist. Please try again.");
      } else {
        console.log("Song added successfully:", data);
        toast.success("Song added successfully!");
        // Allow the user to add more songs without closing the modal
        setShowAddSong(true); // Keep the modal open
        // Optionally, you can reload the playlist data to reflect changes
        const updatedPlaylist = await supabase
          .from("playlists")
          .select("*")
          .eq("id", playlist.id)
          .single();
        setPlaylist(updatedPlaylist.data);
        // Update the songs state to include the newly added song
        setSongs((prevSongs) => [...prevSongs, song]);
      }
    } else if (playlist?.songs && playlist.songs.includes(song.id)) {
      // If the song is already in the playlist, show a warning
      console.warn("This song is already in the playlist.");
      toast.warning("This song is already in the playlist.");
    } else if (playlist) {
      // Add the song anyway, the playlist might not have songs yet
      const supabase = createClient();
      const { data, error } = await supabase
        .from("playlists")
        .update({
          songs: [song.id],
        })
        .eq("id", playlist.id);

      if (error) {
        console.error("Error adding song to playlist:", error);
        toast.error("Failed to add song to playlist. Please try again.");
      } else {
        console.log("Song added successfully:", data);
        toast.success("Song added successfully!");
        // Allow the user to add more songs without closing the modal
        setShowAddSong(true); // Keep the modal open
        // Optionally, you can reload the playlist data to reflect changes
        const updatedPlaylist = await supabase
          .from("playlists")
          .select("*")
          .eq("id", playlist.id)
          .single();
        setPlaylist(updatedPlaylist.data);
        // Update the songs state to include the newly added song
        setSongs((prevSongs) => [...prevSongs, song]);
      }
    }
  };

  /// <summary>
  /// Function to edit the playlist details.
  /// It updates the playlist name, description, cover art, and visibility.
  /// </summary>
  /// <param name="event">The form submission event.</param>
  const editDetails = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    if (!playlist || !isUsersPlaylist) {
      toast.error("Playlist not found.");
      return;
    }
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.currentTarget);
    const filter = new Filter();
    let updatedName = formData.get("name") as string;
    if (!updatedName) updatedName = playlist?.name || "Untitled Playlist"; // Fallback to current name if empty
    else filter.clean(updatedName); // Clean the name using bad-words filter
    let updatedDescription = formData.get("description") as string;
    if (!updatedDescription) updatedDescription = playlist?.description || "No description available"; // Fallback to current description if empty
    else filter.clean(updatedDescription); // Clean the description using bad-words filter
    let updatedCoverArt = formData.get("coverArt") as string;
    if (!updatedCoverArt) {
      updatedCoverArt = playlist?.coverArt || "/default-playlist-image.png"; // Fallback to current cover art if empty
    }
    // Use the state variable for visibility, not formData
    const updatedVisibility = visibility === "public" ? 1 : 0;

    const supabase = createClient();
    // Update the playlist with new details
    const { data, error } = await supabase
      .from("playlists")
      .update({
        name: updatedName,
        description: updatedDescription,
        coverArt: updatedCoverArt,
        public: updatedVisibility,
      })
      .eq("id", playlist?.id);
    if (error) {
      console.error("Error updating playlist:", error);
      toast.error("Failed to update playlist. Please try again.");
    } else {
      console.log("Playlist updated successfully:", data);
      toast.success("Playlist updated successfully!");
      setShowEditPlaylist(false); // Hide the edit form after saving
      // Optionally, you can reload the playlist data to reflect changes
      const updatedPlaylist = await supabase
        .from("playlists")
        .select("*")
        .eq("id", playlist?.id)
        .single();
      setPlaylist(updatedPlaylist.data);
    }
  };

  /// <summary>
  /// Function to remove a song from the playlist.
  /// It updates the playlist by removing the specified song ID.
  /// </summary>
  /// <param name="songId">The ID of the song to be removed.</param>
  const removeSong = async (songId: string): Promise<void> => {
    console.log("Removing song with ID:", songId);
    if (!playlist || !playlist.songs || !isUsersPlaylist) {
      console.error("Playlist or songs not found");
      return;
    }
    // if songId is not in playlist.songs, return
    if (!playlist.songs.includes(songId)) {
      console.warn("Song ID not found in playlist");
      return;
    }
    const updatedSongs = playlist.songs.filter((id) => id !== songId);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("playlists")
      .update({ songs: updatedSongs })
      .eq("id", playlist.id);
    if (error) {
      console.error("Error removing song from playlist:", error);
      toast.error("Failed to remove song from playlist. Please try again.");
    } else {
      console.log("Song removed successfully:", data);
      toast.success("Song removed successfully!");
      // Update the local state to reflect the change
      const updatedPlaylist = await supabase
        .from("playlists")
        .select("*")
        .eq("id", playlist?.id)
        .single();
      setPlaylist(updatedPlaylist.data);
      // Optionally, remove the song from the songs state
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));
    }
  };

  /// <summary>
  /// Function to delete the playlist.
  /// It removes the playlist from the database and redirects the user.
  /// </summary>
  /// <returns>Promise<void></returns>
  const deletePlaylist = async (): Promise<void> => {
    if (!playlist || !isUsersPlaylist) {
      toast.error("Playlist not found.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", playlist.id);

    if (error) {
      toast.error("Failed to delete playlist. Please try again.");
      console.error("Error deleting playlist:", error);
    } else {
      toast.success(`Playlist "${playlist.name}" deleted successfully.`);
      // Redirect user after deletion
      window.location.href = "/library";
    }
  };

  /// <summary>
  /// Search handler for filtering songs in the add song modal.
  /// It updates the search query and filters the songs based on the query.
  /// </summary>
  /// <param name="event">The input change event.</param>
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    if (query) {
      const filtered = userSavedSongs.filter((song) =>
        song.name.toLowerCase().includes(query)
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(userSavedSongs);
    }
  };

  /// <summary>
  /// Function to toggle the add song modal.
  /// It resets the search query and filtered songs when opening the modal.
  /// </summary>
  /// <returns>void</returns>
  const addSongMenu = (): void => {
    // toggle the add song modal
    setShowAddSong(!showAddSong);
    if (!showAddSong) {
      // If opening the modal, reset search and filtered songs
      setSearchQuery("");
      setFilteredSongs(userSavedSongs);
    }
    if (showAddSong) {
      handleSearch({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };
  /// <summary>
  /// Function to save the playlist to the user's library.
  /// It checks if the playlist is already saved and updates the user's playlists accordingly.
  /// </summary>
  /// <returns>void</returns>
  const savePlaylist = async () : Promise<void> => {
    if (!playlist) {
      toast.error("Playlist not found.");
      redirect("/home");
    }

    const supabase = createClient();
    // get all saved playlists for the user
    const { data, error } = await supabase
      .from("users")
      .select("id, playlists")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user playlists:", error);
      toast.error("Failed to fetch user playlists.");
      return;
    }

    // Check if the playlist is already saved
    if (data.playlists && data.playlists.includes(playlist.id)) {
      toast.warning("Playlist already saved to your library.");
      return;
    }

    // Add the playlist to the user's saved playlists
    const updatedPlaylists = [...(data.playlists || []), playlist.id];
    const { error: updateError } = await supabase
      .from("users")
      .update({ playlists: updatedPlaylists })
      .eq("id", userId);

    if (updateError) {
      console.error("Error saving playlist:", updateError);
      toast.error("Failed to save playlist. Please try again.");
    } else {
      toast.success("Playlist saved to your library!");
    }

  }
  /// <summary>
  /// Function to unsave the playlist from the user's library.
  /// It removes the playlist from the user's saved playlists.
  /// </summary>
  /// <returns>void</returns>
  const unSavePlaylist = async () : Promise<void> => {
    if (!playlist) {
      toast.error("Playlist not found.");
      redirect("/home");
    }

    const supabase = createClient();
    // get all saved playlists for the user
    const { data, error } = await supabase
      .from("users")
      .select("id, playlists")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user playlists:", error);
      toast.error("Failed to fetch user playlists.");
      return;
    }

    // Check if the playlist is already saved
    if (!data.playlists || !data.playlists.includes(playlist.id)) {
      toast.warning("Playlist not found in your library.");
      return;
    }

    // Remove the playlist from the user's saved playlists
    const updatedPlaylists = data.playlists.filter(
      (id: string) => id !== playlist.id
    );
    const { error: updateError } = await supabase
      .from("users")
      .update({ playlists: updatedPlaylists })
      .eq("id", userId);

    if (updateError) {
      console.error("Error unsaving playlist:", updateError);
      toast.error("Failed to unsave playlist. Please try again.");
    } else {
      toast.success("Playlist removed from your library!");
    }
  };

  // If loading or denied, show loading or denied message
  if (loading || denied) {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-8 mx-auto w-full h-screen">
        Loading...
      </div>
    );
  }

  // If no playlist found, show no playlist message
  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-8 mx-auto w-full h-screen">
        No playlist found
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 mx-auto w-full min-h-screen">
      {/* Playlist details section */}
      <Image
        src={playlist.coverArt || "/default-playlist-image.png"}
        alt={playlist.name}
        width={300}
        height={300}
        className="rounded-lg mb-4 w-128 h-128 aspect-square object-cover shadow-lg"
      />
      <h1 className="text-4xl font-bold mb-4">{playlist.name}</h1>
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Image
            src={"https://smtdqezdamcycolojywa.supabase.co/storage/v1/object/public/avatars/" + (playlistOwnerImage || "default-avatar.png")}
            alt={playlistOwnerName || "Playlist Owner"}
            width={20}
            height={20}
            className="rounded-full w-[20px] h-[20px] object-cover shadow-sm"
          />
          <span className="text-base font-normal">{playlistOwnerName || "Unknown"}</span>
        </div>
      </div>
      <div className="max-w-2xl mb-2">
        <ExpandableDescription
          text={playlist.description || "No description"}
          truncateLength={300}
        />
      </div>
      
      <div className="flex gap-4">
        {isUsersPlaylist ? (
          <Button
            onClick={() => setShowEditPlaylist(!showEditPlaylist)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit Playlist
          </Button>
        ) : savedPlaylist ? (
          <Button
            onClick={unSavePlaylist}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Remove from Library
          </Button>
        ) : (
          <Button
            onClick={savePlaylist}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save to Library
          </Button>
        )}
      </div>
      {showEditPlaylist && isUsersPlaylist && (
        // Edit playlist form
        <div className="mt-4">
          <h2 className="text-2xl font-semibold mb-2">Edit Playlist</h2>
          <form className="" onSubmit={editDetails}>
            <input
              type="text"
              defaultValue={playlist.name}
              placeholder="Title"
              className="border p-2 rounded mb-2 w-full"
              name="name"
              required
            />
            <input
              type="url"
              defaultValue={playlist.coverArt}
              placeholder="Cover Art URL (128x128)"
              className="border p-2 rounded w-full"
              name="coverArt"
            />
            <span className="text-gray-500">
              Accepted websites (google, pinterest, unsplash, discord, pixabay)
            </span>

            <textarea
              defaultValue={playlist.description}
              placeholder="Description goes here"
              className="border p-2 rounded w-full mt-2"
              name="description"
            />
            {/* Visibility Dropdown */}
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value)}
            >
              <SelectTrigger className="w-full mb-2">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center">
                    <Eye className="mr-2 w-4 h-4" />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center">
                    <Lock className="mr-2 w-4 h-4" />
                    Private
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Button to open add song menu */}
            <Button
              type="button"
              onClick={addSongMenu}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Song
            </Button>
            {/* Save changes button */}
            <Button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded ml-3"
            >
              Save Changes
            </Button>
          </form>
        </div>
      )}
      {/* Playlist songs section */}
      <div className="mt-6 w-full max-w-screen">
        <h2 className="text-2xl font-semibold mb-4">Songs in Playlist</h2>
        {songs && songs.length > 0 ? (
          <>
            <ul className="space-y-2">
              {isUsersPlaylist ? (
                <SongList
                  songs={songs}
                  onAddSong={addSongMenu}
                  onDeletePlaylist={() => setShowDeleteConfirmation(true)}
                  onRemoveFromPlaylist={(song) => setSongToRemove(song)}
                />
              ) : (
                <SongList songs={songs} />
              )}
            </ul>
          </>
        ) : (
          <p className="text-gray-500">No songs in this playlist.</p>
        )}
      </div>
      {/* Delete Playlist Modal Window */}
      <AlertDialog
        open={!!songToRemove}
        onOpenChange={(isOpen) => !isOpen && setSongToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove the song
              <span className="font-semibold text-white">
                {" "}
                {songToRemove?.name}{" "}
              </span>
              from this playlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSongToRemove(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (songToRemove) {
                  removeSong(songToRemove.id);
                }
                setSongToRemove(null); // Close dialog after action
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <span className="font-semibold text-white">
                {" "}
                {playlist?.name}{" "}
              </span>
              playlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={deletePlaylist}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Song Modal */}
      {showAddSong && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Add Songs to Playlist</h3>
              <Button variant="ghost" onClick={() => setShowAddSong(false)}>
                X
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search for songs..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="border p-2 rounded w-full"
                />
              </div>
              <ul className="space-y-2">
                {userSavedSongs &&
                userSavedSongs.length > 0 &&
                filteredSongs &&
                filteredSongs.length > 0 ? (
                  filteredSongs.map((song) => (
                    <li
                      key={song.id}
                      className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700"
                    >
                      <div>
                        <div className="flex items-center">
                          <img
                            src={song.coverArt || "/placeholder-song.png"}
                            alt={song.name}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <p className="font-semibold">{song.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {song.artist}
                            </p>
                          </div>
                        </div>
                      </div>
                      {playlist && playlist.songs?.includes(song.id) ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSongToRemove(song);
                          }}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => addToPlaylist(song)}
                        >
                          Add
                        </Button>
                      )}
                    </li>
                  ))
                ) : (
                  <p>No Results</p>
                )}
              </ul>
            </div>
            <div className="mt-6 text-right">
              <Button onClick={() => setShowAddSong(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
