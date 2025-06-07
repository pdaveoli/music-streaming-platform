"use client";
import { Album } from "@/app/actions";
import { redirect } from "next/navigation";

export default function AlbumList ({ albums } : { albums: Album[]}) {

    const LoadAlbumPage = (albumId: string) => () => {
        // Redirect using next js navigation
        redirect(`/album/${albumId}`);
    }

    return (
        <div className="grid grid-cols-4 sm:grid-cols-2 gap-4 p-4">
            {albums.map((album: Album) => (
                <div key={album.id} className="bg-white rounded-lg shadow-md p-4 text-center" onClick={LoadAlbumPage(album.id)}>
                    <img
                        src={album.coverArt}
                        alt={album.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h2 className="text-xl font-semibold mb-2 text-black">{album.name}</h2>
                    <p className="text-gray-600">{album.artist}</p>
                </div>
            ))}
        </div>
    );
}