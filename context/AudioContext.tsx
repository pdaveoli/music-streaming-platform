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
    repeat: boolean;
    shuffle: boolean;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    playTrack: (index: number) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    playPrev: () => void;
    seek: (time: number) => void;
    loadTracks: (newTracks: Song[]) => void;
    toggleRepeat: () => void;
    toggleShuffle: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const [tracks, setTracks] = useState<Song[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [repeat, setRepeat] = useState<boolean>(false);
    const [shuffle, setShuffle] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const originalTracks = useRef<Song[]>([]); // Store original tracks instead of indices

    const loadTracks = (newTracks: Song[]) => {
        const wasPlaying = isPlaying;
        const oldTrackId = currentTrackIndex !== null && tracks[currentTrackIndex] ? tracks[currentTrackIndex].id : null;

        setIsPlaying(false); // Pause while loading new tracks
        setTracks(newTracks);
        
        // Store original order when loading new tracks
        originalTracks.current = [...newTracks];

        if (newTracks.length > 0) {
            // Try to find the previously playing track in the new list
            const newTrackIndexToSet = oldTrackId ? newTracks.findIndex(t => t.id === oldTrackId) : -1;

            if (newTrackIndexToSet !== -1) {
                setCurrentTrackIndex(newTrackIndexToSet);
            } else {
                setCurrentTrackIndex(0); // Default to first track if old track not found or no old track
            }
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

    const toggleRepeat = () => {
        setRepeat(prev => {
            const newRepeat = !prev;
            if (audioRef.current) {
                audioRef.current.loop = newRepeat;
            }
            return newRepeat;
        });
    };

    const toggleShuffle = () => {
        setShuffle(prev => {
            const newShuffle = !prev;
            
            if (newShuffle) {
                // When enabling shuffle
                if (currentTrackIndex !== null && tracks[currentTrackIndex]) {
                    const currentTrack = tracks[currentTrackIndex];
                    
                    // Create a copy of tracks without the current track
                    const otherTracks = tracks.filter((_, index) => index !== currentTrackIndex);
                    
                    // Shuffle the other tracks
                    const shuffledOtherTracks = [...otherTracks].sort(() => Math.random() - 0.5);
                    
                    // Put current track first, followed by shuffled other tracks
                    const newTrackOrder = [currentTrack, ...shuffledOtherTracks];
                    
                    setTracks(newTrackOrder);
                    setCurrentTrackIndex(0); // Current track is now at index 0
                }
            } else {
                // When disabling shuffle, restore original order
                if (originalTracks.current.length > 0) {
                    const currentTrackId = currentTrackIndex !== null && tracks[currentTrackIndex] ? tracks[currentTrackIndex].id : null;
                    
                    setTracks([...originalTracks.current]);
                    
                    // Find the current track in the original order
                    if (currentTrackId) {
                        const newIndex = originalTracks.current.findIndex(track => track.id === currentTrackId);
                        setCurrentTrackIndex(newIndex !== -1 ? newIndex : 0);
                    } else {
                        setCurrentTrackIndex(0);
                    }
                }
            }
            
            return newShuffle;
        });
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
                setIsPlaying(false);
            }
            return;
        }

        if (repeat) {
            // If repeat is enabled, restart the current track
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
                setProgress(0);
                if (isPlaying) {
                    audioRef.current.play().catch(error => console.error("Error playing audio:", error));
                }
            }
            return;
        }

        setCurrentTrackIndex(prevIndex => {
            if (prevIndex === null) return 0;
            const nextIndex = (prevIndex + 1) % tracks.length;
            return nextIndex;
        });
        
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
                setIsPlaying(false);
            }
            return;
        }

        if (repeat) {
            // If repeat is enabled, restart the current track
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
                setProgress(0);
                if (isPlaying) {
                    audioRef.current.play().catch(error => console.error("Error playing audio:", error));
                }
            }
            return;
        }
        
        setCurrentTrackIndex(prevIndex => {
            if (prevIndex === null) return tracks.length - 1;
            const nextIndex = prevIndex === 0 ? tracks.length - 1 : prevIndex - 1;
            return nextIndex;
        });
        
        if (!isPlaying) setIsPlaying(true);
    };
    
    const seek = (time: number) => {
        if (audioRef.current && isFinite(time)) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
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
                audio.load();
                setCurrentTime(0);
                setProgress(0);
            }

            if (isPlaying) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Error playing audio on track change:", error);
                        if (!trackChanged) {
                            setIsPlaying(false);
                        }
                    });
                }
            } else {
                audio.pause();
            }
        } else if (audio && (currentTrackIndex === null || tracks.length === 0)) {
            audio.src = "";
            audio.pause();
            setIsPlaying(false);
            setCurrentTime(0);
            setProgress(0);
            setDuration(0);
        }
    }, [currentTrackIndex, tracks, isPlaying]);

    // Effect for audio events (timeupdate, loadedmetadata, ended)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio.duration && isFinite(audio.currentTime) && isFinite(audio.duration)) {
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            } else {
                setCurrentTime(audio.currentTime);
                setProgress(0);
            }
        };

        const handleLoadedMetadata = () => {
            if (isFinite(audio.duration)) {
                setDuration(audio.duration);
            } else {
                setDuration(0);
            }
        };

        const handleEnded = () => {
            if (!repeat) {
                playNext(); // Automatically play the next track if not repeating
            }
        };

        const handleCanPlay = () => {
            if (isFinite(audio.duration)) {
                 setDuration(audio.duration);
            }
            if (isPlaying && currentTrackIndex !== null && tracks[currentTrackIndex] && audio.src === tracks[currentTrackIndex].url) {
                audio.play().catch(e => {
                    console.error("Error on canplay:", e);
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
    }, [playNext, isPlaying, currentTrackIndex, tracks, repeat]);

    return (
        <AudioContext.Provider value={{
            tracks, 
            currentTrackIndex, 
            isPlaying, 
            progress, 
            currentTime, 
            duration, 
            repeat,
            shuffle,
            audioRef,
            playTrack, 
            togglePlayPause, 
            playNext, 
            playPrev, 
            seek, 
            loadTracks,
            toggleRepeat,
            toggleShuffle
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
