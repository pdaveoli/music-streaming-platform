import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SongUpload from "@/components/upload-views/song-upload"
import AlbumUpload from "@/components/upload-views/album-upload"
import PlaylistUpload from "@/components/upload-views/playlist-upload"
import ArtistUpload from "@/components/upload-views/artist-upload"
import { getSongs, getArtists } from "@/app/actions"
import { Artist, Song } from "@/app/types"
export default async function UploaderPage() {

    const artists : Artist[] = await getArtists();
    const songs : Song[] = await getSongs();

    return (
        <div className="flex flex-col items-center h-[calc(100vh+64px)] justify-center p-4 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Upload Your Music</h1>
            <p className="text-gray-600 mb-8">Select the type of content you want to upload:</p>
            <Tabs defaultValue="song" className="w-full max-w-2xl">
                <TabsList>
                    <TabsTrigger value="song">Song</TabsTrigger>
                    <TabsTrigger value="album">Album</TabsTrigger>
                    <TabsTrigger value="playlist">Playlist</TabsTrigger>
                    <TabsTrigger value="artist">Artist</TabsTrigger>
                </TabsList>
                <TabsContent value="song">
                    <SongUpload artists={artists} />
                </TabsContent>
                <TabsContent value="album">
                    <AlbumUpload songs={songs} />
                </TabsContent>
                <TabsContent value="playlist">
                    <PlaylistUpload />
                </TabsContent>
                <TabsContent value="artist">
                    <ArtistUpload />
                </TabsContent>
            </Tabs>
        </div>
    )
}