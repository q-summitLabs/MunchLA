import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { SunIcon, MoonIcon, MoreVerticalIcon, LogOut } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
}

export default function Header({
  isDarkMode,
  toggleDarkMode,
  session,
  status,
}: HeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <motion.header
      className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 z-10"
      variants={{
        hidden: { y: -20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
    >
      <motion.div
        className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        MunchLA
      </motion.div>
      <nav className="flex items-center space-x-4">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-gray-600 dark:text-gray-400"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-5 w-5" />
          </Button>
        </motion.div>
        {status === "authenticated" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="focus:outline-none focus:ring-0"
              >
                <Avatar className="cursor-pointer ring-2 ring-gray-400">
                  <AvatarImage
                    src={session?.user?.image ?? ""}
                    alt={session?.user?.name ?? "User"}
                  />
                  <AvatarFallback>
                    {session?.user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-1" align="end">
              <DropdownMenuItem onClick={handleSignOut}>
                <div className="flex items-center w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/login">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                Sign in
              </Button>
            </Link>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
