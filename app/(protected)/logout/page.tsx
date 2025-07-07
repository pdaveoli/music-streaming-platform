"use server";
import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";

/// <summary>
/// Logout route
/// This route handles user logout by signing out from Supabase and redirecting to the home page.
/// </summary>
/// <remarks>
/// This route is used to log out the user from the application.
/// It signs out the user from Supabase and redirects them to the home page.
/// </remarks>
export default async function LogoutPage() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Logging you out...</h1>
            <p className="text-gray-600">You will be redirected shortly.</p>
        </div>
    )
}