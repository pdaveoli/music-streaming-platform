"use client";
import { Album } from "@/app/actions";
import { useRouter } from "next/navigation";

/// <summary>
/// AlbumList component displays a list of albums.
/// Each album is clickable and navigates to the album details page.
/// </summary>
/// <remarks>
/// This component is used to display a grid of albums with their cover art, name, and artist.
/// It uses Next.js router for navigation.
/// </remarks>
export default function AlbumList ({ albums } : { albums: Album[]}) {
    const router = useRouter();

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
            {albums.map((album: Album) => (
                <div 
                    key={album.id} 
                    className="flex flex-col cursor-pointer group" 
                    onClick={() => router.push(`/album/${album.id}`)}
                >
                    <img
                        src={album.coverArt}
                        alt={album.name}
                        className="w-full aspect-square object-cover rounded-md mb-2 transition-opacity group-hover:opacity-80"
                    />
                    <h2 className="font-semibold truncate w-full">{album.name}</h2>
                    <p className="text-sm text-gray-500 truncate w-full">{album.artist}</p>
                </div>
            ))}
        </div>
    );
}