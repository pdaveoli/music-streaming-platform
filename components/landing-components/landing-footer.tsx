import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeSwitcher } from "../theme-switcher";
import Link from "next/link";

export default function LandingFooter() {
  return (
    // This parent container is full-screen and relative, which is key for positioning children.
    <footer className="relative flex flex-col w-full h-screen items-center justify-center bg-gradient-to-b to-white from-gray-200 dark:to-black dark:from-gray-900 text-black dark:text-white p-6">
      {/* This is the main content, which is centered by the parent's flex properties. */}
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-3">
          Like what you see?
        </p>
        <h1 className="font-extrabold text-5xl mb-12">Give it a try!</h1>
        <Button
          asChild // Use asChild for proper Link integration
          className="transform hover:scale-105 transition-transform duration-200 bg-red-500 hover:bg-red-600 text-white text-md"
          size="lg"
        >
          <Link href="/auth/sign-up" className="flex items-center gap-2">
            Get Started
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {/* This sub-footer is absolutely positioned relative to the parent.
          'bottom-0' anchors it to the bottom edge. */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">
          For legal reasons, this site is for educational purposes only.
        </p>
        <p className="text-xs mt-2">© 2025 Oliver Dave. All rights reserved.</p>
        <div className="mt-4 flex flex-row items-center justify-center gap-2">
          <ThemeSwitcher />
          <p className="text-xs">Switch Theme</p>
        </div>
      </div>
    </footer>
  );
}
