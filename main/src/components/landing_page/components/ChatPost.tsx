import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ChatPostItem {
  prompt: string;
  response: string;
  image: string;
}

interface ChatPostProps {
  chatPosts: ChatPostItem[];
  currentIndex: number;
}

export default function ChatPost({ chatPosts, currentIndex }: ChatPostProps) {
  return (
    <motion.div
      className="w-full lg:w-1/2 max-w-2xl h-[40vh] sm:h-[50vh] lg:h-[60vh]"
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Image
              src={chatPosts[currentIndex].image}
              alt="Food"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-2xl object-cover"
              priority={currentIndex === 0}
            />
            <div className="absolute inset-x-4 bottom-4 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md max-w-[80%] max-h-[30%] overflow-y-auto">
              <p className="text-xs sm:text-sm font-semibold mb-1 text-purple-600 dark:text-purple-400">
                {chatPosts[currentIndex].prompt}
              </p>
              <p className="text-xs sm:text-sm line-clamp-2 sm:line-clamp-3">
                {chatPosts[currentIndex].response}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
