// This script is responsible for handling actions to do with databases
import { createClient } from "@/lib/supabase/server";

// Types



export interface Song {
    id: string;
    name: string;
    artist: string;
    coverArt: string;
    albumId: string;
    duration: string; // Duration metadata text
    genre: string; // Genre metadata text
    url: string; // URL to the song file
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
    metadata: {} // Additional metadata as an object
}

export interface Playlist {

}

export async function getSongs() {
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

export async function getAlbums() {
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

export async function getSongById(id: string) {
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
export async function getAlbumById(id: string) {
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