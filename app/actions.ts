"use server";
import { createClient } from "@/lib/supabase/server";

// Song type
export interface Song {
    id: string;
    name: string;
    artist: string;
    coverArt: string;
    duration: string; // Duration metadata text
    genre: string; // Genre metadata text
    url: string; // URL to the song file
    lyricsUrl?: string; // URL to the lyrics file
    metadata?: {} // Not used currently
}

// Album metadata type
export interface AlbumMetadata {
    releaseDate: string; // Release date of the album
    label: string; // Record label of the album
    description: string; // Description of the album
}

export interface Album {
    id: string;
    name: string;
    artist: string;
    coverArt: string;
    genre: string; // Genre of the album
    songIds: string[]; // Array of song IDs in the album
    metadata: AlbumMetadata; // Additional metadata as an object
}

export interface Playlist {
    id: string;
    name: string;
    userId: string;
    songs: string[];
    coverArt: string;
    description: string;
    createdAt: string; // ISO date string
    public: number; // 0 for private, 1 for public
    sharedIds?: string[]; // Optional array of user IDs who can access this playlist
}

export interface Artist {
    id: string;
    name: string;
    description: string;
    pictureUrl: string; // URL to the artist's picture
    genre: string; // Genre of the artist
    started: string,
    from: string
}

/// <summary>
/// Gets all the albums by their IDs.
/// </summary>
/// <param name="ids">The IDs of the albums to retrieve.</param>
/// <returns>An array of Album objects.</returns>
export async function getAlbumsByIds(ids: string[]): Promise<Album[]> {
    let albums : Album[] = [];
    for (const id of ids) {
        const album = await getAlbumById(id);
        if (album) {
            albums.push(album);
        }
    }
    return albums;
}

/// <summary>
/// Checks if an album is saved in the user's library.
/// </summary>
/// <param name="userId">The ID of the user.</param>
/// <param name="albumId">The ID of the album to check.</param>
/// <returns>True if the album is saved, false otherwise.</returns>
export async function isAlbumSaved(userId: string, albumId: string): Promise<boolean> {
    const savedAlbums = (await getSavedAlbums(userId)).toString();
    return savedAlbums.includes(albumId.toString());
}

/// <summary>
/// Saves an album to the user's library.
/// </summary>
/// <param name="userId">The ID of the user.</param>
/// <param name="albumId">The ID of the album to save.</param>
/// <returns>Promise that resolves when the album is saved.</returns>
/// <remarks>
/// If the album is already saved, it will not be added again.
/// </remarks>
export async function saveAlbumToLibrary(userId: string, albumId: string) : Promise<void> {
    const savedAlbums = await getSavedAlbums(userId);
    const supabase = await createClient();
    
    // Check if the album is already saved
    if (savedAlbums.includes(albumId.toString())) {
        console.log("Album already saved to library.");
        return;
    }
    
    // Add the album to the user's saved albums
    const updatedAlbums = [...savedAlbums, albumId]; // Use spread operator instead of push

    const { error } = await supabase
        .from("users")
        .update({ library_albums: updatedAlbums })
        .eq("id", userId);
    
    if (error) {
        console.error("Error saving album to library:", error);
        return;
    }
    
    console.log("Album saved to library successfully.");
}

/// <summary>
/// Unsaves an album from the user's library.
/// </summary>
/// <param name="userId">The ID of the user.</param>
/// <param name="albumId">The ID of the album to unsave.</param>
/// <returns>Promise that resolves when the album is unsaved.</returns>
/// <remarks>
/// If the album is not saved, it will not be removed.
/// </remarks>
export async function unsaveAlbumFromLibrary(userId: string, albumId: string) : Promise<void> {
    const savedAlbums = await getSavedAlbums(userId);
    const supabase = await createClient();
    
    // Check if the album is already saved
    if (!savedAlbums.includes(albumId)) {
        console.log("Album not found in library.");
        return;
    }
    
    // Remove the album from the user's saved albums
    const updatedAlbums = savedAlbums.filter(id => id !== albumId);
    
    const { error } = await supabase
        .from("users")
        .update({ library_albums: updatedAlbums })
        .eq("id", userId);
    
    if (error) {
        console.error("Error unsaving album from library:", error);
        return;
    }
    
    console.log("Album unsaved from library successfully.");
}

