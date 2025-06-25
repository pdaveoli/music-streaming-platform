"use client";

import {
  AudioWaveform,
  MicVocal,
  ListMusic,
  Headphones,
  Compass,
  LaptopMinimal,
} from "lucide-react";
import { motion, Variants } from "framer-motion";

// Define the features in an array for easier mapping and maintenance
const features = [
  {
    icon: AudioWaveform,
    title: "Free Streaming",
    description:
      "Enjoy unlimited access to a vast library of songs without any cost.",
  },
  {
    icon: MicVocal,
    title: "Synced Lyrics",
    description:
      "Sing along with your favorite tracks with real-time synced lyrics.",
  },
  {
    icon: ListMusic,
    title: "Custom Playlists",
    description:
      "Create and manage your own playlists to suit your mood and occasions.",
  },
  {
    icon: Headphones,
    title: "High-Quality Audio",
    description:
      "Experience your music in high-quality audio for the best listening experience.",
  },
  {
    icon: LaptopMinimal,
    title: "User-Friendly Interface",
    description:
      "Navigate easily with our intuitive and user-friendly interface designed for all users.",
  },
  {
    icon: Compass,
    title: "Discover New Music",
    description:
      "Explore new genres and artists with personalized recommendations and trending playlists.",
  },
];

export default function FeaturesView() {
  // Explicitly type the animation objects as 'Variants'
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Stagger delay between each child
      },
    },
  };

  // Explicitly type the animation objects as 'Variants'
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="w-full py-16 bg-gradient-to-b to-gray-200 from-white dark:to-gray-900 dark:from-black text-black dark:text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Features of <span className="text-red-500">FreeStream</span>
        </h2>
        {/* The motion container for staggering animations */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show" // Animate when the component is in view
          viewport={{ once: true, amount: 0.2 }} // Configure when the animation triggers
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon; // Get the icon component
            return (
              // Each feature card is a motion.div with its own animation variant
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-lg dark:hover:shadow-red-500/20 hover:scale-105 transition-all duration-300"
              >
                <Icon className="w-12 h-12 text-red-500 mb-6" />
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
