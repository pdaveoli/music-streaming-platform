"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const GENRE_OPTIONS = [
  { value: "rock", label: "Rock" },
  { value: "pop", label: "Pop" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "hip-hop", label: "Hip-Hop" },
  { value: "electronic", label: "Electronic" },
  { value: "country", label: "Country" },
  { value: "r&b", label: "R&B" },
  { value: "reggae", label: "Reggae" },
];

const MAX_SELECTIONS = 3;

interface MultiSelectGenresProps {
  selectedGenres: string[];
  onChange: (genres: string[]) => void;
}

export function MultiSelectGenres({
  selectedGenres,
  onChange,
}: MultiSelectGenresProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue: string) => {
    const isSelected = selectedGenres.includes(currentValue);

    if (isSelected) {
      // Deselect the genre
      onChange(selectedGenres.filter((g) => g !== currentValue));
    } else {
      // Select the genre, but check the limit first
      if (selectedGenres.length >= MAX_SELECTIONS) {
        toast.info(`You can only select up to ${MAX_SELECTIONS} genres.`);
        return;
      }
      onChange([...selectedGenres, currentValue]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex gap-1 flex-wrap">
            {selectedGenres.length > 0 ? (
              selectedGenres.map((genre) => (
                <Badge
                  variant="secondary"
                  key={genre}
                  className="mr-1 mb-1"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the popover
                    handleSelect(genre);
                  }}
                >
                  {GENRE_OPTIONS.find((o) => o.value === genre)?.label}
                  <X className="ml-1 h-4 w-4" />
                </Badge>
              ))
            ) : (
              <span>Select up to {MAX_SELECTIONS} genres...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search genres..." />
          <CommandList>
            <CommandEmpty>No genre found.</CommandEmpty>
            <CommandGroup>
              {GENRE_OPTIONS.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedGenres.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}