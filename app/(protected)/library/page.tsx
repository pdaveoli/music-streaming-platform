import { createClient } from "@/lib/supabase/server";
import {
  getSavedAlbums,
  getAlbumsByIds,
  getSavedPlaylists,
} from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import AlbumList from "@/components/album-list";
import { CreatePlaylistButton } from "@/components/create-playlist-button";
import PlaylistList from "@/components/playlist-list";

export default async function LibraryPage() {
  // Get the users saved albums from the database
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  const playlists = await getSavedPlaylists(userId);
  console.log("Playlists:", playlists);
  console.log("Albums:", albums);

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Your Library</h1>
      <p className="text-gray-600 mb-4">Saved Albums</p>
      <div className="max-w-4xl w-full flex flex-col items-center">
        <AlbumList albums={albums} />
      </div>
      <p className="text-gray-600 mt-4">
        You have {albums.length} saved albums.
      </p>
      <Link href="/discover" className="mt-4 text-blue-500 hover:underline">
        Discover More Albums
      </Link>

      <div className="flex items-center justify-between mt-8 mb-4">
        <p> Saved Playlists </p>
        <CreatePlaylistButton />
      </div>
      <div className="max-w-4xl w-full flex flex-col items-center">
        {playlists !== null && playlists.length > 0 && (
          <>
          <PlaylistList playlists={playlists} />
          <p className="text-gray-600 mb-4">
            You have {playlists.length} saved playlists.
          </p>
          </>
        )}
        
      </div>
      {playlists.length === 0 && (
        <div className="justify-center items-center text-center p-4">
          <h1 className="text-2xl font-bold mb-4">No Playlists Found</h1>
          <p className="text-gray-600">You have no saved playlists yet.</p>
          <Link href="/discover" className="mt-4 text-blue-500 hover:underline">
            Discover Playlists
          </Link>
        </div>
      )}
    </div>
  );
}
