import { createClient } from "@/lib/supabase/server";
import { getSavedAlbums, getAlbumsByIds } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import AlbumList from "@/components/album-list";

export default async function LibraryPage() {
    // Get the users saved albums from the database
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
        redirect("/auth/login");
    }

    const savedAlbums = await getSavedAlbums(userId);

    if (!savedAlbums || savedAlbums.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">Your Library</h1>
                <p className="text-gray-600">You have no saved albums yet.</p>
                <Link href="/discover" className="mt-4 text-blue-500 hover:underline">
                    Discover Albums
                </Link>
            </div>
        );
    }

    const albums = await getAlbumsByIds(savedAlbums);
    

    if (!albums || albums.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">Your Library</h1>
                <p className="text-gray-600">You have no saved albums yet.</p>
                <Link href="/discover" className="mt-4 text-blue-500 hover:underline">
                    Discover Albums
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Your Library</h1>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AlbumList albums={albums} />
            </div>
        </div>
    )
}