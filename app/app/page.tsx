"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useUserPreferences } from "@/stores/useUserPreferences";
import PlayNowButton from "@/components/home/PlayNowButton";
import ExpertModeToggle from "@/components/home/ExpertModeToggle";
import FactsCard from "@/components/home/FactsCard";
import NavigationButton from "@/components/navigation/NavigationButton";
import { DataLoadingScreen } from "@/components/ui/LoadingScreen";
import { trackEvent } from "@/lib/analytics";

export default function Home() {
  const router = useRouter();

  const { isFirstVisit, setFirstVisit, hydrated } = useUserPreferences();

  // Handle first visit (page view tracking handled by ClientLayout)
  useEffect(() => {
    if (!hydrated) return;

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
      // Questions will be fetched server-side
      router.push("/quiz/random?mode=first-visit");
    }
  }, [isFirstVisit, hydrated, router, setFirstVisit]);

  // Show loading screen during first visit handling
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <DataLoadingScreen />
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
