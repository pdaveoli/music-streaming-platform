import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

// ! Actions for client-side data fetching and manipulation

// Song, Album, Playlist, Artist, UserDetails interfaces
export interface Song {
  id: string;
  name: string;
  artist: string;
  coverArt: string;
  duration: string; // Duration metadata text
  genre: string; // Genre metadata text
  url: string; // URL to the song file
  lyricsUrl?: string; // Optional URL to the lyrics file
  metadata: {}; // Additional metadata as an object
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
  started: string;
  from: string;
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

/// <summary>
/// Gets an album object by its ID
/// </summary>
/// <param name="id">The ID of the album to retrieve.</param>
/// <returns>An Album object if found, otherwise null.</returns>
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

/// <summary>
/// Gets a song object by its ID
/// </summary>
/// <param name="id">The ID of the song to retrieve.</param>
/// <returns>A Song object if found, otherwise null.</returns>
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

/// <summary>
/// Checks if an album is saved in the user's library.
/// </summary>
/// <param name="userId">The ID of the user.</param>
/// <param name="albumId">The ID of the album to check.</param>
/// <returns>True if the album is saved, false otherwise.</returns>
export async function isAlbumSaved(
  userId: string,
  albumId: string
): Promise<boolean> {
  const savedAlbums = (await getSavedAlbums(userId)).toString();
  console.log("Saved albums for user:", savedAlbums);
  console.log("Checking if album ID is saved:", albumId);
  return savedAlbums.includes(albumId.toString());
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

/// <summary>
/// Gets all songs saved in the user's library by fetching songs from their saved albums.
/// </summary>
/// <param name="userId">The ID of the user.</param>
/// <returns>An array of Song objects saved by the user.</returns>
export async function getSavedSongs(userId: string): Promise<Song[]> {
  // Fetch user's saved albums
  const savedAlbums = await getSavedAlbums(userId);
  let savedSongs: Song[] = [];

  // Debug check for saved albums
  if (!savedAlbums || savedAlbums.length === 0) {
    console.warn("No saved albums found for user:", userId);
    return savedSongs; // Return empty array if no albums are saved
  }

  // loop through saved albums and get songs
  for (const albumId of savedAlbums) {
    const album = await getAlbumById(albumId);
    if (album?.songIds) {
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

/// <summary>
/// Gets the saved playlists for a user.
/// </summary>
/// <param name="userId">The ID of the user.</param>
/// <returns>An array of Playlist objects saved by the user.</returns>
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
/// <summary>
/// Creates a new playlist for the authenticated user.
/// </summary>
/// <param name="formData">Form data containing the playlist name and description.</param>
/// <returns>Redirects to the newly created playlist page or returns an error message.</returns>
/// <remarks>
/// If the user is not authenticated, an error message is returned.
/// If the playlist name is not provided, an error message is returned.
/// If the playlist creation fails, an error message is returned.
/// </remarks>
export async function createPlaylist(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return { error: "User not authenticated." };
  }

  // Get form data for playlist creation
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Playlist name is required." };
  }
  
  // Insert new playlist into the database
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
  // Redirect to the newly created playlist page
  redirect(`/playlists/${data.id}`);
}

/// <summary>
/// Gets all artists from the database.
/// </summary>
/// <returns>An array of Artist objects.</returns>
export async function getArtists() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("artists").select("*");
  if (error) {
    console.error("Error fetching artists:", error);
    return [];
  }
  return data;
}

/// <summary>
/// Gets all songs from the database.
/// </summary>
/// <returns>An array of Song objects.</returns>
export async function getSongs() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("songs").select("*");

  if (error) {
    console.error("Error fetching songs:", error);
    return [];
  }

  return data;
}

/// <summary>
/// Gets all albums from the database.
/// </summary>
/// <returns>An array of Album objects.</returns>
export async function getAlbums() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("albums").select("*");

  if (error) {
    console.error("Error fetching albums:", error);
    return [];
  }

  return data;
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

/// <summary>
/// Fetches data for the search page, including albums, songs, artists, and playlists.
/// </summary>
/// <returns>An object containing arrays of albums, songs, artists, and playlists.</returns>
/// <remarks>
/// This function retrieves all albums, songs, artists, and public playlists from the database.
/// If any of these queries fail, it returns an empty array for that category.
/// </remarks>
export async function SearchPageData(): Promise<{
  albums: Album[];
  songs: Song[];
  artists: Artist[];
  playlists: Playlist[];
}> {
  let albums = await getAlbums();
  let songs = await getSongs();
  let artists = await getArtists();
  let playlists = await getPublicPlaylists();

  return Promise.resolve({
    albums: albums ? albums : [],
    songs: songs ? songs : [],
    artists: artists ? artists : [],
    playlists: playlists ? playlists : [],
  });
}

/// <summary>
/// Gets all playlists from the database that are editable by the user.
/// </summary>
/// <param name="userId">The ID of the user whose editable playlists to retrieve.</param>
/// <returns>An array of Playlist objects that the user can edit.</returns>
export async function getUserEditablePlaylists(
  userId: string
): Promise<Playlist[]> {
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

/// <summary>
/// Gets an artist object by its ID.
/// </summary>
/// <param name="id">The ID of the artist to retrieve.</param>
/// <returns>An Artist object if found, otherwise null.</returns>
export async function getArtistById(id: string): Promise<Artist | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching artist:", error);
    return null;
  }

  return data;
}

/// <summary>
/// Gets all albums from an artist by their name.
/// </summary>
/// <param name="artistName">The name of the artist whose albums to retrieve.</param>
/// <returns>An array of Album objects by the specified artist.</returns>
export async function getAlbumsFromArtist(
  artistName: string
): Promise<Album[]> {
  if (artistName === "") {
    console.warn("Artist name is empty, returning empty album list.");
    return [];
  }
  // Fetch albums from the database by artist name
  const supabase = createClient();
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("artist", artistName);

  if (error) {
    console.error("Error fetching albums from artist:", error);
    return [];
  }

  // Run through each item in data and get the album relating to the id
  if (!data || data.length === 0) {
    console.warn("No albums found for artist with ID:", artistName);
    return [];
  }

  return data;
}

/// <summary>
/// Gets all songs from an artist by their name.
/// </summary>
/// <param name="artistName">The name of the artist whose songs to retrieve.</param>
/// <returns>An array of Song objects by the specified artist.</returns>
export async function getSongsFromArtist(artistName: string): Promise<Song[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("artist", artistName);

  if (error) {
    console.error("Error fetching songs from artist:", error);
    return [];
  }

  if (!data || data.length === 0) {
    console.warn("No songs found for artist with name:", artistName);
    return [];
  }

  return data;
}
