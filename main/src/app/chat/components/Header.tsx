"use client";

import { Button } from "@/src/components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { GridIcon, UtensilsIcon, LogOut } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

type HeaderProps = {
  loginInfo: Session | null;
};

export default function Header({ loginInfo }: HeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <GridIcon className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <UtensilsIcon className="h-6 w-6" />
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="focus:outline-none focus:ring-0" // Added here
          >
            <Avatar className="cursor-pointer ring-2 ring-gray-400 ">
              <AvatarImage
                src={loginInfo?.user?.image ?? ""}
                alt={loginInfo?.user?.name ?? "User"}
                crossOrigin="anonymous"
              />
              <AvatarFallback>
                {loginInfo?.user?.name?.[0] ?? "U"}
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
    </header>
  );
}
