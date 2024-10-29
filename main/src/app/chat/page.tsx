"use client";

import { useState, useEffect } from "react";
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const {
    prompt,
    setPrompt,
    isFirstInput,
    currentConversation,
    userSessions,
    isLoading,
    selectedSessionId,
    setSelectedSessionId,
    handleSubmit,
    startNewConversation,
    handleSessionClick,
    handleRemoveSession,
  } = useChatState(loginInfo?.user?.email);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slide-right {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(0);
        }
      }
      @keyframes slide-left {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-100%);
        }
      }
      .animate-slide-right {
        animation: slide-right 0.3s ease-out;
      }
      .animate-slide-left {
        animation: slide-left 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 ${
          isSidebarExpanded ? "sm:ml-80" : "sm:ml-16"
        }`}
      >
        <Header loginInfo={loginInfo} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex justify-center items-start overflow-hidden">
          <div
            className={`w-full max-w-4xl flex flex-col h-full transition-all duration-300`}
          >
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
      {isSidebarExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 sm:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}
