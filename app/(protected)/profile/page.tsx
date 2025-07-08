// ! Profile route that redirects to the account page if the user is not an email user
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfileRoute() {
    const supabase = await createClient();
    const { data: { user }} = await supabase.auth.getUser();

    if (!user || !user.email) {
        redirect("/auth/login");
    }

    // get the username from the user metadata
    const {data: userDetails, error} = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error || !userDetails) {
        console.error("Error fetching user details:", error);
        redirect("/auth/login");
    }

    // Check if the user has completed their profile
    if (!userDetails.name || !userDetails.date_of_birth || !userDetails.username) {
        redirect("/welcome");
    }

    // Redirect to the profile page
    redirect(`/u/${userDetails.username}`);

    return (
        <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
        </div>
    );
}