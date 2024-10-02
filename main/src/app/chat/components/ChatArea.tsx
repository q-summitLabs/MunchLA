import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Conversation } from "../types";
import { Session } from "next-auth";
import { RestaurantCard } from "@/components/restaurant_cards/restaurant_cards";
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
      <clipPath id="pan-clip">
        <rect rx="12" ry="14" x="8" y="52" width="68" height="28" />
      </clipPath>
      <defs>
        <linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>
        <mask id="pl-mask">
          <rect x="0" y="0" width="88" height="80" fill="url(#pl-grad)" />
        </mask>
      </defs>
      <g fill="currentColor">
        <g
          fill="none"
          strokeDasharray="20 221"
          strokeDashoffset="20"
          strokeLinecap="round"
          strokeWidth="4"
        >
          <g stroke="hsl(38,90%,50%)">
            <circle
              className="pl__ring"
              cx="44"
              cy="40"
              r="35"
              transform="rotate(90,44,40)"
            />
          </g>
          <g stroke="hsl(8,90%,40%)" mask="url(#pl-mask)">
            <circle
              className="pl__ring"
              cx="44"
              cy="40"
              r="35"
              transform="rotate(90,44,40)"
            />
          </g>
        </g>
        <g fill="hsla(223,10%,70%,0)">
          <g className="pl__drop pl__drop--1">
            <circle className="pl__drop-inner" cx="13" cy="60" r="2" />
          </g>
          <g className="pl__drop pl__drop--2">
            <circle className="pl__drop-inner" cx="13" cy="60" r="2" />
          </g>
          <g className="pl__drop pl__drop--3">
            <circle className="pl__drop-inner" cx="67" cy="72" r="2" />
          </g>
          <g className="pl__drop pl__drop--4">
            <circle className="pl__drop-inner" cx="67" cy="72" r="2" />
          </g>
          <g className="pl__drop pl__drop--5">
            <circle className="pl__drop-inner" cx="67" cy="72" r="2" />
          </g>
        </g>
        <g className="pl__pan">
          <rect
            rx="2"
            ry="2"
            x="4"
            y="66"
            width="68"
            height="14"
            clipPath="url(#pan-clip)"
            id="pan"
          />
          <rect rx="2" ry="2" x="76" y="66" width="48" height="7" />
        </g>
        <rect
          className="pl__shadow"
          fill="hsla(223,10%,50%,0.2)"
          rx="3.5"
          ry="3.5"
          x="10"
          y="121"
          width="60"
          height="7"
        />
      </g>
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
            <h1 className="text-3xl font-bold text-left">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300">
                Hello, {loginInfo?.user?.name ? loginInfo.user.name : "there"}!
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-left">
              How can I help you discover LA&apos;s culinary delights today?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                      className={`inline-block p-2 rounded-lg max-w-[70%] text-sm ${
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
                <FryingPanAnimation />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
