"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react";
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
    <div className="w-full min-h-screen dark:bg-black bg-white text-black dark:text-white flex flex-col">
      <nav className="w-full p-6 flex justify-between items-center container mx-auto">
        <div className="text-4xl font-bold">
          Free<span className="text-red-500">Stream</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            asChild
            className="bg-red-500 hover:bg-red-600 text-white text-lg font-medium px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
          >
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
          <Button
            asChild
            variant="link"
            className="text-lg font-light rounded shadow hover:animate-pulse text-black dark:text-white"
          >
            <Link href="/auth/login">
              Log in
            </Link>
          </Button>
        </div>
      </nav>
      <div className="flex items-center justify-center w-full">
      <Alert variant="destructive" className="w-full max-w-5xl mt-4">
          <AlertTitle>User System Changes</AlertTitle>
          <AlertCircleIcon />
          <AlertDescription>
            When you log in, you will be prompted to set a username. This username will be used to identify you in the system and will be unique across all users. There are also other fields that will require filling in. Sorry for any inconvenience this may cause, but this is a necessary change to improve the user experience and functionality of the platform.
          </AlertDescription>
        </Alert>
      </div>
      {/* Main content area */}
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
          <motion.p
            variants={fadeInUp}
            className="text-xl mb-10 text-gray-600 dark:text-gray-300"
          >
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
            className="rounded-2xl shadow-2xl shadow-gray-400/20 dark:shadow-red-500/20"
            priority
          />
        </motion.div>
      </div>
    </div>
  );
}
