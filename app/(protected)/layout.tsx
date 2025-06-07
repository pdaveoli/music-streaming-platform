import "../globals.css";
import { AudioProvider } from "@/context/AudioContext"; // Adjust path as needed
import PersistentAudioPlayerUI from "@/components/AudioPlayerUI"; // Your player UI component



export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AudioProvider>
          <PersistentAudioPlayerUI /> {/* Player UI always visible */}
          <main className="pt-20">{children}</main>
        </AudioProvider>
      </body>
    </html>
  );
}