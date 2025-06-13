"use client";

import React, { useEffect, useState } from "react";
import { useAudio } from "@/context/AudioContext"; // Assuming Track is exported from AudioContext or defined here
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  FastForwardIcon,
  Volume2Icon,
  VolumeXIcon,
  Volume1Icon,
  ShuffleIcon,
  RepeatIcon,
  Repeat1Icon,
  HomeIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
// This component is the actual persistent player UI
export default function PersistentAudioPlayerUI() {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    progress,
    currentTime,
    duration,
    audioRef,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    loadTracks,
  } = useAudio();

  const [isMounted, setIsMounted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (audioRef.current) {
      setVolume(audioRef.current.volume);
      setIsMuted(audioRef.current.muted);
    }
  }, [audioRef]);

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

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = event.currentTarget;
    if (duration && isFinite(duration)) {
      const progressRect = progressBar.getBoundingClientRect();
      const seekPosition =
        (event.clientX - progressRect.left) / progressRect.width;
      seek(seekPosition * duration);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleShuffle = () => {
    setIsShuffling(!isShuffling);
    if (isShuffling) {
      // If already shuffling, reset to normal order
      loadTracks(tracks); // Load tracks in original order
    } else {
      // Shuffle the tracks array
      const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
      loadTracks(shuffledTracks); // Load shuffled tracks
    }
  };

  const handleRepeat = () => {
    setIsRepeating(!isRepeating);
    if (audioRef.current) {
      audioRef.current.loop = !audioRef.current.loop;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !audioRef.current.muted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState && audioRef.current.volume === 0) {
        audioRef.current.volume = 0.5;
        setVolume(0.5);
      }
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeXIcon className="w-5 h-5" />;
    if (volume < 0.5) return <Volume1Icon className="w-5 h-5" />;
    return <Volume2Icon className="w-5 h-5" />;
  };

  // Render a placeholder or null during server render and initial client hydration phase
  if (!isMounted) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b p-3 shadow-lg h-[84px] z-50">
        <div className="max-w-5xl mx-auto flex items-center gap-3 h-full">
          {/* Home Button Placeholder */}
          <div className="w-9 h-9 bg-muted rounded-full animate-pulse"></div>
          <div className="w-14 h-14 bg-muted rounded-md animate-pulse"></div>
          <div className="flex-grow space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
            <div className="h-2 bg-muted rounded w-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-muted rounded-full animate-pulse"></div>
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
            <div className="w-9 h-9 bg-muted rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-muted rounded-full animate-pulse"></div>
            <div className="w-20 h-2 bg-muted rounded-full animate-pulse"></div>
          </div>
          <div className="w-9 h-9 bg-muted rounded-full animate-pulse"></div>{" "}
          {/* Placeholder for new URL input area */}
        </div>
      </div>
    );
  }
  // If no tracks are loaded yet, show a message prompting the user to select a track
  if (tracks.length === 0) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b p-3 shadow-lg z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 h-[60px]">
          <Link href="/home">
            <Button variant="ghost" size="icon" title="Home">
              <HomeIcon className="w-5 h-5" />
            </Button>
          </Link>
          <p className="flex-grow text-center text-sm text-muted-foreground">
            Select a track to play
          </p>
          {/* Spacer to balance the home button for centering the text */}
          <div className="w-10 h-10"></div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  // If tracks are loaded but no specific track is playing (e.g., initial state after loading tracks but not auto-playing)
  if (!currentTrack) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b p-3 shadow-lg z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 h-[60px]">
          <Link href="/home">
            <Button variant="ghost" size="icon" title="Home">
              <HomeIcon className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            No track selected. Press play or load another URL.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => tracks.length > 0 && togglePlayPause()}
              title="Play first track"
              disabled={tracks.length === 0}
            >
              <PlayIcon className="w-6 h-6" />
            </Button>
          </div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  // Main player UI
  return (
    <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b p-3 shadow-lg z-50">
      {/* This div now spans full width within the padding and uses justify-between */}
      <div className="w-full flex items-center justify-between h-[60px]">
        {/* Leftmost item: Home Button */}
        {/* Removed mr-6 as justify-between will handle spacing */}
        <Link href="/home">
          <Button variant="ghost" size="icon" title="Home">
            <HomeIcon className="w-5 h-5" />
          </Button>
        </Link>

        {/* Middle item: Group for core player elements */}
        {/* This group will sit between the Home button and Volume controls */}
        {/* Added w-[600px] (example fixed width, adjust as needed) and min-w-0 */}
        <div className="flex items-center gap-3 justify-center w-[600px] min-w-0">
          <Image
            src={currentTrack.coverArt || "/music.svg"}
            alt={currentTrack.name || "Album Cover"}
            width={56}
            height={56}
            className="rounded-md object-cover"
          />
          {/* Container for track info and progress bar */}
          {/* flex-1 allows it to take available space within this middle group. min-w-0 for truncation. */}
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
                className="h-1 group-hover:h-1.5 transition-all duration-150 ease-in-out"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5 px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          {/* Shuffle and Repeat buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShuffle}
              title="Shuffle"
            >
              {isShuffling ? (
                <ShuffleIcon className="w-5 h-5 text-blue-500" />
              ) : (
                <ShuffleIcon className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRepeat}
              title="Repeat"
            >
              {isRepeating ? (
                <Repeat1Icon className="w-5 h-5 text-blue-500" />
              ) : (
                <RepeatIcon className="w-5 h-5" />
              )}
            </Button>
          </div>
          {/* Main playback controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={playPrev}
              title="Previous"
            >
              <RewindIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              title={isPlaying ? "Pause" : "Play"}
              className="w-10 h-10"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} title="Next">
              <FastForwardIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Rightmost item: Volume Controls */}
        <div className="flex items-center gap-2">
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
            className="w-20 h-1.5 accent-primary cursor-pointer"
            title="Volume"
          />
        </div>
        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        {/* ... existing URL Input Section (if you re-enable it) ... */}
      </div>
    </div>
  );
}
