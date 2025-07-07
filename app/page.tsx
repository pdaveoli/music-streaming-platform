"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing-components/hero";
import FeaturesView  from "@/components/landing-components/features-view";
import LandingFooter from "@/components/landing-components/landing-footer";

/// <summary>
/// Home page component that displays the landing page with a hero section, features, and footer.
/// If the user is already authenticated, they are redirected to the home page.
/// </summary>
/// <remarks>
/// This component checks if a user is authenticated using Supabase.
/// If authenticated, it redirects to the "/home" route.
/// Otherwise, it displays the landing page content.
/// </remarks>
export default async function Home() {

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (userId)
    redirect("/home");

  return (
    <main className="min-h-screen flex flex-col items-center overflow-auto no-scrollbar min-w-screen">
      <div className="flex flex-col items-center w-full">
        <Hero />
        <FeaturesView />
        <LandingFooter />
      </div>
    </main>
  );
}
