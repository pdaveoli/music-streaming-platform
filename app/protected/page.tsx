import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/// <summary>
/// This page isn't used anymore, if redirected to this page, it will redirect to the home page.
/// </summary>
/// <remarks>
/// This page is used to protect routes that require authentication.
/// If the user is not authenticated, they will be redirected to the login page.
/// If the user is authenticated, they will be redirected to the home page.
/// </remarks>
export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // If the user is authenticated, redirect to the home page
  redirect("/home");
  return null; // This line is never reached, but it's good practice to return something
}
