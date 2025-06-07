"use client";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { Song } from "@/app/actions";
import { useAudio } from "@/context/AudioContext";

export function SongList({ songs }: { songs: Song[] }) {
    // This function will run in the browser when a button is clicked
    const { loadTracks, playTrack, currentTrackIndex, tracks, togglePlayPause, isPlaying } = useAudio(); // Call useAudio at the top level

    const handlePlayClick = (song: Song, index: number) => {
        // Use the audio context to play the song
        const currentTrack = tracks[currentTrackIndex ?? -1];
        if (currentTrack?.id === song.id) {
            togglePlayPause();
        } else {
            loadTracks(songs); // Load all songs in the list
            playTrack(index); // Play the clicked song by its index in the new list
        }
        
    };

    return (
        <div className="grid grid-cols-1 gap-4 p-4 md:p-8 w-full mx-auto">
            {songs.map((song, index) => (
                <div
                    key={song.id}
                    // Use flex and justify-between to push the button to the right
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between"
                >
                    {/* Left side: Image and Song Info */}
                    <div className="flex items-center overflow-hidden">
                        <img
                            src={song.coverArt || '/placeholder-song.png'}
                            alt={song.name}
                            className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                            <h2 className="text-xl font-semibold truncate text-white">{song.name}</h2>
                            <div className="flex items-center text-sm text-gray-300 space-x-2">
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
                            className="bg-green-500 hover:bg-green-600 rounded-full p-3"
                        >
                            <Play className="h-5 w-5 text-white" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}