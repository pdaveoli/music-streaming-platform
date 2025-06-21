"use client";
import { Button } from "@/components/ui/button";
import { Play, Shuffle, Ellipsis } from "lucide-react";
import type { Song } from "@/app/actions";
import { useAudio } from "@/context/AudioContext";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
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

export function SongList({
  songs,
  hideControls,
}: {
  songs: Song[];
  hideControls?: boolean;
}) {
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
    if (!songToAdd) return;

    const supabase = createClient();
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

  return (
    <>
      <div className="grid grid-cols-1 gap-4 w-full mx-auto">
        <div className="flex justify-end items-center mb-4 gap-1">
          {!hideControls && (
            <>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full mb-4 "
                onClick={handleShuffleAll}
              >
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button className="bg-gray-500 hover:bg-gray-600 text-white rounded-full mb-4 ">
                <Ellipsis className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
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
                <ContextMenuItem onClick={() => handlePlayClick(song, index)}>
                  Play Now
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleAddToQueue(song, true)}>
                  Queue Next
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleAddToQueue(song, false)}>
                  Queue Last
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => handleOpenAddToPlaylist(song)}>
                  Add to Playlist
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        ))}
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
