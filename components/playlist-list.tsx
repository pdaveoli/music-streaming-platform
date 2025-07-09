"use client";
import type { Playlist } from "@/app/types";
import { useRouter } from "next/navigation";

export default function PlaylistList ({ playlists } : { playlists: Playlist[]}) {
    const router = useRouter();
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
            {playlists.map((playlist: Playlist) => (
                <div 
                key={playlist.id} 
                    className="flex flex-col cursor-pointer group" 
                    onClick={() => router.push(`/playlists/${playlist.id}`)}
                >
                    <img
                        src={playlist.coverArt || "https://smtdqezdamcycolojywa.supabase.co/storage/v1/object/public/avatars//default-playlist.jpg"}
                        alt={playlist.name}
                        className="w-full aspect-square object-cover rounded-md mb-2 transition-opacity group-hover:opacity-80"
                    />
                    <h2 className="font-semibold truncate w-full">{playlist.name}</h2>
                    <p className="text-sm text-gray-500 truncate w-full">{playlist.description}</p>
                </div>
            ))}
        </div>
    );
}