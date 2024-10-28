"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import ChatPost from "./components/ChatPost";
import Footer from "./components/Footer";

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: session, status } = useSession();

  useEffect(() => {
    setIsDarkMode(false);
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const chatPosts = [
    {
      prompt: "Where is a high-end sushi place in Los Angeles",
      response:
        "Nobu Los Angeles offers a luxurious sushi experience with a globally renowned reputation for its high-quality ingredients and innovative dishes. The elegant ambiance and creative menu, featuring items like miso-marinated cod and yellowtail jalapeño, make it a top choice for sushi enthusiasts seeking both sophistication and exceptional flavors.",
      image: "/images/nobu.jpg",
    },
    {
      prompt: "What's a top spot for chicken lovers in the Los Angeles area?",
      response:
        "Canes' is a popular fast-food chain throughout the Los Angeles area, known for its iconic offerings like the Caniac Combo. With numerous locations across the city, it provides a convenient and consistent dining option for both locals and visitors.",
      image: "/images/canes.png",
    },
    {
      prompt: "What's a great French bistro with a great view in Los Angeles?",
      response:
        "Porch in Los Angeles is a charming French bistro known for its delightful, traditional cuisine and cozy ambiance. With a menu that features classic dishes like croissants and quiches, it offers an authentic taste of France right in the heart of the city.",
      image: "/images/porch-la.jpeg",
    },
    {
      prompt: "Recommend a romantic Italian restaurant in Los Angeles",
      response:
        "Bestia in Los Angeles is an excellent choice for a romantic Italian dining experience. Known for its industrial-chic setting, it offers a cozy yet vibrant atmosphere. The menu boasts a variety of house-made charcuterie, pastas, and wood-fired pizzas, paired with a diverse selection of wines and cocktails, making it perfect for a memorable date night.",
      image: "/images/bestia.jpg",
    },
    {
      prompt: "What's the best place for Korean BBQ in Koreatown?",
      response:
        "Quarter's BBQ in Koreatown is widely regarded as one of the best Korean BBQ restaurants in Los Angeles. Known for its high-quality meat selections and attentive service, it offers an authentic Korean grilling experience. Don't miss their marinated short ribs (galbi) and beef brisket.",
      image: "/images/kbbq.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % chatPosts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [chatPosts.length]);

  return (
    <motion.div
      className={`h-screen flex flex-col ${isDarkMode ? "dark" : ""}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white  font-lexend flex flex-col h-full">
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          session={session}
          status={status}
        />

        <main className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 overflow-hidden">
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
            <MainContent status={status} />
            <ChatPost chatPosts={chatPosts} currentIndex={currentIndex} />
          </div>
        </main>

        <Footer />
      </div>
    </motion.div>
  );
}
