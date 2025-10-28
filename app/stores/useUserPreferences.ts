import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoredUserPreferences } from '@gyan-pravah/types'
import { setUserProperties } from '@/lib/analytics'

// User Preferences Store - Persisted to localStorage
interface UserPreferencesState extends StoredUserPreferences {
  // Actions
  setFirstVisit: (isFirstVisit: boolean) => void
  setExpertModeEnabled: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setLastPlayedTopic: (topic: string) => void
  setLastPlayedSubtopic: (subtopic: string) => void
  incrementGamesPlayed: () => void
  setBestScore: (score: number) => void
  resetPreferences: () => void
}

const initialState: StoredUserPreferences = {
  isFirstVisit: true,
  expertModeEnabled: false,
  soundEnabled: true,
  lastPlayedTopic: undefined,
  lastPlayedSubtopic: undefined,
  totalGamesPlayed: 0,
  bestScore: 0,
}

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Actions
      setFirstVisit: (isFirstVisit) => {
        set({ isFirstVisit })
        setUserProperties({ is_first_visit: isFirstVisit })
      },
      setExpertModeEnabled: (enabled) => {
        set({ expertModeEnabled: enabled })
        setUserProperties({ expert_mode_enabled: enabled })
      },
      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled })
        setUserProperties({ sound_enabled: enabled })
      },
      setLastPlayedTopic: (topic) => {
        set({ lastPlayedTopic: topic })
        setUserProperties({ last_played_topic: topic })
      },
      setLastPlayedSubtopic: (subtopic) => {
        set({ lastPlayedSubtopic: subtopic })
        setUserProperties({ last_played_subtopic: subtopic })
      },
      incrementGamesPlayed: () => {
        const newCount = get().totalGamesPlayed + 1
        set({ totalGamesPlayed: newCount })
        setUserProperties({ total_games_played: newCount })
      },
      setBestScore: (score) => {
        const newBestScore = Math.max(get().bestScore, score)
        set({ bestScore: newBestScore })
        setUserProperties({ best_score: newBestScore })
      },
      resetPreferences: () => set(initialState),
    }),
    {
      name: 'quiz-user-preferences',
      // Only persist certain fields
      partialize: (state) => ({
        isFirstVisit: state.isFirstVisit,
        expertModeEnabled: state.expertModeEnabled,
        soundEnabled: state.soundEnabled,
        lastPlayedTopic: state.lastPlayedTopic,
        lastPlayedSubtopic: state.lastPlayedSubtopic,
        totalGamesPlayed: state.totalGamesPlayed,
        bestScore: state.bestScore,
      }),
    }
  )
)