import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SubtopicAvailability {
  questionCount: number
  hasQuestions: boolean
}

interface SubtopicStore {
  availability: Record<string, SubtopicAvailability>
  lastUpdated: number | null
  isLoading: boolean
  
  // Actions
  setAvailability: (availability: Record<string, SubtopicAvailability>) => void
  setLoading: (loading: boolean) => void
  clearCache: () => void
  refreshAvailability: () => Promise<void>
  isStale: () => boolean
}

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export const useSubtopicStore = create<SubtopicStore>()(
  persist(
    (set, get) => ({
      availability: {},
      lastUpdated: null,
      isLoading: false,

      setAvailability: (availability) => set({ 
        availability, 
        lastUpdated: Date.now(),
        isLoading: false 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      clearCache: () => set({ 
        availability: {}, 
        lastUpdated: null,
        isLoading: false 
      }),

      refreshAvailability: async () => {
        const { setAvailability, setLoading } = get()
        try {
          setLoading(true)
          // Import strapiClient dynamically to avoid circular imports
          const { strapiClient } = await import('@/lib/strapi')
          const availability = await strapiClient.getSubtopicAvailability()
          setAvailability(availability)
        } catch (error) {
          console.error('Failed to refresh subtopic availability:', error)
          setLoading(false)
        }
      },

      isStale: () => {
        const { lastUpdated } = get()
        if (!lastUpdated) return true
        return Date.now() - lastUpdated > CACHE_DURATION
      }
    }),
    {
      name: 'subtopic-availability-store',
      // Only persist the availability data, not loading states
      partialize: (state) => ({ 
        availability: state.availability, 
        lastUpdated: state.lastUpdated 
      })
    }
  )
)