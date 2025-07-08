"use client";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchPageData } from "@/app/client-actions";
import type { Album, Artist, Playlist, Song } from "@/app/types";
import { SongList } from "@/components/song-list";
import Link from "next/link";

/// <summery>
/// SearchPage component allows users to search for albums, artists, tracks, and playlists.
/// It fetches data from the SearchPageData function and filters results based on user input.
/// The results are displayed in categorized sections for albums, artists, tracks, and playlists.
/// </summery>
export default function SearchPage() {
  // State variables to hold search query and results
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [trackResults, setTrackResults] = useState<Song[]>([]);
  const [playlistResults, setPlaylistResults] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // get albums, artists, and tracks
  useEffect(() => {
    const loadItems = async () => {
      let data = await SearchPageData();
      if (data) {
        setAlbums(data.albums || []);
        setArtists(data.artists || []);
        setTracks(data.songs || []);
        setPlaylists(data.playlists || []);
      }
    };
    loadItems();
  }, []);

  /// <summery>
  /// handleSearch function updates the search query and filters results based on user input.
  /// It updates the state variables for albumResults, artistResults, trackResults, and playlistResults.
  /// </summery>
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
    // Filter results based on search query
    const query = e.target.value.toLowerCase();
    // get album results
    const albumsRes = albums.filter(
      (album) =>
        album.name.toLowerCase().includes(query) ||
        album.artist.toLowerCase().includes(query)
    );
    setAlbumResults(albumsRes);
    // get artist results
    const artistsRes = artists.filter((artist) =>
      artist.name.toLowerCase().includes(query)
    );
    setArtistResults(artistsRes);
    // get track results
    const tracksRes = tracks.filter(
      (track) =>
        track.name.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query)
    );
    setTrackResults(tracksRes);

    const playlistRes = playlists.filter(
      (playlist) =>
        playlist.name.toLowerCase().includes(query) ||
        playlist.description.toLowerCase().includes(query)
    );
    setPlaylistResults(playlistRes);
  };
  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-md mb-6">
        <div className="relative">
          {/* Search Input */}
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search for albums, artists, or tracks..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="w-full pl-5 pr-5 mt-4">
        {searchQuery ? (
          <>
            <h2 className="text-lg font-semibold mb-4 text-center">
              Search Results
            </h2>
            <div className="space-y-6">
              {albumResults.length > 0 && (
                <div>
                  {/* Albums Section */}
                  <h3 className="text-md font-semibold text-center mb-2">
                    Albums
                  </h3>
                  <div className="border-t">
                    {albumResults.map((album) => (
                      <Link href={`/album/${album.id}`} key={album.id}>
                        <div className="border-b w-full flex items-center p-3 hover:bg-accent transition-colors">
                          <div className="flex items-center overflow-hidden flex-1">
                            <img
                              src={album.coverArt || "/placeholder-album.png"}
                              alt={album.name}
                              className="w-12 h-12 object-cover rounded-md mr-4 flex-shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h2 className="font-semibold truncate text-foreground">
                                {album.name}
                              </h2>
                              <p className="text-sm text-muted-foreground">
                                {album.artist}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {artistResults.length > 0 && (
                <div>
                  {/* Artists Section */}
                  <h3 className="text-md font-semibold text-center mb-2">
                    Artists
                  </h3>
                  <div className="border-t">
                    {artistResults.map((artist) => (
                      <Link href={`/artist/${artist.id}`} key={artist.id}>
                        <div className="border-b w-full flex items-center p-3 hover:bg-accent transition-colors">
                          <div className="flex items-center overflow-hidden flex-1">
                            <img
                              src={
                                artist.pictureUrl || "/placeholder-artist.png"
                              }
                              alt={artist.name}
                              className="w-12 h-12 object-cover rounded-full mr-4 flex-shrink-0"
                            />
                            <div className="overflow-hidden">
                              <p className="font-semibold truncate text-foreground">
                                {artist.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Artist
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {playlistResults.length > 0 && (
                <div>
                  {/* Playlists Section */}
                  <h3 className="text-md font-semibold mb-2 text-center">
                    Playlists
                  </h3>
                  <div className="border-t">
                    {playlistResults.map((playlist) => (
                      <Link
                        href={`/playlists/${playlist.id}`}
                        key={playlist.id}
                      >
                        <div className="border-b w-full flex items-center p-3 hover:bg-accent transition-colors">
                          <div className="flex items-center overflow-hidden flex-1">
                            <img
                              src={
                                playlist.coverArt || "/placeholder-playlist.png"
                              }
                              alt={playlist.name}
                              className="w-12 h-12 object-cover rounded-md mr-4 flex-shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h2 className="font-semibold truncate text-foreground">
                                {playlist.name}
                              </h2>
                              <p className="text-sm text-muted-foreground truncate">
                                {playlist.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {trackResults.length > 0 && (
                      <div>
                        {/* Tracks Section */}
                        <h3 className="text-md font-semibold mb-2 text-center">
                          Tracks
                        </h3>
                        {/* SongList doesn't need extra wrappers like ul/li */}
                        <SongList songs={trackResults} hideControls />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="text-center text-sm text-gray-500 mt-8">
              Found{" "}
              {albumResults.length +
                artistResults.length +
                trackResults.length +
                playlistResults.length}{" "}
              results
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              {albumResults.length === 0 &&
                artistResults.length === 0 &&
                trackResults.length === 0 &&
                playlistResults.length === 0 &&
                "No results found."}
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              Tip: You can search by album name, artist name, track title, or
              playlist name/description.
            </div>
          </>
        ) : (
          <div className="text-center text-sm text-gray-500 mt-8">
            Start typing to search for albums, artists, or tracks.
          </div>
        )}
      </div>
    </div>
  );
}
