"use client";

import React, {
  useState,
  useEffect,
  useRef,
  MouseEvent,
  ChangeEvent,
} from "react";
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  FastForwardIcon,
  Volume2Icon,
  Volume1Icon,
  VolumeXIcon,
  ShuffleIcon,
  RepeatIcon,
  Repeat1Icon,
  MicVocalIcon, // For lyrics button
  HomeIcon,
  ListMusicIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext"; // Adjust path as needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // If you use Avatar
import type { Song } from "@/app/client-actions";
// context menu components
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner"
// Helper functions (assuming these are still defined or imported correctly)
// If these are defined in another file, ensure they are imported.
// For this example, I'll assume they are available in this scope or imported.
function parseLyrics(lrcContent: string): { time: number; text: string }[] {
  // Changed regex to use numbered capturing groups instead of named ones
  const regex = /^\[(\d{2}:\d{2}(?:\.\d{2,3})?)\](.*)/;
  const lines = lrcContent.split("\n");
  const output: { time: number; text: string }[] = [];

  function parseTime(timeStr: string) {
    const parts = timeStr.split(":");
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }

  lines.forEach((line) => {
    const match = line.match(regex);
    // Access groups by index: match[1] for time, match[2] for text
    if (match && match[1] && match[2] !== undefined) {
      const time = match[1];
      const text = match[2];
      if (text.trim() !== "") {
        output.push({ time: parseTime(time), text: text.trim() });
      }
    }
  });
  return output;
}

function findCurrentLyricIndex(
  lyrics: { time: number; text: string }[],
  time: number
): number | null {
  if (!lyrics || lyrics.length === 0) return null;
  let currentIdx = null;
  for (let i = 0; i < lyrics.length; i++) {
    if (time >= lyrics[i].time) {
      if (i + 1 < lyrics.length && time < lyrics[i + 1].time) {
        currentIdx = i;
        break;
      } else if (i + 1 === lyrics.length) {
        currentIdx = i;
        break;
      }
    }
  }
  if (currentIdx === null && lyrics.length > 0 && time < lyrics[0].time) {
    return -1; // Special index for "before first lyric"
  }
  return currentIdx;
}

