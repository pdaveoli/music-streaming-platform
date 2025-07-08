import { SignUpForm } from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="w-full min-h-screen bg-[url(/loginBackgroundImg.jpg)] bg-cover bg-center bg-no-repeat">
      <div className="flex flex-col min-h-screen w-full items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
        <nav className="absolute top-0 left-0 right-0 w-full p-6 flex justify-between items-center container mx-auto">
          <div className="text-4xl font-bold">
            <Link href="/" className="text-white">
              Free<span className="text-red-500">Stream</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button
              asChild
              className="bg-red-500 hover:bg-red-600 text-white text-lg font-medium px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
            <Button
              asChild
              variant="link"
              className="text-lg font-light rounded shadow hover:animate-pulse  text-white"
            >
              <Link href="/auth/login">Log in</Link>
            </Button>
          </div>
        </nav>
        <div className="w-full max-w-sm relative">
          <SignUpForm className="rounded-xl bg-white/40 shadow-lg ring-1 ring-black/5 dark:bg-black/40" />
        </div>
      </div>
    </div>
  );
}
