import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setUserProperties } from "@/lib/analytics";

// User Preferences Store - Simplified to essential preferences only
interface UserPreferencesState {
  isFirstVisit: boolean;
  expertModeEnabled: boolean;
  hydrated: boolean;

  // Actions
  setFirstVisit: (isFirstVisit: boolean) => void;
  setExpertModeEnabled: (enabled: boolean) => void;
  resetPreferences: () => void;
  setHydrated: (hydrated: boolean) => void;
}

const initialState = {
  isFirstVisit: true,
  expertModeEnabled: false,
  hydrated: false,
};

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set) => ({
      ...initialState,

      // Actions
      setFirstVisit: (isFirstVisit) => {
        set({ isFirstVisit });
        setUserProperties({ is_first_visit: isFirstVisit });
      },
      setExpertModeEnabled: (enabled) => {
        set({ expertModeEnabled: enabled });
        setUserProperties({ expert_mode_enabled: enabled });
      },
      resetPreferences: () => set(initialState),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "quiz-user-preferences",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true); // mark hydration done
      },
    }
  )
);
