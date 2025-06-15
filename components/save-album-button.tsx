"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  albumId: string;
  isSaved: boolean;
  userId: string;
  onToggle?: (newSavedState: boolean) => void;
}

export default function SaveButton({ albumId, isSaved, userId, onToggle }: SaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSavedState, setCurrentSavedState] = useState(isSaved);
  const router = useRouter();

  const toggleSave = async () => {
    if (!userId || !albumId) {
      console.error("User ID or Album ID is missing.");
      return;
    }

    setIsLoading(true);
    
    // Store the current state BEFORE any changes
    const wasAlreadySaved = currentSavedState;
    console.log("Was album already saved?", wasAlreadySaved);
    
    // Optimistic update - immediately change the button state
    const newSavedState = !wasAlreadySaved;
    setCurrentSavedState(newSavedState);

    try {
      const supabase = createClient();
      
      console.log("Looking for user with ID:", userId);
      
      const { data: userCheck, error: checkError } = await supabase
        .from("users")
        .select("id, library_albums")
        .eq("id", userId);

      console.log("User check result:", userCheck);

      if (checkError) {
        console.error("Error checking user:", checkError);
        setCurrentSavedState(wasAlreadySaved); // Revert to original state
        return;
      }

      if (!userCheck || userCheck.length === 0) {
        console.error("User not found in users table with ID:", userId);
        setCurrentSavedState(wasAlreadySaved); // Revert to original state
        return;
      }

      const userData = userCheck[0];
      const savedAlbums = userData?.library_albums || [];
      let updatedAlbums;

      // Use the ORIGINAL state (wasAlreadySaved) to determine the action
      if (wasAlreadySaved) {
        // Album was saved, so REMOVE it
        updatedAlbums = savedAlbums.filter((id: string) => id.toString() !== albumId.toString());
        console.log("Removing album from saved list");
      } else {
        // Album was not saved, so ADD it (but only if not already there)
        if (!savedAlbums.includes(albumId.toString())) {
          updatedAlbums = [...savedAlbums, albumId.toString()];
          console.log("Adding album to saved list");
        } else {
          updatedAlbums = savedAlbums; // Already in list, no change needed
          console.log("Album already in saved list, no change needed");
        }
      }

      console.log("Current saved albums:", savedAlbums);
      console.log("Updated albums:", updatedAlbums);

      // Update the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ library_albums: updatedAlbums })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating saved albums:", updateError);
        setCurrentSavedState(wasAlreadySaved); // Revert to original state
        return;
      }

      console.log(wasAlreadySaved ? "Album unsaved successfully" : "Album saved successfully");
      
      // Call the onToggle callback to update parent component
      if (onToggle) {
        onToggle(newSavedState);
      }

    } catch (error) {
      console.error("Error toggling album save state:", error);
      setCurrentSavedState(wasAlreadySaved); // Revert to original state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleSave}
      disabled={isLoading}
      className={
        currentSavedState 
          ? "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50" 
          : "bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
      }
    >
      {isLoading ? "..." : currentSavedState ? "Unsave Album" : "Save Album"}
    </Button>
  );
}