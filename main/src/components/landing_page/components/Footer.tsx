import { motion } from "framer-motion";
import { UtensilsIcon } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      className="py-2 text-center text-xs text-gray-600 dark:text-gray-400"
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
    >
      <UtensilsIcon className="inline-block mr-1 h-3 w-3" />
      MunchLA &middot; Privacy & Terms
    </motion.footer>
  );
}
