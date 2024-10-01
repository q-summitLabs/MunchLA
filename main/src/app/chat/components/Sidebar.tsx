import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRightIcon,
  MenuIcon,
  PlusIcon,
  MoreHorizontalIcon,
  TrashIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { Session } from "../types";

type SidebarProps = {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  startNewConversation: () => void;
  userSessions: Session[];
  handleSessionClick: (sessionId: string) => void;
  handleRemoveSession: (sessionId: string) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
};

export default function Sidebar({
  isSidebarExpanded,
  toggleSidebar,
  startNewConversation,
  userSessions,
  handleSessionClick,
  handleRemoveSession,
  toggleTheme,
  isDarkMode,
}: SidebarProps) {
  return (
    <aside
      className={`bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarExpanded ? "w-64" : "w-16"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          {isSidebarExpanded ? (
            <ChevronRightIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </Button>
        {isSidebarExpanded && (
          <span className="font-semibold text-gray-900 dark:text-white">
            MunchLA
          </span>
        )}
      </div>
      {isSidebarExpanded && (
        <>
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={startNewConversation}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              New chat
            </Button>
          </div>
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-2">
              {userSessions.map((session) => (
                <div
                  key={session.id}
                  className="group relative flex items-center justify-between"
                >
                  <Button
                    variant="ghost"
                    className="w-full text-sm pr-8 flex items-center justify-between text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => handleSessionClick(session.id)}
                  >
                    <span className="truncate max-w-[180px]">
                      {session.conversation_preview}
                    </span>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                          >
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRemoveSession(session.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  MunchLA <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                  MunchLA Pro
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                  Settings
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={toggleTheme}
                  className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {isDarkMode ? (
                    <>
                      <SunIcon className="mr-2 h-4 w-4" />
                      Light mode
                    </>
                  ) : (
                    <>
                      <MoonIcon className="mr-2 h-4 w-4" />
                      Dark mode
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </aside>
  );
}
