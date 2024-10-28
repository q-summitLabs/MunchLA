import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

interface MainContentProps {
  status: "authenticated" | "loading" | "unauthenticated";
}

export default function MainContent({ status }: MainContentProps) {
  return (
    <motion.div
      className="w-full lg:w-1/2 max-w-2xl px-4 text-center lg:text-left"
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
    >
      <motion.h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        MunchLA
      </motion.h1>
      <motion.h2
        className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Supercharge your culinary adventures
      </motion.h2>
      <motion.p
        className="text-base sm:text-lg md:text-xl mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        Chat to start discovering, planning, and exploring LA&apos;s vibrant
        food scene with AI
      </motion.p>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {status === "authenticated" ? (
          <Link href="/chat">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base px-4 sm:px-6 py-2 rounded-full">
              Start chatting
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base px-4 sm:px-6 py-2 rounded-full">
              Sign in
            </Button>
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
