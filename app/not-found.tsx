import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import AppSidebar from "@/components/sidebar";
import { AlertTriangle } from "lucide-react";

export default async function NotFound() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This is the main content for the 404 page.
  const NotFoundContent = () => (
    <div className="flex flex-col items-center justify-center text-center gap-4">
      <AlertTriangle className="w-16 h-16 text-red-500" />
      <h1 className="text-5xl font-bold">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground">
        Sorry, the page you are looking for does not exist.
      </p>
      <Button asChild className="mt-4">
        <Link href={user ? "/home" : "/"}>
          {user ? "Go to Home" : "Go to Homepage"}
        </Link>
      </Button>
    </div>
  );

  // If the user is logged in, show the 404 page within the main app layout.
  if (user) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex flex-1 flex-col md:pl-64">
          <div className="flex items-center justify-center flex-1">
            <NotFoundContent />
          </div>
        </main>
      </div>
    );
  }

  // If the user is logged out, show a simple, centered 404 page.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <NotFoundContent />
    </div>
  );
}
