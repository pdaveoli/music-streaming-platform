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
    changeShuffle: (value: boolean) => void;
    addToQueue: (track: Song, next: boolean) => void;
    removeFromQueue: (track: Song) => void;
    clearQueue: () => void;
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
    const queuedTracks = useRef<Song[]>([]); // Keep track of manually queued songs

    const loadTracks = (newTracks: Song[]) => {

        if (!Array.isArray(newTracks)) {
            console.error("loadTracks expects an array of tracks");
            return;
        }
        if (newTracks == null || newTracks.length === 0) {
            console.warn("loadTracks called with empty or null tracks array");
            setTracks([]);
            setCurrentTrackIndex(null);
            setCurrentTime(0);
            setProgress(0);
            setDuration(0);
            if (audioRef.current) {
                audioRef.current.src = "";
            }
            return;
        }

        const wasPlaying = isPlaying;
        const oldTrackId = currentTrackIndex !== null && tracks[currentTrackIndex] ? tracks[currentTrackIndex].id : null;

        setIsPlaying(false); // Pause while loading new tracks
        setTracks(newTracks);
        
        // Store original order when loading new tracks and reset queue
        originalTracks.current = [...newTracks];
        queuedTracks.current = []; // Clear queue when loading new tracks

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

    const changeShuffle = (value: boolean) => {
        setShuffle(prev => {
            const newShuffleState = value;
            const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
            
            if (newShuffleState) {
                // Turning shuffle ON: combine original tracks with queued tracks, then shuffle
                const allTracks = [...originalTracks.current, ...queuedTracks.current];
                const shuffledTracks = [...allTracks];
                
                // Fisher-Yates shuffle
                for (let i = shuffledTracks.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledTracks[i], shuffledTracks[j]] = [shuffledTracks[j], shuffledTracks[i]];
                }
                
                setTracks(shuffledTracks);
                
                // Find the current track in the shuffled array
                if (currentTrack) {
                    const newIndex = shuffledTracks.findIndex(track => track.id === currentTrack.id);
                    setCurrentTrackIndex(newIndex !== -1 ? newIndex : 0);
                }
            } else {
                // Turning shuffle OFF: restore original order but keep queued tracks
                const allTracks = [...originalTracks.current, ...queuedTracks.current];
                setTracks(allTracks);
                
                // Find the current track in the unshuffled array
                if (currentTrack) {
                    const newIndex = allTracks.findIndex(track => track.id === currentTrack.id);
                    setCurrentTrackIndex(newIndex !== -1 ? newIndex : 0);
                }
            }
            
            return newShuffleState;
        });
    }

    const toggleShuffle = () => {
        setShuffle(prev => {
            const newShuffleState = !prev;
            const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
            
            if (newShuffleState) {
                // Turning shuffle ON: combine original tracks with queued tracks, then shuffle
                const allTracks = [...originalTracks.current, ...queuedTracks.current];
                const shuffledTracks = [...allTracks];
                
                // Fisher-Yates shuffle
                for (let i = shuffledTracks.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledTracks[i], shuffledTracks[j]] = [shuffledTracks[j], shuffledTracks[i]];
                }
                
                setTracks(shuffledTracks);
                
                // Find the current track in the shuffled array
                if (currentTrack) {
                    const newIndex = shuffledTracks.findIndex(track => track.id === currentTrack.id);
                    setCurrentTrackIndex(newIndex !== -1 ? newIndex : 0);
                }
            } else {
                // Turning shuffle OFF: restore original order but keep queued tracks
                const allTracks = [...originalTracks.current, ...queuedTracks.current];
                setTracks(allTracks);
                
                // Find the current track in the unshuffled array
                if (currentTrack) {
                    const newIndex = allTracks.findIndex(track => track.id === currentTrack.id);
                    setCurrentTrackIndex(newIndex !== -1 ? newIndex : 0);
                }
            }
            
            return newShuffleState;
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

    const addToQueue = (track: Song, next: boolean) => {
        // Add to our queued tracks reference
        queuedTracks.current.push(track);
        
        setTracks(prevTracks => {
            if (next && currentTrackIndex !== null) {
                // Insert after current track
                const newTracks = [...prevTracks];
                newTracks.splice(currentTrackIndex + 1, 0, track);
                return newTracks;
            } else {
                // Add to end
                return [...prevTracks, track];
            }
        });
        
        // Update current track index if we inserted before it
        if (next && currentTrackIndex !== null) {
            // No need to update currentTrackIndex since we inserted after current track
        }
    };

    const removeFromQueue = (track: Song) => {
        // Remove from queued tracks reference
        queuedTracks.current = queuedTracks.current.filter(t => t.id !== track.id);
        
        setTracks(prevTracks => {
            const trackIndex = prevTracks.findIndex(t => t.id === track.id);
            if (trackIndex === -1) return prevTracks;
            
            const newTracks = prevTracks.filter(t => t.id !== track.id);
            
            // Adjust current track index if necessary
            if (currentTrackIndex !== null && trackIndex <= currentTrackIndex) {
                setCurrentTrackIndex(prev => prev! - 1);
            }
            
            return newTracks;
        });
    };

    const clearQueue = () => {
        // Clear the entire queue
        if (currentTrackIndex === null) {
            setTracks([]); // If no track is currently playing, just clear tracks
        } else {
            setTracks(tracks[currentTrackIndex] !== null ? [tracks[currentTrackIndex]] : []); // Keep current track if exists
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
            toggleShuffle,
            addToQueue,
            removeFromQueue,
            clearQueue,
            changeShuffle
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
