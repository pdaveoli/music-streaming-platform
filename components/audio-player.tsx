"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ForwardIcon,
  PlayIcon,
  RewindIcon,
  UploadIcon,
  PauseIcon,
} from "lucide-react";
import Image from "next/image";

// Code modified from (https://asharibali.medium.com/building-an-audio-player-app-with-next-js-80d06cc1d7d8) to implement audio player

interface AudioPlayerProps {}

interface Track {
    title: string;
    artist: string;
    cover: string;
    src: string;
}

const AudioPlayer : React.FC<AudioPlayerProps> = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newTracks: Track[] = Array.from(files).map(file => ({
                title: file.name,
                artist: "Unknown Artist",
                cover: "/default-cover.jpg", // Placeholder cover image
                src: URL.createObjectURL(file),
            }));
            setTracks(prevTracks => [...prevTracks, ...newTracks]);
        }
    }

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    const handleNext = () => {
        if (tracks.length <= 1) {
            // Restart the current audio if it exists
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
                setProgress(0);
                
                if (isPlaying) {
                    audioRef.current.play();
                }
            }
            return;
        }
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    };
    
    const handlePrev = () => {
        if (tracks.length <= 1) {
            // Restart the current audio if it exists
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
                setProgress(0);
                
                if (isPlaying) {
                    audioRef.current.play();
                }
            }
            return;
        }
        setCurrentTrackIndex((prevIndex) => prevIndex === 0 ? tracks.length - 1 : prevIndex - 1);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);

            if (audioRef.current.ended) {
                handleNext(); // Automatically play the next track when the current one ends
            }
        }
    }
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
            // TODO: Implement more metadata
        }
    }; 
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
        if (progressBarRef.current && audioRef.current) {
            const progressRect = progressBarRef.current.getBoundingClientRect();
            const seekPosition = (event.clientX - progressRect.left) / progressRect.width;
            const seekTime = seekPosition * duration;
            
            audioRef.current.currentTime = seekTime;
            setCurrentTime(seekTime);
            setProgress(seekPosition * 100);
        }
    };

    // This effect runs only when the track changes
    useEffect(() => {
        if (audioRef.current && tracks.length > 0) {
            audioRef.current.pause();
            audioRef.current.src = tracks[currentTrackIndex]?.src || "";
            audioRef.current.load();
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            setProgress(0);
            if (isPlaying) {
                audioRef.current.play();
            }
        }
    }, [currentTrackIndex, tracks]);
    
    // This effect handles play/pause state changes separately
    useEffect(() => {
        if (audioRef.current && tracks.length > 0) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <div className="max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Audio Player</h1>
          <label className="flex items-center cursor-pointer">
            <UploadIcon className="w-5 h-5 mr-2" />
            <span>Upload</span>
            <input
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
            <Image
              src="/music.svg"
              alt="Album Cover"
              width={100}
              height={100}
              className="rounded-full w-32 h-32 object-cover"
            />
            <div className="text-center">
              <h2 className="text-xl font-bold">
                {tracks[currentTrackIndex]?.title || "Audio Title"}
              </h2>
              <p className="text-muted-foreground">
                {tracks[currentTrackIndex]?.artist || "Person Name"}
              </p>
            </div>
            <div className="w-full" ref={progressBarRef} onClick={handleSeek} style={{ cursor: 'pointer' }}>
              <Progress value={progress} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handlePrev}>
                <RewindIcon className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePlayPause}>
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ForwardIcon className="w-6 h-6" />
              </Button>
            </div>
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AudioPlayer;