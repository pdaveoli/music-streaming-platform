import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppSidebar from "@/components/sidebar";
import Footer from "@/components/footer";

export default async function NotFound() {
  // If user is logged in, show a custom 404 page with sidebar and persistant layout
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 max-w-screen">
        <AppSidebar />
        <div className="md:pl-64 min-h-[calc(100vh_-_84px)] w-full">
          <div className="items-center justify-center h-[calc(100vh_-_140px)] w-full flex flex-col text-center">
            <div className="flex-1 flex flex-col items-center justify-center h-full w-full">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-6">Page Not Found</p>
            <Link href="/home" className="text-blue-500 hover:underline">
              Go back to Home
            </Link>
            </div>
          </div>
        </div>
        <div className="pl-64 w-full bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
            <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page Not Found</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Go back to Home
      </Link>
    </div>
  );
}
