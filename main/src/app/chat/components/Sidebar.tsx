import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  ChevronRightIcon,
  MenuIcon,
  PlusIcon,
  MoreVerticalIcon,
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
  setSelectedSessionId: (sessionId: string | null) => void;
  isDarkMode: boolean;
  selectedSessionId: string | null;
};

export default function Sidebar({
  isSidebarExpanded,
  toggleSidebar,
  startNewConversation,
  userSessions,
  handleSessionClick,
  handleRemoveSession,
  toggleTheme,
  setSelectedSessionId,
  isDarkMode,
  selectedSessionId,
}: SidebarProps) {

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    handleSessionClick(sessionId);
  };

  return (
    <>
      {/* Mobile overlay with blur effect */}
      {isSidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden transition-opacity duration-300" 
          onClick={toggleSidebar}
        />
      )}

      {/* Background div - only visible on desktop */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out z-40 hidden sm:block
          ${isSidebarExpanded ? "w-64 md:w-80" : "w-16"}
        `}
      />

      {/* Sidebar */}
      <aside
        className={`fixed h-full border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out z-50
          sm:left-0 
          ${isSidebarExpanded 
            ? "w-[65%] sm:w-64 md:w-80 translate-x-0" 
            : "w-16 -translate-x-full sm:translate-x-0"
          }
          top-0 left-0 sm:top-0
          bg-gray-100 dark:bg-gray-800
        `}
      >
        <div className="p-4 flex items-center justify-between bg-gray-100 dark:bg-gray-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 rounded-full flex"
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

        <div className={`flex flex-col flex-grow overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="p-4 bg-gray-100 dark:bg-gray-800">
            <Button
              variant="outline"
              className="w-full justify-start text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 rounded-full"
              onClick={startNewConversation}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              New chat
            </Button>
          </div>

          <ScrollArea className="flex-grow px-4 bg-gray-100 dark:bg-gray-800">
            <div className="space-y-2">
              {userSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative flex items-center justify-between py-1 px-3 rounded-full transition-colors duration-200 cursor-pointer ${
                    selectedSessionId === session.id
                      ? "bg-purple-200 dark:bg-purple-800"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleSessionSelect(session.id)}
                >
                  <span className="truncate max-w-[180px] text-sm text-gray-900 dark:text-white">
                    {session.conversation_preview}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVerticalIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSession(session.id);
                        }}
                        className="text-red-600 dark:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 mt-auto bg-gray-100 dark:bg-gray-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 rounded-full"
                >
                  MunchLA <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={toggleTheme}
                  className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 rounded-full"
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
        </div>
      </aside>
    </>
  );
}