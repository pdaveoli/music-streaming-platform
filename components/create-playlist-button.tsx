"use client";

import { JSX, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createPlaylist } from "@/app/client-actions";
import { toast } from "sonner";

/// <summary>
/// Button to create a new playlist.
/// Opens a dialog with a form to enter playlist details.
/// On submission, it calls the server action to create the playlist.
/// </summary>
/// <returns>
/// A button that opens a dialog for creating a new playlist.
/// </returns>
export function CreatePlaylistButton() : JSX.Element {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const result = await createPlaylist(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      // On success, the server action will redirect, so we just
      // close the dialog as a fallback.
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-blue-500 hover:underline bg-transparent hover:bg-transparent hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
          <DialogDescription>
            Create a new playlist to save your favorite tracks.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid w-full items-center gap-3 mb-5">
            <Label htmlFor="name">Playlist Name</Label>
            <Input type="text" name="name" placeholder="Playlist Name" required />
          </div>
          <div className="grid w-full gap-3 mb-5">
            <Label htmlFor="description">Description</Label>
            <Textarea placeholder="Playlist Description" name="description" />
          </div>
          <Button className="w-full" type="submit">
            Create Playlist
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}