export default function PersistentAudioPlayerUI() {
  const {
    tracks,
    currentTrackIndex,
    loadTracks,
    isPlaying,
    progress,
    currentTime,
    duration,
    audioRef,
    togglePlayPause,
    playNext,
    playPrev,
    playTrack,
    seek,
    toggleRepeat,
    toggleShuffle,
    shuffle,
    repeat,
    removeFromQueue,
    // loadTracks, // Assuming loadTracks is used elsewhere or not directly in UI
  } = useAudio();

  const [isMounted, setIsMounted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Lyrics specific state
  const [syncedLyrics, setSyncedLyrics] = useState<
    { time: number; text: string }[]
  >([]);
  const [lyricsCurrentIndex, setLyricsCurrentIndex] = useState<
    number | null | -1
  >(null); // Use -1 for before first lyric
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Refs for scrolling lyrics
  const lyricsScrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricLineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Initial volume setup if needed
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioRef, volume]);

  const currentTrack =
    currentTrackIndex !== null && tracks[currentTrackIndex]
      ? tracks[currentTrackIndex]
      : null;

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    const progressBar = event.currentTarget;
    if (duration && isFinite(duration)) {
      const rect = progressBar.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const newTime = (x / rect.width) * duration;
      seek(newTime);
    }
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      audioRef.current.muted = newMutedState;
      if (!newMutedState && volume === 0) {
        // If unmuting and volume was 0, set to a default
        setVolume(0.5);
        audioRef.current.volume = 0.5;
      }
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeXIcon className="w-5 h-5" />;
    if (volume < 0.5) return <Volume1Icon className="w-5 h-5" />;
    return <Volume2Icon className="w-5 h-5" />;
  };

  // Effect to fetch and parse lyrics when currentTrack changes
  useEffect(() => {
    if (currentTrack && currentTrack.lyricsUrl) {
      fetch(currentTrack.lyricsUrl)
        .then((response) => {
          if (!response.ok)
            throw new Error(`Failed to fetch lyrics: ${response.statusText}`);
          return response.text();
        })
        .then((lrcContent) => {
          const parsed = parseLyrics(lrcContent);
          setSyncedLyrics(parsed);
          setLyricsCurrentIndex(
            findCurrentLyricIndex(parsed, currentTime ?? 0)
          ); // Initialize index
        })
        .catch((error) => {
          console.error("Error fetching or parsing lyrics:", error);
          setSyncedLyrics([]);
        });
    } else {
      setSyncedLyrics([]);
    }
  }, [currentTrack, currentTime]); // Added currentTime to re-calc initial index if track loads after time starts

  // Effect to update current lyric index based on currentTime
  useEffect(() => {
    if (syncedLyrics.length > 0 && currentTime !== undefined) {
      const index = findCurrentLyricIndex(syncedLyrics, currentTime);
      if (index !== lyricsCurrentIndex) {
        setLyricsCurrentIndex(index);
      }
    }
  }, [currentTime, syncedLyrics, lyricsCurrentIndex]);

  // Effect to scroll the active lyric into view (centered)
  useEffect(() => {
    if (
      showLyrics &&
      activeLyricLineRef.current &&
      lyricsScrollContainerRef.current
    ) {
      activeLyricLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center", // This centers the lyric line vertically
        inline: "nearest",
      });
    }
  }, [lyricsCurrentIndex, showLyrics]); // Trigger on index change or when lyrics panel becomes visible

  let queue: Song[] = [];
  if (currentTrackIndex !== null) {
    // make the queue variable the tracks split from the currentTrackIndex
    queue = tracks.slice(currentTrackIndex + 1);
  }
  const toggleQueue = () => {
    if (currentTrackIndex) queue = tracks.slice(currentTrackIndex + 1);
    // Toggle the queue visibility
    setShowQueue((prev) => !prev);
  };

  const handlePlayClick = (song: Song) => {
    // Find song in queue
    const songIndex = tracks.findIndex((track) => track.id === song.id);
    if (songIndex !== -1) {
      // If song is already in queue, play it
      if (currentTrackIndex === songIndex) {
        togglePlayPause(); // Toggle play/pause if it's the current track
      } else {
        // Load the new track order: selected track first, then tracks after it, then tracks before it
        const selectedTrack = tracks[songIndex];
        const tracksAfterSelected = tracks.slice(songIndex + 1); // All tracks after the selected one
        const tracksBeforeSelected = tracks.slice(0, songIndex); // All tracks before the selected one

        // Combine: selected track + tracks after + tracks before
        const newTracks = [
          selectedTrack,
          ...tracksAfterSelected,
          ...tracksBeforeSelected,
        ];

        // set tracks
        loadTracks(newTracks);
        playTrack(0);
      }
    }
  };

  const handleRemoveFromQueue = (song: Song) => {
    // Check song is in queue
    const songIndex = queue.findIndex((track) => track.id === song.id);
    if (songIndex !== -1) {
      // Remove the song from the queue
      removeFromQueue(song);
      // Optionally, you can show a toast or notification here to confirm the action
      toast("Removed from queue");
    }
  };
  

  if (!isMounted) {
    // Simplified loading skeleton for the player bar
    return (
      <div className="fixed top-0 right-0 md:left-64 left-0 bg-background/80 backdrop-blur-md border-b p-3 shadow-lg z-50 flex items-center justify-center min-h-[80px]">
        <p className="text-muted-foreground">Loading Player...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="fixed top-0 right-0 md:left-64 left-0 bg-background/80 backdrop-blur-md border-b p-3 shadow-lg z-50">
        <div className="w-full flex items-center justify-between gap-3 h-[60px]">
          <p className="flex-grow text-center text-sm text-muted-foreground">
            Select a track to play
          </p>
          <div className="w-10 h-10"></div> {/* Spacer */}
        </div>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="fixed top-0 right-0 md:left-64 left-0 bg-background/80 backdrop-blur-md border-b p-3 shadow-lg z-50">
        <div className="w-full flex items-center justify-between gap-3 h-[60px]">
          <p className="text-sm text-muted-foreground flex-grow text-center">
            No track selected.
          </p>
          <div className="w-10 h-10"></div> {/* Spacer */}
        </div>
      </div>
    );
  }

  // Main player UI
  return (
    <div className="fixed top-0 right-0 md:left-64 left-0 bg-background/80 backdrop-blur-md border-b p-3 shadow-lg z-50">
      <div className="w-full flex items-center justify-between h-[60px]">
        <div className="flex items-center gap-3 justify-center flex-grow min-w-0 px-4">
          <Image
            src={currentTrack.coverArt || "/music.svg"}
            alt={currentTrack.name || "Album Cover"}
            width={56}
            height={56}
            className="rounded-md object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-sm truncate"
              title={currentTrack.name}
            >
              {currentTrack.name}
            </h3>
            <p
              className="text-xs text-muted-foreground truncate"
              title={currentTrack.artist}
            >
              {currentTrack.artist}
            </p>
            <div
              className="w-full mt-1 group"
              onClick={handleSeek}
              style={{ cursor: "pointer" }}
            >
              <Progress
                value={progress}
                className="h-1 group-hover:h-1.5 transition-all"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {" "}
            {/* Adjusted gap for responsiveness */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShuffle}
              title="Shuffle"
            >
              <ShuffleIcon
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  shuffle ? "text-green-400" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRepeat}
              title="Repeat"
            >
              <RepeatIcon
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  repeat ? "text-green-400" : ""
                }`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {" "}
            {/* Adjusted gap */}
            <Button
              variant="ghost"
              size="icon"
              onClick={playPrev}
              title="Previous"
            >
              <RewindIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              title={isPlaying ? "Pause" : "Play"}
              className="w-8 h-8 sm:w-10 sm:h-10"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} title="Next">
              <FastForwardIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {getVolumeIcon()}
          </Button>
          <Input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1.5 accent-primary cursor-pointer"
            title="Volume"
          />
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              title="Lyrics"
              onClick={() => setShowLyrics(!showLyrics)}
              className={showLyrics ? "text-green-400" : ""}
            >
              <MicVocalIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Queue"
              onClick={toggleQueue}
              className={showQueue ? "text-green-400" : ""}
            >
              <ListMusicIcon className="w-5 h-5" />
            </Button>
            {showLyrics && (
              <div
                // Ensure this line uses backdrop-blur-* and not blur-*
                className="absolute top-full right-0 mt-2 w-80 sm:w-96 md:w-[480px] 
                           bg-gray-800/50 dark:bg-black/40 backdrop-blur-lg 
                           border border-gray-700 dark:border-gray-600
                           rounded-xl shadow-2xl z-20
                           flex flex-col
                           max-h-[70vh]
                           overflow-hidden
                           "
              >
                <div className="p-3 border-b border-gray-700 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-center text-gray-200 dark:text-gray-300 truncate">
                    {currentTrack.name} - Lyrics
                  </h4>
                </div>
                <div
                  ref={lyricsScrollContainerRef}
                  className="flex-grow p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar"
                >
                  {syncedLyrics.length > 0 ? (
                    syncedLyrics.map((lyric, index) => {
                      const isActive = lyricsCurrentIndex === index;
                      const isPast =
                        lyricsCurrentIndex !== null &&
                        lyricsCurrentIndex !== -1 &&
                        index < lyricsCurrentIndex;

                      let lineClasses =
                        "lyric-line transition-all duration-50 ease-in-out text-center rounded-md p-1"; // Added padding for potential bg highlight

                      if (isActive) {
                        lineClasses +=
                          " text-xl sm:text-2xl md:text-3xl font-semibold text-white opacity-100 scale-90"; // Active: bright white, bold
                      } else if (isPast) {
                        lineClasses +=
                          " text-base sm:text-lg text-gray-500 dark:text-gray-600 opacity-50"; // Past: dimmer, smaller
                      } else {
                        // Future lines
                        lineClasses +=
                          " text-base sm:text-lg text-gray-400 dark:text-gray-500 opacity-70"; // Future: less dim
                      }

                      return (
                        <p
                          key={`${lyric.time}-${index}`}
                          ref={isActive ? activeLyricLineRef : null}
                          className={lineClasses} // Ensure no blur class is applied here directly
                        >
                          {lyric.text}
                        </p>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-10">
                      {currentTrack.lyricsUrl
                        ? "Loading lyrics..."
                        : "No lyrics available for this track."}
                    </p>
                  )}
                </div>
              </div>
            )}

            {showQueue && (
              <div
                className="absolute top-full right-0 mt-2 w-80 sm:w-96 md:w-[480px]
                           bg-gray-800/50 dark:bg-black/40 backdrop-blur-lg 
                           border border-gray-700 dark:border-gray-600
                           rounded-xl shadow-2xl z-20
                           flex flex-col
                           max-h-[70vh]
                           overflow-hidden
                           "
              >
                <div className="p-3 border-b border-gray-700 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-center text-gray-200 dark:text-gray-300 truncate">
                    Current Queue
                  </h4>
                </div>
                <div className="flex-grow p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar">
                  {queue.map((track, index) => (
                    <div key={index}>
                      <ContextMenu>
                        <ContextMenuTrigger className="w-full flex items-center gap-3">
                          <Image
                            src={track.coverArt || "/music.svg"}
                            alt={track.name || "Album Cover"}
                            width={40}
                            height={40}
                            className="rounded-md object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5
                              className="font-semibold text-sm truncate"
                              title={track.name}
                            >
                              {track.name}
                            </h5>
                            <p
                              className="text-xs text-muted-foreground truncate"
                              title={track.artist}
                            >
                              {track.artist}
                            </p>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuItem
                            onClick={() => handlePlayClick(track)}
                          >
                            Play Now
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => handleRemoveFromQueue(track)}
                          >
                            Remove from Queue
                          </ContextMenuItem>
                          
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  ))}
                  {tracks.length === 0 && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-10">
                      No tracks in queue.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}