/// <summary>
/// Gets the saved albums for a user.
/// </summary>
/// <param name="userId">The ID of the user.</param>
/// <returns>An array of album IDs saved by the user.</returns>
/// <remarks>
/// If the user has no saved albums, an empty array is returned.
/// </remarks>
export async function getSavedAlbums(userId: string): Promise<string[]> {
    const supabase = await createClient();
    
    console.log("getSavedAlbums: Looking for user with ID:", userId);
    
    
    const { data, error } = await supabase
        .from("users")
        .select("library_albums")
        .eq("id", userId);

    console.log("getSavedAlbums: Query result:", data);
    console.log("getSavedAlbums: Query error:", error);

    if (error) {
        console.error("Error fetching saved albums:", error);
        return [];
    }

    if (!data || data.length === 0) {
        console.error("No user found with ID:", userId);
        return [];
    }
    
    // Handle null values by returning empty array if library_albums is null
    return data[0]?.library_albums || [];
}

/// <summary>
/// Gets all artists from the database.
/// </summary>
/// <returns>An array of Artist objects.</returns>
export async function getArtists() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("artists")
        .select("*");
    if (error) {
        console.error("Error fetching artists:", error);
        return [];
    }
    return data;
}

/// <summary>
/// Gets all the songs from the database.
/// </summary>
/// <returns>An array of Song objects.</returns>
export async function getSongs() : Promise<Song[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("songs")
        .select("*");
    
    if (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
    
    return data;
}

/// <summary>
/// Gets all the albums from the database.
/// </summary>
/// <returns>An array of Album objects.</returns>
export async function getAlbums() : Promise<Album[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("albums")
        .select("*");
    
    if (error) {
        console.error("Error fetching albums:", error);
        return [];
    }
    
    return data;
}

/// <summary>
/// Gets a song object by its ID
/// </summary>
/// <param name="id">The ID of the song to retrieve.</param>
/// <returns>A Song object if found, otherwise null.</returns>
export async function getSongById(id: string) : Promise<Song | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", id)
        .single();
    
    if (error) {
        console.error(`Error fetching song with ID ${id}:`, error);
        return null;
    }
    
    return data;
}

/// <summary>
/// Gets an album object by its ID
/// </summary>
/// <param name="id">The ID of the album to retrieve.</param>
/// <returns>An Album object if found, otherwise null.</returns>
export async function getAlbumById(id: string) : Promise<Album | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", id)
        .single();
    
    if (error) {
        console.error(`Error fetching album with ID ${id}:`, error);
        return null;
    }
    
    return data;
}
/// <summary>
/// Gets a playlist object by its ID
/// </summary>
/// <param name="id">The ID of the playlist to retrieve.</param>
/// <returns>A Playlist object if found, otherwise null.</returns>
export async function getPlaylistById(id: string): Promise<Playlist | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", id)
        .single();
    
    if (error) {
        console.error(`Error fetching playlist with ID ${id}:`, error);
        return null;
    }
    
    return data;
}

/// <summary>
/// Gets users saved playlists
/// </summary>
/// <param name="userId">The ID of the user whose saved playlists to retrieve.</param>
/// <returns>An array of Playlist objects.</returns>
export async function getSavedPlaylists(userId: string): Promise<Playlist[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .select("playlists, id")
        .eq("id", userId);
    if (error) {
        console.error("Error fetching saved playlists:", error);
        return [];
    }
    if (!data || data.length === 0) {
        console.error("No user found with ID:", userId);
        return [];
    }
    console.log("getSavedPlaylists: Query result:", data);
    console.log("getSavedPlaylists: Query error:", error);
    let playlists : Playlist[] = [];
    
    // Last debug layer
    if (data[0].playlists === null || data[0].playlists.length === 0) {
        console.log("No playlists found for user:", userId);
        return [];
    }

    // Convert playlist IDs to Playlist objects
    for (const playlistId of data[0].playlists) {
        const playlist = await getPlaylistById(playlistId);
        if (playlist) {
            playlists.push(playlist);
        }
    }
    return playlists || [];    
}

/// <summary>
/// Gets all playlists from the database that are marked public.
/// </summary>
/// <returns>An array of Playlist objects.</returns>
export async function getPublicPlaylists(): Promise<Playlist[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("public", 1);

    if (error) {
        console.error("Error fetching public playlists:", error);
        return [];
    }

    return data;
}