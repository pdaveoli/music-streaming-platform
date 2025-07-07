import "../globals.css";
import { AudioProvider } from "@/context/AudioContext"; // Adjust path as needed
import PersistentAudioPlayerUI from "@/components/AudioPlayerUI"; // Your player UI component
import Footer from "@/components/footer"; 
import AppSidebar from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner"

/// <summary>
/// Layout for the music player and all the logged in pages of the application.
/// This layout includes the audio player, sidebar, and footer.
/// </summary>
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const playerHeight = "84px";
  return (
    <div className="min-h-screen">
        <AudioProvider>
            <Toaster />
            <AppSidebar />
            <main 
            className={`pt-[84px] md:pl-64 min-h-[calc(100vh_-_${playerHeight})]`}
            >
                {children}
                
            <Footer />
            </main>
          <PersistentAudioPlayerUI /> {/* Player UI always visible */}
        </AudioProvider>
    </div>
  );
}