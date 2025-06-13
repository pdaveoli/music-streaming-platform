"use client";

import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ArtistUpload() {

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        // Get all the fields
        const artistName = formData.get("artistName") as string;
        const artistBio = formData.get("artistBio") as string;
        const artistImage = formData.get("artistImage") as string;
        const artistGenre = formData.get("artistGenre") as string;
        const artistFrom = formData.get("artistFrom") as string;
        const artistStarted = formData.get("artistStarted") as string;

        const supabase = createClient();
        const { data, error } = await supabase
            .from("artists")
            .insert({
                name: artistName,
                description: artistBio,
                started: artistStarted,
                genre: artistGenre,
                from: artistFrom,
                pictureUrl: artistImage,
            });
        if (error) {
            console.error("Error uploading artist:", error);
            alert("Failed to upload artist. Please try again.");
        }
        else {
            console.log("Artist uploaded successfully:", data);
            alert("Artist uploaded successfully!");
            event.currentTarget.reset(); // Reset the form after successful upload
        }
        
    }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6  rounded-lg shadow-md">
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
          htmlFor="artistBio"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Artist Description
        </label>
        <textarea
          id="artistBio"
          name="artistBio"
          rows={4}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
        </div> 
        <div className="mb-4">
        <label
          htmlFor="artistImage"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
            Artist Image URL
        </label>
        <input
            type="url"
            id="artistImage"
            name="artistImage"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        </div>
        <div className="mb-4">
        <label
        htmlFor="artistGenre"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
            Artist Genre
        </label>
        <input
            type="text"
            id="artistGenre"
            name="artistGenre"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        </div>
        <div className="mb-4">
        <label htmlFor="artistFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Artist Origin
        </label>
        <input
          type="text"
          id="artistFrom"
          name="artistFrom" 
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        </div>
        <div className="mb-4">
        <label htmlFor="artistStarted"

            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
            Year Started
        </label>
        <input
            type="number"
            id="artistStarted"
            name="artistStarted"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        </div>
        <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
          Upload Artist
        </Button>

    </form>
  );
}
