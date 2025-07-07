"use client";
import { Button } from "@/components/ui/button";
import { Play, Shuffle, Ellipsis } from "lucide-react";
import type { Song } from "@/app/client-actions";
import { useAudio } from "@/context/AudioContext";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getUserEditablePlaylists } from "@/app/client-actions";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function SongList({
  songs,
  hideControls,
  onRemoveFromPlaylist,
  onAddSong,
  onDeletePlaylist,
}: {
  songs: Song[];
  hideControls?: boolean;
  onPlayClick?: (song: Song, index: number) => void;
  onAddToQueue?: (song: Song, next: boolean) => void;
  onRemoveFromPlaylist?: (song: Song) => void;
  onAddSong?: () => void;
  onDeletePlaylist?: () => void;
}) {
  const {
    loadTracks,
    playTrack,
    currentTrackIndex,
    tracks,
    togglePlayPause,
    addToQueue,
    changeShuffle
  } = useAudio();
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState<Song | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        // redirect to login
        window.location.href = "/auth/login";
        return;
      }
      setUserId(user?.id || "");
    }
    fetchUser();
  }, []);

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

  const handleOpenAddToPlaylist = async (song: Song) => {
    setSongToAdd(song);
    setIsAddToPlaylistOpen(true);
    setIsLoadingPlaylists(true);
    try {
      const playlists = await getUserEditablePlaylists(userId);
      setUserPlaylists(playlists);
    } catch (error) {
      toast.error("Failed to load your playlists.");
      console.error(error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    const supabase = createClient();
    
    if (!songToAdd) {
      // Add playlist, not song
      const { data: playlist, error: fetchError } = await supabase
        .from("playlists")
        .select("songs")
        .eq("id", playlistId)
        .single();
      if (fetchError || playlist === null) {
        toast.error("Could not find the selected playlist.");
        return;
      }

      // Add all the current songs to the playlist
      const currentSongs = playlist.songs || [];
      // Make sure the new songs don't already exist in the playlist
      let newSongs = songs.map(song => song.id);
      newSongs = newSongs.filter(songId => !currentSongs.includes(songId));   
      const updatedSongs = [...new Set([...currentSongs, ...newSongs])]; // Combine and remove duplicates
      
      

      const { error: updateError } = await supabase
        .from("playlists")
        .update({ songs: updatedSongs })
        .eq("id", playlistId);

      if (updateError) {
        toast.error("Failed to add songs to the playlist.");
      } else {
        toast.success(`Added ${newSongs.length} songs to the playlist!`);
        setIsAddToPlaylistOpen(false); // Close the dialog on success
      }
      return;
    }
      

    // First, get the current list of songs in the playlist
    const { data: playlistData, error: fetchError } = await supabase
      .from("playlists")
      .select("songs")
      .eq("id", playlistId)
      .single();

    if (fetchError) {
      toast.error("Could not find the selected playlist.");
      return;
    }

    const currentSongs = playlistData.songs || [];

    // Check if the song is already in the playlist
    if (currentSongs.includes(songToAdd.id)) {
      toast.info(`"${songToAdd.name}" is already in this playlist.`);
      return;
    }

    // Add the new song and update the playlist
    const updatedSongs = [...currentSongs, songToAdd.id];
    const { error: updateError } = await supabase
      .from("playlists")
      .update({ songs: updatedSongs })
      .eq("id", playlistId);

    if (updateError) {
      toast.error("Failed to add song to the playlist.");
    } else {
      toast.success(`Added "${songToAdd.name}" to the playlist!`);
      setIsAddToPlaylistOpen(false); // Close the dialog on success
    }
  };

  const handleAddToPlaylistFromPlaylist = async () => {
      if (songs.length === 0) {
        toast("No songs available to add to the playlist");
        return;
      }
      setIsAddToPlaylistOpen(true);
      setIsLoadingPlaylists(true);
      try {
        const playlists = await getUserEditablePlaylists(userId);
        setUserPlaylists(playlists);
      } catch (error) {
        toast.error("Failed to load your playlists.");
        console.error(error);
      } finally {
        setIsLoadingPlaylists(false);
      }
  };

  return (
    <>
      <div className="w-full">
        {!hideControls && (
          <div className="flex justify-end items-center mb-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleShuffleAll}
            >
              <Shuffle className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Ellipsis className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {onAddSong && (
                  <DropdownMenuItem onClick={() => onAddSong()}>
                    Add Songs
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={handleShuffleAll}>
                  Shuffle All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddToPlaylistFromPlaylist}>
                  Add to Playlist
                  </DropdownMenuItem>
                {onDeletePlaylist && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500 focus:bg-red-100 dark:focus:bg-red-900/40"
                      onClick={() => onDeletePlaylist()}
                    >
                      Delete Playlist
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
          </div>
        )}
        <div className="border-t">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="border-b" // Add bottom border for separation
            >
              <ContextMenu>
                <ContextMenuTrigger className="w-full flex items-center p-3 hover:bg-accent transition-colors">
                  {/* Left side: Image and Song Info */}
                  <div className="flex items-center overflow-hidden flex-1">
                    <img
                      src={song.coverArt || "/placeholder-song.png"}
                      alt={song.name}
                      className="w-12 h-12 object-cover rounded-md mr-4 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h2 className="font-semibold truncate text-foreground">
                        {song.name}
                      </h2>
                      <div className="flex items-center text-sm text-muted-foreground space-x-2">
                        <span>{song.artist}</span>
                        <span>&bull;</span>
                        <span>{song.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Play Button */}
                  <div className="pl-4">
                    <Button
                      onClick={() => handlePlayClick(song, index)}
                      variant="ghost" // Use ghost variant for no background
                      size="icon"
                      className="rounded-full"
                    >
                      <Play className="h-5 w-5" />
                    </Button>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem onClick={() => handlePlayClick(song, index)}>
                    Play Now
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleAddToQueue(song, true)}>
                    Queue Next
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleAddToQueue(song, false)}
                  >
                    Queue Last
                  </ContextMenuItem>
                  <ContextMenuItem
                    onSelect={() => handleOpenAddToPlaylist(song)}
                  >
                    Add to Playlist
                  </ContextMenuItem>
                  {onRemoveFromPlaylist && (
                    <>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      className="text-red-500 focus:text-red-500 focus:bg-red-100 dark:focus:bg-red-900/40"
                      onClick={() => onRemoveFromPlaylist(song)}
                    >
                      Remove from Playlist
                    </ContextMenuItem>
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add "{songToAdd?.name}" to a playlist</DialogTitle>
            <DialogDescription>
              Select one of your playlists below to add this song.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
            {isLoadingPlaylists ? (
              <p>Loading your playlists...</p>
            ) : userPlaylists.length > 0 ? (
              userPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => handleSelectPlaylist(playlist.id)}
                  className="p-3 rounded-md hover:bg-accent cursor-pointer flex items-center gap-4"
                >
                  <img
                    src={playlist.coverArt || "/default-playlist.png"}
                    alt={playlist.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div>
                    <p className="font-semibold">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {playlist.songs?.length || 0} songs
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>You don't have any playlists you can edit.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
