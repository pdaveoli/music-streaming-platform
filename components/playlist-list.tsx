"use client";
import type { Playlist } from "@/app/actions";
import { redirect } from "next/navigation";

export default function PlaylistList ({ playlists } : { playlists: Playlist[]}) {

    const LoadPlaylistPage = (playlistId: string) => () => {
        // Redirect using next js navigation
        redirect(`/playlists/${playlistId}`);
    }

    return (
        <div className="grid grid-cols-4 sm:grid-cols-2 gap-4 p-4">
            {playlists.map((playlist: Playlist) => (
                <div key={playlist.id} className="bg-white rounded-lg shadow-md p-4 text-center overflow-hidden" onClick={LoadPlaylistPage(playlist.id)}>
                    <img
                        src={playlist.coverArt}
                        alt={playlist.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h2 className="text-xl font-semibold mb-2 text-black truncate">{playlist.name}</h2>
                    <p className="text-gray-600 truncate">{playlist.description}</p>
                </div>
            ))}
        </div>
    );
}