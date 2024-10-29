import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Conversation, Message } from "../types";
import { Session } from "next-auth";
import RestaurantCard from "./RestaurantCard";
import SuggestionCard from "./SuggestionCard";
import "../styles/custom-scrollbar.css";
import "../styles/frying-pan-animation.css";

type ChatAreaProps = {
  isFirstInput: boolean;
  currentConversation: Conversation | null;
  isLoading: boolean;
  loginInfo: Session | null;
};

const FryingPanAnimation = () => (
  <div className="inline-flex items-center space-x-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
    <svg
      className="pl"
      viewBox="0 0 128 128"
      width="16"
      height="16"
      role="img"
      aria-label="A pan being used to flip a blob resembling bacon as it splashes drops of grease in and out"
    >
      {/* SVG content remains the same */}
    </svg>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="text-purple-500 font-semibold text-sm"
    >
      Cooking up a response...
    </motion.div>
  </div>
);

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
    <main className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar">
      <div className="space-y-6 min-h-full flex flex-col justify-center">
        {isFirstInput ? (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-left">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300">
                Hello, {loginInfo?.user?.name ? loginInfo.user.name : "there"}!
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 text-left">
              How can I help you discover LA&apos;s culinary delights today?
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
          <div className="space-y-4">
            {currentConversation?.messages?.map((message, index) => (
              <MessageItem key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <FryingPanAnimation />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function MessageItem({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
      >
        <div
          className={`inline-block p-2 rounded-lg max-w-full sm:max-w-[70%] text-sm ${
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
        <div className="mt-3 space-y-3">
          {message.restaurants.map((restaurant, restaurantIndex) => (
            <motion.div
              key={restaurantIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: restaurantIndex * 0.1 }}
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
