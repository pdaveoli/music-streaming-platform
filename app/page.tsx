"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing-components/hero";
import FeaturesView  from "@/components/landing-components/features-view";
import LandingFooter from "@/components/landing-components/landing-footer";

export default async function Home() {

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (userId)
    redirect("/home");

  return (
    <main className="min-h-screen flex flex-col items-center overflow-auto no-scrollbar">
      <div className="flex flex-col items-center">
        <Hero />
        <FeaturesView />
        <LandingFooter />
      </div>
    </main>
  );
}
