import "../globals.css";
import { AudioProvider } from "@/context/AudioContext"; // Adjust path as needed
import PersistentAudioPlayerUI from "@/components/AudioPlayerUI"; // Your player UI component
import Footer from "@/components/footer"; // Your footer component

// TODO: https://ui.shadcn.com/docs/components/sidebar

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <AudioProvider>
        <PersistentAudioPlayerUI /> {/* Player UI always visible */}
          <main className="pt-20">{children}</main>
          
        </AudioProvider>
        </div>
      
  );
}