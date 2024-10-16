"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ChatArea from "./components/ChatArea";
import InputArea from "./components/InputArea";
import { useChatState } from "./hooks/useChatState";
import { useTheme } from "./hooks/useTheme";
import "./styles/chat.css";

export default function MunchLAChatbot() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { data: loginInfo } = useSession();
  const {
    prompt,
    setPrompt,
    isFirstInput,
    currentConversation,
    isSidebarExpanded,
    userSessions,
    isLoading,
    selectedSessionId,
    setSelectedSessionId,
    handleSubmit,
    startNewConversation,
    toggleSidebar,
    handleSessionClick,
    handleRemoveSession,
  } = useChatState(loginInfo?.user?.email);

  return (
    <div
      className={`flex h-screen bg-white text-gray-900 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
        startNewConversation={startNewConversation}
        userSessions={userSessions}
        handleSessionClick={handleSessionClick}
        handleRemoveSession={handleRemoveSession}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        selectedSessionId={selectedSessionId}
        setSelectedSessionId={setSelectedSessionId}
      />
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
        <Header loginInfo={loginInfo} />
        <div className="flex-1 flex justify-center items-start overflow-hidden">
          <div className="w-full max-w-4xl flex flex-col h-full">
            <ChatArea
              isFirstInput={isFirstInput}
              currentConversation={currentConversation}
              isLoading={isLoading}
              loginInfo={loginInfo}
            />
            <InputArea
              prompt={prompt}
              setPrompt={setPrompt}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
