import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

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

export interface UserDetails {
    id: string; // UUID of the user
    name: string;
    date_of_birth: string; // ISO date string
    fav_genres: string[]; // Array of favorite genres
    playlists: string[]; // Array of playlist IDs
    library_albums: string[]; // Array of album IDs
    userIcon: string; // URL to the user's icon
    bio: string;
}

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

export async function getSavedSongs(userId: string): Promise<Song[]> {
    const savedAlbums = await getSavedAlbums(userId);
    let savedSongs: Song[] = [];
    // loop through saved albums and get songs
    for (const albumId of savedAlbums) {
        const album = await getAlbumById(albumId);
        if (album && album.songIds) {
            const songs = await Promise.all(
                album.songIds.map(async (songId: string) => {
                    return await getSongById(songId);
                })
            );
            savedSongs = [...savedSongs, ...songs];
        }
    }
    return savedSongs;
}

// Get users saved playlists
export async function getSavedPlaylists(userId: string): Promise<Playlist[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .select("playlists")
        .eq("id", userId);
    if (error) {
        console.error("Error fetching saved playlists:", error);
        return [];
    }
    if (!data || data.length === 0) {
        console.error("No user found with ID:", userId);
        return [];
    }
    // Handle null values by returning empty array if playlists is null
    return data[0]?.playlists || [];
}

export async function createPlaylist(formData: FormData) {

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return { error: "User not authenticated." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Playlist name is required." };
  }

  const { data, error } = await supabase
    .from("playlists")
    .insert({
      name,
      description,
      userId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating playlist:", error);
    return { error: "Failed to create playlist." };
  }

  // get saved playlists for the user
  const savedPlaylists = await getSavedPlaylists(userId);
    // add the new playlist to the saved playlists
    savedPlaylists.push(data.id);
    // Update the user's saved playlists
    const { error: updateError } = await supabase
    .from("users")
    .update({ playlists: savedPlaylists })
    .eq("id", userId);
  if (updateError) {
    console.error("Error updating user's playlists:", updateError);
    return { error: "Failed to update user's playlists." };
  }

  redirect(`/playlists/${data.id}`);
}

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


export async function SearchPageData() : Promise<{
  albums: Album[];
  songs: Song[];
  artists: Artist[];
}> {

    
    let albums = await getAlbums();
    let songs = await getSongs();
    let artists = await getArtists();

  return Promise.resolve({ albums: albums ? albums : [], songs: songs ? songs : [], artists: artists ? artists : [] });
}

export async function getUserEditablePlaylists(userId: string): Promise<Playlist[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("userId", userId);

    if (error) {
        console.error("Error fetching user playlists:", error);
        return [];
    }

    return data;
}

