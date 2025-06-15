import type { PageProps } from "@/.next/types/app/page"; // Or define your own PageProps type
import { getAlbumById, getSongById, Song, isAlbumSaved } from "@/app/actions";
import { SongList } from "@/components/song-list";
import { redirect } from "next/navigation";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { createClient } from "@/lib/supabase/server";
import SaveButton from "@/components/save-album-button"; // Import the SaveButton component



export default async function AlbumPage(props: PageProps) { // Changed 'params' to 'props' for clarity
    const { id } = await props.params; // Corrected: No await, access directly

    if (!id) { redirect("/home") }
    
    const album = await getAlbumById(id);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }
    
    const userId = user.id; // Get the user ID from the authenticated user

    let saved = await isAlbumSaved(userId, id);
    if (saved === true) {
        console.log("Album is saved");
    } else {
        console.log("Album is not saved");
    }

    if (album === null) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-4xl font-bold mb-4">Album Not Found</h1>
                <p className="text-lg text-gray-600">The album you are looking for does not exist.</p>
                <a href="/discover" className="text-blue-500 hover:underline mt-4">Go back to Discover</a>
            </div>
        );
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
            <p className="text-base text-gray-800 mb-4">{album?.genre} • {album?.metadata?.releaseDate}</p>
            <SaveButton albumId={id} isSaved={saved} userId={userId} />
            <ExpandableDescription text={album?.metadata?.description} truncateLength={150} />
        </div>
        <div>
            <SongList songs={songs} />
        </div>
        </>
    );
    
}