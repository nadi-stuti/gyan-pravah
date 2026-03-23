"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useUserPreferences } from "@/stores/useUserPreferences";
import PlayNowButton from "@/components/home/PlayNowButton";
import ExpertModeToggle from "@/components/home/ExpertModeToggle";
import FactsCard from "@/components/home/FactsCard";
import NavigationButton from "@/components/navigation/NavigationButton";
import { DataLoadingScreen } from "@/components/ui/LoadingScreen";
import { trackEvent } from "@/lib/analytics";

// 20 Geographical & Dharmic facts about Indian Rivers
const RIVER_FACTS = [
  "Geographical: The Ganga possesses unique bacteriophages in its waters, giving it a natural self-cleansing property that prevents stagnation.",
  "Dharmic: Mother Ganga descended from the heavens and was caught in Lord Shiva's matted hair to soften her impact and prevent the Earth's destruction.",
  "Geographical: The Narmada is one of only three major rivers in peninsular India that flows from east to west, rushing through a rift valley.",
  "Dharmic: The Yamuna, originating from the Yamunotri glacier, is the sister of Yama, the God of Death. Bathing in it is said to free one from the fear of death.",
  "Dharmic: The Saraswati is a legendary, hidden river that flows invisibly to meet the Ganga and Yamuna at the sacred Triveni Sangam in Prayagraj.",
  "Dharmic: Every pebble found in the riverbed of the Narmada is considered a naturally formed Shiva Linga, known as 'Banalinga'.",
  "Geographical: The Godavari is the second-longest river in India after the Ganga and is respectfully known as the 'Dakshin Ganga' (Ganges of the South).",
  "Dharmic: The Brahmaputra is one of the very few rivers in the world with a masculine name, which literally translates to 'Son of Brahma'.",
  "Geographical: The Brahmaputra originates in Tibet where it is called the Yarlung Tsangpo, taking a massive U-turn before entering India.",
  "Dharmic: The Kaveri river was formed by the grace of Lord Ganesha, who took the form of a crow to tip over Sage Agastya's kamandalu (water pot).",
  "Geographical: The Krishna river originates from a water spout emerging from the mouth of a cow statue in the ancient Mahabaleshwar temple.",
  "Geographical: The Sindhu (Indus) is the historic river that gave India its name. It nurtures one of the world's oldest civilisations.",
  "Dharmic: The sacred city of Ujjain rests on the banks of the Shipra river, where the magnificent Simhastha Kumbh Mela is held every 12 years.",
  "Dharmic: The Tapi (Tapti) river is named after Goddess Tapati, who is the daughter of Surya (the Sun God) and Chhaya.",
  "Geographical: The Mahanadi river is harnessed by the Hirakud Dam in Odisha, which stands as the longest earthen dam in the world.",
  "Dharmic: The Bhagirathi, the source stream of the Ganga, is named after King Bhagiratha, whose intense penance brought the holy river to Earth.",
  "Geographical: The Alaknanda meets the Bhagirathi at the sacred confluence of Devprayag. From this point onward, it is officially called the Ganga.",
  "Dharmic: The Gomti river is believed to be the daughter of Sage Vashistha. Bathing in its waters on Ekadashi is said to wash away negative karmas.",
  "Dharmic: Due to an ancient Puranic curse, the Chambal river was considered unholy—which ironically protected it from modern industrial pollution.",
  "Dharmic: The Tungabhadra river is heavily associated with the ancient Kishkindha kingdom of the Ramayana, where it is referenced as the Pampa River."
];

export default function Home() {
  const router = useRouter();
  const { isFirstVisit, setFirstVisit, hydrated } = useUserPreferences();

  // Cold Boot Timer States
  const [isBooting, setIsBooting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Initialize boot check and random starting fact
  useEffect(() => {
    // Only show the 30-sec timer once per session so users aren't annoyed on return
    const hasBooted = sessionStorage.getItem("strapiBooted");
    if (!hasBooted) {
      setIsBooting(true);
    }
    setCurrentFactIndex(Math.floor(Math.random() * RIVER_FACTS.length));
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isBooting) return;

    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setIsBooting(false);
      sessionStorage.setItem("strapiBooted", "true");
    }
  }, [timeLeft, isBooting]);

  const showNextFact = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * RIVER_FACTS.length);
    } while (newIndex === currentFactIndex);
    setCurrentFactIndex(newIndex);
  };

  // Handle first visit (page view tracking handled by ClientLayout)
  useEffect(() => {
    if (!hydrated || isBooting) return; // Wait for hydration AND server boot

    if (isFirstVisit) {
      // Track first visit quiz start
      trackEvent("quiz_started", {
        mode: "first-visit",
        total_questions: 7,
        is_expert_mode: false,
        is_first_visit: true,
        quiz_mode: "first-visit",
      });

      // Mark as no longer first visit
      setFirstVisit(false);

      // Navigate to first-visit quiz page
      router.push("/quiz/random?mode=first-visit");
    }
  }, [isFirstVisit, hydrated, isBooting, router, setFirstVisit]);

  // Handle Hydration Loading
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <DataLoadingScreen />
      </div>
    );
  }

  // Handle Strapi Cold Boot Loading Screen
  if (isBooting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6" style={{ backgroundColor: "#8B7FC8" }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Waking up Servers</h2>
          <div className="text-5xl font-extrabold text-white mb-2 tracking-widest">{timeLeft}s</div>
          <p className="text-sm sm:text-base text-white/80 mb-6">
            Our databases are doing a quick cold-boot. Expand your knowledge while you wait!
          </p>

          <div className="min-h-[140px] flex items-center justify-center bg-white/20 p-5 rounded-2xl mb-6 w-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentFactIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-white text-base sm:text-lg font-medium italic drop-shadow-sm"
              >
                "{RIVER_FACTS[currentFactIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>

          <button
            onClick={showNextFact}
            className="px-6 py-3 bg-white text-[#8B7FC8] font-bold rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95"
          >
            Show Next Fact
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#8B7FC8" }}>
      <main className="flex min-h-screen flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          {/* App Title */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Gyan Pravah
            </h1>
            <p className="text-white opacity-90 text-sm sm:text-base px-2">
              Test your knowledge with engaging animated quizzes
            </p>
          </motion.div>

          <div className="space-y-4 sm:space-y-6">
            {/* Play Now Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PlayNowButton />
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <div className="flex-1 h-px bg-white opacity-30"></div>
              <span className="px-4 text-sm text-white opacity-90">or</span>
              <div className="flex-1 h-px bg-white opacity-30"></div>
            </motion.div>

            {/* Choose Topics Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <NavigationButton
                to="/topics"
                className="w-full bg-white rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105 min-h-touch-lg touch-manipulation"
                trackingData={{ source: "home_page", action: "choose_topics" }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Choose Topics & Start Quiz
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Select your favorite topics and customize your experience
                    </p>
                  </div>
                  <div className="text-gray-600 shrink-0 ml-2">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </NavigationButton>
            </motion.div>

            {/* Expert Mode Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ExpertModeToggle />
            </motion.div>

            {/* Facts Card */}
            <FactsCard />
          </div>
        </div>
      </main>
    </div>
  );
}
