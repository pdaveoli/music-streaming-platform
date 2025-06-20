"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SearchPageData from "@/app/client-actions";
import type { Album, Artist, Song } from "@/app/client-actions";
import { SongList } from "@/components/song-list";
import Link from "next/link";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [trackResults, setTrackResults] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Song[]>([]);

  // get albums, artists, and tracks
  useEffect(() => {
    const loadItems = async () => {
      let data = await SearchPageData();
      if (data) {
        setAlbums(data.albums || []);
        setArtists(data.artists || []);
        setTracks(data.songs || []);
      }
    };
    loadItems();
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };
  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-md mb-6">
        <div className="relative">
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
      <div className="w-full max-w-4xl mt-4">
        {searchQuery ? (
          <>
            <h2 className="text-lg font-semibold mb-4 text-center">
              Search Results
            </h2>
            <div className="space-y-6">
              {albumResults.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-center mb-2">
                    Albums
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {albumResults.map((album) => (
                      <Link href={`/album/${album.id}`} key={album.id}>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200">
                          <div className="flex items-center overflow-hidden">
                            <img
                              src={album.coverArt || "/placeholder-album.png"}
                              alt={album.name}
                              className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h2 className="text-xl font-semibold truncate text-white">
                                {album.name}
                              </h2>
                              <p className="text-sm text-gray-300">
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
                  <h3 className="text-md font-semibold text-center mb-2">
                    Artists
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {artistResults.map((artist) => (
                      <Link href={`/artist/${artist.id}`} key={artist.id}>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200">
                          <div className="flex items-center overflow-hidden">
                            <img
                              src={
                                artist.pictureUrl || "/placeholder-artist.png"
                              }
                              alt={artist.name}
                              className="w-16 h-16 object-cover rounded-full mr-4 flex-shrink-0"
                            />
                            <div className="overflow-hidden">
                              <p className="text-xl font-semibold truncate text-white">
                                {artist.name}
                              </p>
                              <p className="flex items-center text-sm text-gray-300 space-x-2">
                                {artist.genre}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {trackResults.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2 text-center">
                    Tracks
                  </h3>
                  {/* SongList doesn't need extra wrappers like ul/li */}
                  <SongList songs={trackResults} hideControls />
                </div>
              )}
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
