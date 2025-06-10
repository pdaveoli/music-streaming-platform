import type { PageProps } from "@/.next/types/app/page";
import { getAlbumById, getSongById, Song } from "@/app/actions";
import { SongList } from "@/components/song-list";
import { redirect } from "next/navigation";



export default async function AlbumPage(params : PageProps) {
    const { id } = await params.params;

    if (!id) { redirect("/home") }
    
    // Fetch album data based on the ID
    const album = await getAlbumById(id);


    if (album === null) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-4xl font-bold mb-4">Album Not Found</h1>
                <p className="text-lg text-gray-600">The album you are looking for does not exist.</p>
                <a href="/discover" className="text-blue-500 hover:underline mt-4">Go back to Discover</a>
            </div>
        )
    }

    const songs : Song[] = await Promise.all(
        album?.songIds.map(async (songId: string) => {
            const song : Song = await getSongById(songId);
            return song;
        })
    );

    return (
        <>
        <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full mx-auto">
            <img
                src={album?.coverArt}
                alt={album?.name}
                className="w-64 h-64 object-cover rounded-lg mb-4"
            />
            <h1 className="text-4xl font-bold mb-4">{album?.name}</h1>
            <p className="text-lg text-gray-600 mb-4">Artist: {album?.artist}</p>
        </div>
        <div>
            <SongList songs={songs} />
        </div>
        </>
    );
    
}