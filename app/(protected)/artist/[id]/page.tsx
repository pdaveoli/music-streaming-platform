"use client";

import React, { useState, useEffect } from "react";
import type { PageProps } from "@/.next/types/app/page";
import { getArtistById, getSongsFromArtist, getAlbumsFromArtist, Artist, Song, Album } from "@/app/client-actions";
import { toast } from "sonner";
import Link from "next/link";
import AlbumList from "@/components/album-list";
import { SongList } from "@/components/song-list";
import Image from "next/image";
import { ExpandableDescription } from "@/components/ExpandableDescription";

/// <summary>
/// ArtistPage component that displays artist details, albums, and top songs.
/// It fetches artist data, albums, and songs from the server using client-side actions.
/// </summary>
/// <remarks>
/// This component uses client-side rendering to fetch data securely.
/// It handles loading states and errors gracefully.
/// </remarks>
export default function ArtistPage(props: PageProps) {

    // Client-side state management
    const [artist, setArtist] = useState<Artist | null>(null);
    const [albums, setAlbums] = useState<Album[] | null>([]);
    const [songs, setSongs] = useState<Song[] | null>([]);
    const [loading, setLoading] = useState(true);

    // Fetch artist data, albums, and songs when the component mounts
    useEffect(() => {
        const loadData = async() => {
            try {
                const { id } = await props.params;
                if (!id) {
                    window.location.href = "/home";
                    return;
                }
                // Fetch artist data by ID
                const artistData = await getArtistById(id);
                if (!artistData) {
                    setArtist(null);
                    setLoading(false);
                    return;
                }
                setArtist(artistData);
                // Get albums and songs for the artist
                const albumsData = await getAlbumsFromArtist(artistData.name);
                setAlbums(albumsData);
                const songsData = await getSongsFromArtist(artistData.name);
                setSongs(songsData);
                setLoading(false);
            } catch (error) {
                console.error("Error loading artist data:", error);
                toast.error("Failed to load artist data. Please try again later.");
                setArtist(null);
                setAlbums(null);
                setSongs(null);
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // If loading, show a loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="animate-pulse space-y-4">
                    <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                    <div className="w-64 h-6 bg-gray-200 rounded"></div>
                    <div className="w-48 h-6 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // If artist not found, show a message
    if (!artist) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">Artist not found</h1>
                <p className="text-gray-500">The artist you are looking for does not exist.</p>
                <Link href="/discover" className="text-blue-500 hover:underline mt-4">
                    Go back to Discover
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 w-full">
            <div className="max-w-6xl mx-auto">
                {/* Artist Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                    <Image
                        src={artist.pictureUrl}
                        alt={artist.name}
                        width={200}
                        height={200}
                        className="w-48 h-48 object-cover rounded-full flex-shrink-0 shadow-lg"
                    />
                    <div className="flex flex-col items-center md:items-start flex-1 pt-4">
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 text-center md:text-left">{artist.name}</h1>
                        
                        {/* Artist metadata */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                            <p><span className="font-semibold text-foreground">Genre:</span> {artist.genre}</p>
                            <p><span className="font-semibold text-foreground">Started:</span> {artist.started}</p>
                            <p><span className="font-semibold text-foreground">From:</span> {artist.from}</p>
                        </div>

                        {/* Artist Description */}
                        <div className="w-full text-center md:text-left">
                            <ExpandableDescription truncateLength={500} text={artist.description} />
                        </div>
                    </div>
                </div>

                {/* Albums and Songs */}
                <div className="w-full">
                    <h2 className="text-2xl font-semibold mb-4">Albums</h2>
                    <div>
                        {albums?.length ? (
                            <AlbumList albums={albums} />
                        ) : (
                            <p className="text-muted-foreground">No albums found for this artist.</p>
                        )}
                    </div>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Top Songs</h2>
                    <div>
                        {songs?.length ? (
                            <SongList songs={songs} />
                        ) : (
                            <p className="text-muted-foreground">No songs found for this artist.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

}