"use client";

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import type { Song } from '@/app/actions'; // Adjust the import path as needed


interface AudioContextType {
    tracks: Song[];
    currentTrackIndex: number | null;
    isPlaying: boolean;
    progress: number;
    currentTime: number;
    duration: number;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    playTrack: (index: number) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    playPrev: () => void;
    seek: (time: number) => void;
    loadTracks: (newTracks: Song[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const [tracks, setTracks] = useState<Song[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const loadTracks = (newTracks: Song[]) => {
        const wasPlaying = isPlaying;
        const oldTrackId = currentTrackIndex !== null && tracks[currentTrackIndex] ? tracks[currentTrackIndex].id : null;

        setIsPlaying(false); // Pause while loading new tracks
        setTracks(newTracks);

        if (newTracks.length > 0) {
            // Try to find the previously playing track in the new list
            const newTrackIndexToSet = oldTrackId ? newTracks.findIndex(t => t.id === oldTrackId) : -1;

            if (newTrackIndexToSet !== -1) {
                setCurrentTrackIndex(newTrackIndexToSet);
                // If it was playing, and the track still exists, resume (will be handled by playTrack or useEffect)
                // if (wasPlaying) setIsPlaying(true); // Let playTrack handle this
            } else {
                setCurrentTrackIndex(0); // Default to first track if old track not found or no old track
            }
            // If it was playing, and autoPlay on load is desired, set isPlaying back to true
            // For now, let's require explicit play after loading new set of tracks
            // if (wasPlaying) setIsPlaying(true);
        } else {
            setCurrentTrackIndex(null);
            setCurrentTime(0);
            setProgress(0);
            setDuration(0);
            if(audioRef.current) {
                audioRef.current.src = "";
            }
        }
    };

    const playTrack = (index: number) => {
        if (index >= 0 && index < tracks.length) {
            if (currentTrackIndex === index && audioRef.current && !audioRef.current.src) {
                // If same track is "played" again and src is not set (e.g. after loadTracks with no autoplay)
                // We need to ensure the useEffect for track changes runs to set src and play.
                // Temporarily set to null and then back to trigger the effect.
                // Or, more directly, ensure the effect logic handles this.
                // For now, setting isPlaying to true should be sufficient as the effect for currentTrackIndex will run.
            }
            setCurrentTrackIndex(index);
            setIsPlaying(true); // This will trigger the useEffect to load and play
        }
    };

    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (currentTrackIndex === null && tracks.length > 0) {
            // If no track is selected, play the first one
            playTrack(0);
            return;
        }
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Ensure a track is loaded before trying to play
            if (currentTrackIndex !== null && tracks[currentTrackIndex]) {
                 audioRef.current.play().catch(error => console.error("Error playing audio:", error));
            } else if (tracks.length > 0) {
                // If currentTrackIndex is somehow null but tracks exist, play the first one
                playTrack(0);
                return;
            }
        }
        setIsPlaying(!isPlaying);
    };

    const playNext = () => {
        if (tracks.length === 0) return;

        if (tracks.length <= 1 && audioRef.current) {
            // Restart the current audio if it exists and it's the only track
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            setProgress(0);
            if (isPlaying) {
                audioRef.current.play().catch(error => console.error("Error playing audio:", error));
            } else {
                // If paused and skipping on a single track, just reset time, don't auto-play
                 setIsPlaying(false); // Ensure isPlaying reflects the actual state
            }
            return;
        }

        setCurrentTrackIndex(prevIndex => {
            if (prevIndex === null) return 0; // Should not happen if tracks.length > 0
            const nextIndex = (prevIndex + 1) % tracks.length;
            return nextIndex;
        });
        // setIsPlaying(true) is handled by the useEffect for currentTrackIndex change if auto-play is desired
        // For explicit next, we should ensure it plays
        if (!isPlaying) setIsPlaying(true); 
    };

    const playPrev = () => {
        if (tracks.length === 0) return;

        if (tracks.length <= 1 && audioRef.current) {
            // Restart the current audio if it exists and it's the only track
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            setProgress(0);
            if (isPlaying) {
                audioRef.current.play().catch(error => console.error("Error playing audio:", error));
            } else {
                // If paused and skipping on a single track, just reset time, don't auto-play
                setIsPlaying(false); // Ensure isPlaying reflects the actual state
            }
            return;
        }
        
        setCurrentTrackIndex(prevIndex => {
            if (prevIndex === null) return tracks.length - 1; // Should not happen
            const nextIndex = prevIndex === 0 ? tracks.length - 1 : prevIndex - 1;
            return nextIndex;
        });
        // setIsPlaying(true) is handled by the useEffect for currentTrackIndex change
        // For explicit prev, we should ensure it plays
        if (!isPlaying) setIsPlaying(true);
    };
    
    const seek = (time: number) => {
        if (audioRef.current && isFinite(time)) {
            audioRef.current.currentTime = time;
            setCurrentTime(time); // Update state immediately for responsiveness
            // Progress will be updated by the timeupdate event
        }
    };

    // Effect for handling track changes (src, load, play/pause)
    useEffect(() => {
        const audio = audioRef.current;
        if (audio && currentTrackIndex !== null && tracks[currentTrackIndex]) {
            const trackToPlay = tracks[currentTrackIndex];
            const trackChanged = audio.src !== trackToPlay.url;

            if (trackChanged) {
                audio.src = trackToPlay.url;
                audio.load(); // Important to load the new source
                setCurrentTime(0); // Reset time for new track
                setProgress(0);   // Reset progress for new track
                // Duration will be set by 'loadedmetadata' or 'canplay'
            }

            if (isPlaying) {
                // Attempt to play only if the source is set or has changed and loaded
                // The 'canplay' event listener also tries to play if isPlaying is true
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Error playing audio on track change:", error);
                        // Don't set isPlaying to false here if trackChanged,
                        // as it might be a temporary issue (e.g. not loaded yet)
                        // The 'canplay' event will try to play again.
                        // If it's not a new track, then it's a real play error.
                        if (!trackChanged) {
                            setIsPlaying(false);
                        }
                    });
                }
            } else {
                audio.pause();
            }
        } else if (audio && (currentTrackIndex === null || tracks.length === 0)) { // No tracks or no current track, clear src
            audio.src = "";
            audio.pause();
            setIsPlaying(false);
            setCurrentTime(0);
            setProgress(0);
            setDuration(0);
        }
    }, [currentTrackIndex, tracks, isPlaying]); // Added isPlaying back

    // Effect for isPlaying state changes (e.g., after togglePlayPause)
    // This effect might be redundant if the above effect correctly handles isPlaying.
    // Let's simplify and rely on the primary effect for track changes and isPlaying.
    /*
     useEffect(() => {
        const audio = audioRef.current;
        if (!audio || currentTrackIndex === null || !tracks[currentTrackIndex]) return;

        // Ensure src is set before trying to play/pause based on isPlaying
        if (audio.src !== tracks[currentTrackIndex].url && isPlaying) {
            // If src is not set and we want to play, the other effect should handle loading it.
            // This effect should primarily react to play/pause commands on an already loaded/loading track.
            return; 
        }

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Error in isPlaying effect (play):", error);
                    setIsPlaying(false);
                });
            }
        } else {
            audio.pause();
        }
    }, [isPlaying, currentTrackIndex, tracks]); // tracks dependency to re-evaluate if track list changes
    */
   // Removing the second useEffect for isPlaying as the first one now depends on isPlaying
   // and should handle the logic more cohesively.


    // Effect for audio events (timeupdate, loadedmetadata, ended)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio.duration && isFinite(audio.currentTime) && isFinite(audio.duration)) {
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            } else { // Handle cases like NaN duration initially
                setCurrentTime(audio.currentTime);
                setProgress(0);
            }
        };
        const handleLoadedMetadata = () => {
            if (isFinite(audio.duration)) {
                setDuration(audio.duration);
            } else {
                setDuration(0); // Or some placeholder
            }
        };
        const handleEnded = () => {
            playNext(); // Automatically play the next track
        };
        const handleCanPlay = () => {
            if (isFinite(audio.duration)) {
                 setDuration(audio.duration);
            }
            // If it was supposed to be playing, and src is now valid, try to play.
            // This is important if the initial play() in the other useEffect failed because data wasn't ready.
            if (isPlaying && currentTrackIndex !== null && tracks[currentTrackIndex] && audio.src === tracks[currentTrackIndex].url) {
                audio.play().catch(e => {
                    console.error("Error on canplay:", e);
                    // Potentially set isPlaying to false if play fails consistently
                    // setIsPlaying(false); 
                });
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [playNext, isPlaying, currentTrackIndex, tracks]); // Added currentTrackIndex and tracks

    return (
        <AudioContext.Provider value={{
            tracks, currentTrackIndex, isPlaying, progress, currentTime, duration, audioRef,
            playTrack, togglePlayPause, playNext, playPrev, seek, loadTracks
        }}>
            {children}
            {/* The actual audio element is hidden but controlled by the context */}
            <audio ref={audioRef} preload="metadata" />
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
