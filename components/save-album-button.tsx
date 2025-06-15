"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

interface SaveButtonProps {
  albumId: string;
  isSaved: boolean;
  userId: string;
  onToggle?: (newSavedState: boolean) => void;
}

export default function SaveButton({ albumId, isSaved, userId }: SaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSavedState, setCurrentSavedState] = useState(isSaved); // Track state locally for optimistic updates
  const router = useRouter(); // Initialize router

  const toggleSave = async () => {
    if (!userId || !albumId) {
      console.error("User ID or Album ID is missing.");
      return;
    }

    setIsLoading(true);
    
    // Optimistic update - immediately change the button state
    const previousState = currentSavedState;
    setCurrentSavedState(!currentSavedState);
    
    try {
      const supabase = createClient();
      
      // Debug: Log the userId to make sure it's correct
      console.log("Looking for user with ID:", userId);
      
      // First, let's check if the user exists without .single()
      const { data: userCheck, error: checkError } = await supabase
        .from("users")
        .select("id, library_albums")
        .eq("id", userId);

      console.log("User check result:", userCheck);
      console.log("User check error:", checkError);

      if (checkError) {
        console.error("Error checking user:", checkError);
        // Revert optimistic update on error
        setCurrentSavedState(previousState);
        return;
      }

      if (!userCheck || userCheck.length === 0) {
        console.error("User not found in users table with ID:", userId);
        // Revert optimistic update on error
        setCurrentSavedState(previousState);
        return;
      }

      if (userCheck.length > 1) {
        console.error("Multiple users found with same ID:", userId);
        // Revert optimistic update on error
        setCurrentSavedState(previousState);
        return;
      }

      const userData = userCheck[0];
      
      // Handle null values by providing empty array as fallback
      const savedAlbums = userData?.library_albums || [];
      let updatedAlbums;

      if (currentSavedState) {
        // We just changed to saved, so add to list
        updatedAlbums = [...savedAlbums, albumId.toString()];
      } else {
        // We just changed to unsaved, so remove from list
        updatedAlbums = savedAlbums.filter((id: string) => id.toString() !== albumId.toString());
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
        // Revert optimistic update on error
        setCurrentSavedState(previousState);
        return;
      }

      console.log(currentSavedState ? "Album saved successfully" : "Album unsaved successfully");
      
      // Refresh the page data without full reload - this won't affect the audio player
      router.refresh();

    } catch (error) {
      console.error("Error toggling album save state:", error);
      // Revert optimistic update on error
      setCurrentSavedState(previousState);
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