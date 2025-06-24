import "../globals.css";
import { AudioProvider } from "@/context/AudioContext"; // Adjust path as needed
import PersistentAudioPlayerUI from "@/components/AudioPlayerUI"; // Your player UI component
import Footer from "@/components/footer"; // Your footer component
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/sidebar"; // Import the Sidebar component
import { Toaster } from "@/components/ui/sonner"


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
                
            
            </main>
          <PersistentAudioPlayerUI /> {/* Player UI always visible */}
        </AudioProvider>
    </div>
  );
}