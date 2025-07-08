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
  username: string; // Unique username
  date_of_birth: string; // ISO date string
  fav_genres: string[]; // Array of favorite genres
  playlists: string[]; // Array of playlist IDs
  library_albums: string[]; // Array of album IDs
  userIcon: string; // URL to the user's icon
  bio: string;
}