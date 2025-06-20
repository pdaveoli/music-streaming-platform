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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Ellipsis, Play, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { useAudio } from "@/context/AudioContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ExpandableDescription } from "@/components/ExpandableDescription";

export default function PlaylistPage(props: PageProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [showAddSong, setShowAddSong] = useState(false);
  const [showEditPlaylist, setShowEditPlaylist] = useState(false);
  const [userSavedSongs, setUserSavedSongs] = useState<Song[]>([]);
  const [songToRemove, setSongToRemove] = useState<Song | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);

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
          .single(); // Using .single() is cleaner for fetching one record

        if (error) {
          throw new Error("Failed to fetch playlist");
        }

        setPlaylist(playlistData);

        if (playlistData && playlistData.songs) {
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

        // Load user's saved songs
        if (user.id) {
          const savedSongsData: Song[] = await getSavedSongs(user.id);
          setUserSavedSongs(savedSongsData);
        }
      } catch (error) {
        console.error("Error loading playlist:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [props.params]);

  const {
    loadTracks,
    playTrack,
    currentTrackIndex,
    tracks,
    togglePlayPause,
    isPlaying,
    addToQueue,
    changeShuffle,
    clearQueue,
  } = useAudio(); // Call useAudio at the top level

  const handlePlayClick = (song: Song, index: number) => {
    // Use the audio context to play the song
    const currentTrack = tracks[currentTrackIndex ?? -1];
    if (currentTrack?.id === song.id) {
      togglePlayPause();
    } else {
      // Create new track order: selected track first, then tracks after it, then tracks before it
      const selectedTrack = songs[index];
      const tracksAfterSelected = songs.slice(index + 1); // All tracks after the selected one
      const tracksBeforeSelected = songs.slice(0, index); // All tracks before the selected one

      // Combine: selected track + tracks after + tracks before
      const newTracks = [
        selectedTrack,
        ...tracksAfterSelected,
        ...tracksBeforeSelected,
      ];

      // Load the new tracks into the audio context
      loadTracks(newTracks);
      playTrack(0); // Play the first track (which is the selected one)
    }
  };

  const handleShuffleAll = () => {
    // Load all songs into the audio context and shuffle them
    if (songs.length === 0) {
      toast("No songs available to shuffle");
      return;
    }
    loadTracks([]);
    changeShuffle(false);
    loadTracks(songs);
    changeShuffle(true);
    playTrack(1);
  };

  const handleAddToQueue = (song: Song, next: boolean) => {
    addToQueue(song, next);
    // Optionally, you can show a toast or notification here to confirm the action
    toast("Added to queue");
  };
  const addToPlaylist = async (song: Song) => {
    // add song to playlist
    console.log("Adding song to playlist:", song);
    // check if song already exists in playlist
    if (playlist && playlist.songs && !playlist.songs.includes(song.id)) {
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
    } else if (playlist && playlist.songs && playlist.songs.includes(song.id)) {
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

  const editDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let updatedName = formData.get("name") as string;
    if (!updatedName) updatedName = playlist?.name || "Untitled Playlist"; // Fallback to current name if empty
    let updatedDescription = formData.get("description") as string;
    if (!updatedDescription)
      updatedDescription = playlist?.description || "No description available"; // Fallback to current description if empty
    let updatedCoverArt = formData.get("coverArt") as string;
    if (!updatedCoverArt) {
      updatedCoverArt = playlist?.coverArt || "/default-playlist-image.png"; // Fallback to current cover art if empty
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("playlists")
      .update({
        name: updatedName,
        description: updatedDescription,
        coverArt: updatedCoverArt,
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

  const removeSong = async (songId: string) => {
    console.log("Removing song with ID:", songId);
    if (!playlist || !playlist.songs) {
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

  const deletePlaylist = async () => {
    if (!playlist) {
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const addSongMenu = () => {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-8 mx-auto w-full h-screen">
        Loading...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-8 mx-auto w-full h-screen">
        No playlist found
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 mx-auto w-full min-h-screen">
      <Image
        src={playlist.coverArt || "/default-playlist-image.png"}
        alt={playlist.name}
        width={300}
        height={300}
        className="rounded-lg mb-4 w-128 h-128 object-cover shadow-lg"
      />
      <h1 className="text-4xl font-bold mb-4">{playlist.name}</h1>
      <div className="max-w-2xl mb-4">
        <ExpandableDescription
          text={playlist.description || "No description"}
          truncateLength={300}
        />
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => setShowEditPlaylist(!showEditPlaylist)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Edit Playlist
        </Button>
      </div>
      {showEditPlaylist && (
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
              placeholder="Cover Art URL (128x128) (sources: pintrest)"
              className="border p-2 rounded mb-2 w-full"
              name="coverArt"
              
            />
            
            <textarea
              defaultValue={playlist.description}
              placeholder="Description goes here"
              className="border p-2 rounded mb-2 w-full"
              name="description"
            />
            
            <Button
              type="button"
              onClick={addSongMenu}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Song
            </Button>
            <Button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded ml-3"
            >
              Save Changes
            </Button>
          </form>
        </div>
      )}
      <div className="mt-6 w-full max-w-screen">
        <h2 className="text-2xl font-semibold mb-4">Songs in Playlist</h2>
        {songs && songs.length > 0 ? (
          <>
            <div className="flex justify-end items-center mb-4 gap-1">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full mb-4 "
                onClick={handleShuffleAll}
              >
                <Shuffle className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gray-500 hover:bg-gray-600 text-white rounded-full mb-4 ">
                    <Ellipsis className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={addSongMenu}>
                    Add Songs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShuffleAll}>
                    Shuffle All
                  </DropdownMenuItem>
                  <DropdownMenuItem>Add to Playlist</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 focus:bg-red-100 dark:focus:bg-red-900/40"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    Delete Playlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <ul className="space-y-2">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  // Use flex and justify-between to push the button to the right
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between"
                >
                  <ContextMenu>
                    <ContextMenuTrigger className="w-full flex items-center">
                      {/* Left side: Image and Song Info */}
                      {/* Added flex-1 here to make this section take available space */}
                      <div className="flex items-center overflow-hidden flex-1">
                        <img
                          src={song.coverArt || "/placeholder-song.png"}
                          alt={song.name}
                          className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h2 className="text-xl font-semibold truncate text-white">
                            {song.name}
                          </h2>
                          <div className="flex items-center text-sm text-gray-300 space-x-2">
                            <span>{song.artist}</span>
                            <span>&bull;</span>
                            <span>{song.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Play Button */}
                      {/* Removed right-0, pl-4 provides spacing */}
                      <div className="pl-4">
                        <Button
                          onClick={() => handlePlayClick(song, index)}
                          className="bg-green-500 hover:bg-green-600 rounded-full p-3"
                        >
                          <Play className="h-5 w-5 text-white" />
                        </Button>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem
                        onClick={() => handlePlayClick(song, index)}
                      >
                        Play Now
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleAddToQueue(song, true)}
                      >
                        Queue Next
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleAddToQueue(song, false)}
                      >
                        Queue Last
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="text-red-500 focus:text-red-500 focus:bg-red-100 dark:focus:bg-red-900/40"
                        onClick={() => setSongToRemove(song)}
                      >
                        Remove from Playlist
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </div>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-gray-500">No songs in this playlist.</p>
        )}
      </div>

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
