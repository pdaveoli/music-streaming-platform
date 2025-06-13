"use client";
import type { Song } from '@/app/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // Keep for other potential single selects, or remove if not used elsewhere
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import * as React from "react"; // Import React
import { Check, ChevronsUpDown } from "lucide-react"; // For icons

import { cn } from "@/lib/utils"; // For conditional class names
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox

export default function AlbumUpload({songs: availableSongs} : {songs: Song[]}) { // Renamed prop to avoid conflict
    const [selectedSongIds, setSelectedSongIds] = React.useState<string[]>([]);
    const [openSongSelector, setOpenSongSelector] = React.useState(false);


    if (!availableSongs || availableSongs.length === 0) {
        return (
        <div className="text-center text-red-500">
            No songs available to select. Please upload songs first.
        </div>
        );
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const albumName = formData.get("albumName") as string;
        const artistName = formData.get("artistName") as string;
        const albumCover = formData.get("albumCover") as string;
        const genre = formData.get("genre") as string;
        // const songs = formData.getAll("songs") as string[]; // Get selected songs from state
        const releaseDate = formData.get("releaseDate") as string;
        const description = formData.get("description") as string;
        const label = formData.get("label") as string;
        const supabase = createClient();
        
        const { data, error } = await supabase
            .from("albums")
            .insert({
                name: albumName,
                artist: artistName,
                coverArt: albumCover,
                genre: genre,
                songsIds: selectedSongIds, // Use state variable here
                metadata: {
                    releaseDate: releaseDate,
                    description: description,
                    label: label,
                },
            });
        if (error) {
            console.error("Error uploading album:", error);
            alert("Failed to upload album. Please try again.");
        }
        else {
            console.log("Album uploaded successfully:", data);
            alert("Album uploaded successfully!");
            event.currentTarget.reset(); // Reset the form after successful upload
            setSelectedSongIds([]); // Reset selected songs
        }

    }

  return (
    <>
      <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200">
        Album Upload
      </h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label
            htmlFor="albumName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Album Name
          </label>
          <input
            type="text"
            id="albumName"
            name="albumName"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
            <label
                htmlFor="artistName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
            Artist Name
            </label>
            <input
                type="text"
                id="artistName"
                name="artistName"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        <div className="mb-4">
            <label
                htmlFor="albumCover"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
            Album Cover URL
            </label>
            <input
                type="url"
                id="albumCover"
                name="albumCover"
                placeholder="Enter URL for album cover"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        <div className="mb-4">
          <label
            htmlFor="genre"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Genre
          </label>
          <input
            type="text"
            id="genre"
            name="genre"
            placeholder="Enter genre"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
            <label
                htmlFor="songs-selector" // Changed ID to avoid conflict if "songs" is used elsewhere
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
            Songs
            </label>
            <Popover open={openSongSelector} onOpenChange={setOpenSongSelector}>
              <PopoverTrigger asChild>
                <Button
                  id="songs-selector"
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSongSelector}
                  className="w-full justify-between mt-1"
                >
                  {selectedSongIds.length > 0
                    ? `${selectedSongIds.length} song(s) selected`
                    : "Select songs..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search songs..." />
                  <CommandList>
                    <CommandEmpty>No songs found.</CommandEmpty>
                    <CommandGroup>
                      {availableSongs?.map((song) => (
                        <CommandItem
                          key={song.id}
                          value={song.id} // Use song.id for value
                          onSelect={(currentValue) => {
                            // currentValue is song.id here
                            setSelectedSongIds((prevSelected) =>
                              prevSelected.includes(currentValue)
                                ? prevSelected.filter((id) => id !== currentValue)
                                : [...prevSelected, currentValue]
                            );
                            // Keep the popover open for multiple selections
                            // setOpenSongSelector(false); 
                          }}
                        >
                          <Checkbox
                            className="mr-2"
                            checked={selectedSongIds.includes(song.id)}
                            onCheckedChange={(checked) => {
                               setSelectedSongIds((prevSelected) =>
                                checked
                                ? [...prevSelected, song.id]
                                : prevSelected.filter((id) => id !== song.id)
                               );
                            }}
                            id={`song-${song.id}`}
                          />
                           <label htmlFor={`song-${song.id}`} className="cursor-pointer flex-1">{song.name}</label>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedSongIds.includes(song.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="mb-4">
            <label
                htmlFor="releaseDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
            Release Date
            </label>
            <input
                type="text"
                id="releaseDate"
                name="releaseDate"
                placeholder="Enter release date YYYY"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label
                htmlFor="label"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
            Record Label
            </label>
            <input
                type="text"
                id="label"
                name="label"
                placeholder="Enter record label"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
            Description
            </label>
            <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Enter album description"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <Button type="submit" className="mt-4">
            Create Album
          </Button>
      </form>
    </>
  );
}
