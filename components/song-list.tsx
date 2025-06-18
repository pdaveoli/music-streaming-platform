"use client";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { Song } from "@/app/actions";
import { useAudio } from "@/context/AudioContext";
import { toast } from "sonner"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function SongList({ songs }: { songs: Song[] }) {
  // This function will run in the browser when a button is clicked
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
}

  const handleAddToQueue = (song: Song, next: boolean) => {
    addToQueue(song, next);
    // Optionally, you can show a toast or notification here to confirm the action
    toast("Added to queue");
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:p-8 w-full mx-auto">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full mb-4" onClick={handleShuffleAll}>
            Shuffle All
        </Button>
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
            </ContextMenuContent>
          </ContextMenu>
        </div>
      ))}
    </div>
  );
}
