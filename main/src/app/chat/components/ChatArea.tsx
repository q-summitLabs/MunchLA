import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2Icon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ShareIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Conversation } from "../types";
import { Session } from "next-auth";
import { RestaurantCard } from "@/components/restaurant_cards/restaurant_cards";
import SuggestionCard from "./SuggestionCard";

type ChatAreaProps = {
  isFirstInput: boolean;
  currentConversation: Conversation | null;
  isLoading: boolean;
  loginInfo: Session | null;
};

export default function ChatArea({
  isFirstInput,
  currentConversation,
  isLoading,
  loginInfo,
}: ChatAreaProps) {
  const suggestions = [
    {
      text: "Suggest restaurants with high aura and good vibes for me and my girlfriend!",
      icon: "MapPin",
    },
    {
      text: "I dont wanna eat any more burgers find me asian food where pretty blonde asians eat",
      icon: "Camera",
    },
    {
      text: "Give me a list of all the best sushi restaurants in Little Tokyo I love sushi lol.",
      icon: "List",
    },
    {
      text: "Please find me the best ice cream shop in Los Angeles, I really like cookies and cream",
      icon: "IceCream",
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 pb-24">
      <div className="space-y-8 min-h-full flex flex-col justify-center">
        {isFirstInput ? (
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-left">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300">
                Hello, {loginInfo?.user?.name ? loginInfo.user.name : "there"}!
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 text-left">
              How can I help you discover LA&apos;s culinary delights today?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  text={suggestion.text}
                  icon={suggestion.icon}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {currentConversation?.messages?.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div
                    className={`flex ${
                      message.isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        message.isBot
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "bg-purple-500 text-white"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {message.restaurants && (
                    <div className="mt-4 space-y-4">
                      <AnimatePresence>
                        {message.restaurants.map(
                          (restaurant, restaurantIndex) => (
                            <motion.div
                              key={restaurantIndex}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{
                                duration: 0.3,
                                delay: restaurantIndex * 0.1,
                              }}
                            >
                              <RestaurantCard restaurant={restaurant} />
                            </motion.div>
                          )
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex justify-start">
                <div className="inline-block p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                  <Loader2Icon className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              </div>
            )}
            {currentConversation &&
              currentConversation.messages &&
              currentConversation.messages.length > 0 && (
                <div className="flex justify-start space-x-2">
                  <Button variant="ghost" size="icon">
                    <ThumbsUpIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ThumbsDownIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ShareIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
          </div>
        )}
      </div>
    </main>
  );
}
