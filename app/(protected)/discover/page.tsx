"use server";
import { getAlbums, Album} from "@/app/actions";
import  AlbumList  from "@/components/album-list"

export default async function DiscoverPage() {

    // Get the albums from the database
    const albums = await getAlbums();

    const loadAlbumPage = (albumId: string) => () => {
        // Redirect to the album page with the selected album ID
        window.location.href = `/album/${albumId}`;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {/* Grid to display songs */}
            <AlbumList albums={albums} />
        </div>
    );
}