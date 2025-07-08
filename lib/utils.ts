import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Filter } from "bad-words";

const filter = new Filter();
const combinedBadWords = filter.list;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export function properFilter(text: string): string {
  const lowerCaseUsername = text.toLowerCase();
  let newString = text;
  for (const badWord of combinedBadWords) {
    if (lowerCaseUsername.includes(badWord)) {
      // replace the bad word with asterisks
      const regex = new RegExp(badWord, 'gi');
      newString = newString.replace(regex, '*'.repeat(badWord.length));
    }
  }
  return newString;
}

export function properProfanity(text: string) : boolean {
  const lowerCaseText = text.toLowerCase();
  for (const badWord of combinedBadWords) {
    if (lowerCaseText.includes(badWord)) {
      return true;
    }
  }
  return false;
}



// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
