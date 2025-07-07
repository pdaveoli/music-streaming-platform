"use server";
import { getAlbums, getPublicPlaylists} from "@/app/actions";
import  AlbumList  from "@/components/album-list"
import PlaylistList from "@/components/playlist-list";

/// <summary>
/// Discover page component that displays albums and public playlists.
/// It fetches albums and public playlists from the database.
/// </summary>
/// <remarks>
/// This component uses server-side rendering to fetch data securely.
/// </remarks>
export default async function DiscoverPage() {

    // Get the albums from the database
    const albums = await getAlbums();
    const publicPlaylists = await getPublicPlaylists();
    

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {/* Album View */}
            <h1 className="text-2xl font-bold mb-4">Discover Albums</h1>
            <div className="flex max-w-4xl w-full flex-col items-center">
            <AlbumList albums={albums} />
            </div>
            {/* Public Playlists View */}
            <h1 className="text-2xl font-bold mb-4 mt-8">Public Playlists</h1>
            <div className="flex max-w-4xl w-full flex-col items-center">
            <PlaylistList playlists={publicPlaylists} />
            </div>
        </div>
    );
}