import { createClient } from "@/lib/supabase/client";

export interface Song {
    id: string;
    name: string;
    artist: string;
    coverArt: string;
    duration: string; // Duration metadata text
    genre: string; // Genre metadata text
    url: string; // URL to the song file
    lyricsUrl?: string; // Optional URL to the lyrics file
    metadata: {} // Additional metadata as an object
}

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
s
export async function getAlbumById(id: string): Promise<Album | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching album:", error);
        return null;
    }

    return data;
}

export async function getSongById(id: string): Promise<Song> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching song:", error);
        throw error;
    }

    return data;
}

export async function isAlbumSaved(userId: string, albumId: string): Promise<boolean> {
    const savedAlbums = (await getSavedAlbums(userId)).toString();
    console.log("Saved albums for user:", savedAlbums);
    console.log("Checking if album ID is saved:", albumId);
    return savedAlbums.includes(albumId.toString());
}

export async function getSavedAlbums(userId: string): Promise<string[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from("users")
        .select("library_albums")
        .eq("id", userId);

    if (error) {
        console.error("Error fetching saved albums:", error);
        return [];
    }

    if (!data || data.length === 0) {
        console.error("No user found with ID:", userId);
        return [];
    }
    
    return data[0]?.library_albums || [];
}