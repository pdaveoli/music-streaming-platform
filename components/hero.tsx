"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  // Animation variants for framer-motion
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="w-screen min-h-screen bg-black text-white flex flex-col">
      <nav className="w-full p-6 flex justify-between items-center container mx-auto">
        <div className="text-4xl font-bold">
          Free<span className="text-red-500">Stream</span>
        </div>
        <div className="font-semibold text-lg flex items-center gap-4 text-red-700 justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-music-icon lucide-music"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
      </nav>

      {/* Main content area with a two-column layout on medium screens and up */}
      <div className="flex-grow container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 p-6">
        {/* Left Column: Text Content */}
        <motion.header
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-2xl"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl lg:text-6xl font-bold leading-tight"
          >
            Music that <span className="text-red-500">speaks</span> to you
          </motion.h1>
          <motion.div
            variants={fadeInUp}
            className="w-20 h-2 bg-red-500 my-4"
          ></motion.div>
          <motion.p variants={fadeInUp} className="text-xl mb-10 text-gray-300">
            FreeStream is a completely free online streaming platform for many
            modern songs. With synced lyrics and playlists, you have full
            control over aux and the mood of the party!
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-row items-center justify-start"
          >
            <Button
              asChild
              className="bg-red-500 hover:bg-red-600 text-white text-lg font-medium px-6 py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="link"
              className="text-lg font-light px-4 py-2 rounded shadow ml-4 hover:animate-pulse text-white"
            >
              <Link
                href="/auth/login"
                className="flex flex-row items-center justify-center gap-1"
              >
                Log in <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        </motion.header>

        {/* Right Column: Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full h-80 md:h-full"
        >
          <Image
            src="/heroPicture.jpg"
            alt="A person listening to music with headphones"
            layout="fill"
            objectFit="cover"
            className="rounded-2xl shadow-2xl shadow-red-500/20"
            priority
          />
        </motion.div>
      </div>
    </div>
  );
}
