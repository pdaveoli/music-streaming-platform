"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Hero } from "@/components/hero";

export default async function Home() {

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (userId)
    redirect("/home");

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex flex-col items-center">
        <Hero />
      </div>
    </main>
  );
}
