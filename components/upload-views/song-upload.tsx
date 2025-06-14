"use client";

import { Artist } from "@/app/actions";
import React, { useRef, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { createClient } from "@/lib/supabase/client";

interface SongUploadProps {
  artists: Artist[];
}

export default function SongUpload({ artists }: SongUploadProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const lyricFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [blob2, setBlob2] = useState<PutBlobResult | null>(null);
   const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  if (!artists || artists.length === 0) {
    return (
      <p className="text-red-500">
        No artists available. Please add an artist first.
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    // get form data
    const formData = new FormData(e.currentTarget);
    const songTitle = formData.get("songTitle") as string;
    const coverArt = formData.get("coverArt") as string;
    const genre = formData.get("genre") as string;
    const duration = formData.get("duration") as string;
    const description = formData.get("description") as string;
    const label = formData.get("label") as string;
    const releaseDate = formData.get("releaseDate") as string;
    const artist = value;

    if (!inputFileRef.current?.files) {
      throw new Error("No file selected");
    }
    const file = inputFileRef.current.files[0];

    const selectedArtistObject = artists.find(artist => artist.name === value);
    const artistNameForPath = selectedArtistObject 
      ? selectedArtistObject.name.replace(/\s+/g, '_') // Replace spaces with underscores for a cleaner path
      : 'unknown_artist';
    const pathName = `songs/${artistNameForPath}/${file.name}`;

    const newBlob = await upload(pathName, file, {
      access: "public",
      handleUploadUrl: "/api/song/upload",
    });

    setBlob(newBlob);

    // upload lyric file if provided
    if (lyricFileRef.current?.files && lyricFileRef.current.files.length > 0) {
      const lyricFile = lyricFileRef.current.files[0];
      const lyricPathName = `lyrics/${artistNameForPath}/${lyricFile.name}`;
      const newBlob2 = await upload(lyricPathName, lyricFile, {
        access: "public",
        handleUploadUrl: "/api/song/upload-lyric",
      });
      setBlob2(newBlob2);
    }

    // Check if the blob was created successfully
    if (!newBlob || !newBlob.url) {
      console.error("Failed to create blob or get URL");
      return;
    }

    // Log the blob URL for debugging
    console.log("Blob URL:", newBlob.url);
    // upload to supabase
    const supabase = createClient();
    const { data, error } = await supabase
        .from("songs")
        .insert({
          name: songTitle,
          artist: artist,
          coverArt: coverArt,
          genre: genre,
          duration: duration,
          lyricsUrl: blob2?.url,
          url: newBlob.url, // Use the URL from the uploaded blob
          metadata: {
            description: description,
            label: label,
            releaseDate: releaseDate,
          }, // Add any additional metadata if needed
        });
    if (error) {
        console.error("Error uploading song:", error);
        return;
        }
    console.log("Song uploaded successfully:", data);
    // Reset the form
    setValue("");
    setOpen(false);
};

 

  return (
    
    
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 rounded-lg shadow-md">
      <div className="flex flex-col">
        <label
          htmlFor="songTitle"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Song Title
        </label>
        <input type="text" id="songTitle" name="songTitle" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
      <div className="flex flex-col">
        <label htmlFor="artist" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Artist
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value
                ? artists.find((artist) => artist.name === value)?.name
                : "Select artist..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search artist..." className="h-9" />
              <CommandList>
                <CommandEmpty>No artist found.</CommandEmpty>
                <CommandGroup>
                  {artists.map((artist) => (
                    <CommandItem
                      key={artist.id}
                      value={artist.name}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      {artist.name}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === artist.name ? "opacity-100" : "opacity-0"
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
      <div className="flex flex-col">
        <label htmlFor="songFile" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload Song File
        </label>
        <input
          type="file"
          id="songFile"
          name="songFile"
          accept="audio/*"
          ref={inputFileRef}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="lyricFile" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload Lyric File
        </label>
        <input
          type="file"
          id="lyricFile"
          name="lyricFile"
          accept=".lrc"
          ref={lyricFileRef}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="coverArt" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Cover Art
        </label>
        <input
          type="url"
          id="coverArt"
          name="coverArt"
          placeholder="Enter URL for cover art"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="genre" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
      <div className="flex flex-col">
        <label htmlFor="duration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Duration
        </label>
        <input
          type="text"
          id="duration"
          name="duration"
          placeholder="Enter duration (e.g., 3:45)"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter a brief description of the song"
          className="resize-none h-24 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        ></textarea>
      </div>
      <div className="flex flex-col">
        <label htmlFor="label" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
      <div className="flex flex-col">
        <label
          htmlFor="releaseDate"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Release Date
        </label>
        <input
          type="text"
          id="releaseDate"
          name="releaseDate"
          placeholder="Enter release date"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <Button type="submit" className="w-full mt-5">
        Upload Song
      </Button>
    </form>
    
  );
}
