"use server";

import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";

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