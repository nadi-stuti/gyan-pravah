'use client'

import { motion } from 'motion/react'

interface LoadingSkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

// Base skeleton component
export function LoadingSkeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = true 
}: LoadingSkeletonProps) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`
        bg-gray-300 
        ${rounded ? 'rounded-lg' : ''} 
        ${className}
      `}
      style={{ width, height }}
    />
  )
}

// Specialized skeleton components
export function QuestionCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 space-y-4"
    >
      {/* Question number and timer area */}
      <div className="flex justify-between items-center">
        <LoadingSkeleton width={80} height={20} />
        <LoadingSkeleton width={60} height={20} />
      </div>
      
      {/* Question text */}
      <div className="space-y-2">
        <LoadingSkeleton width="100%" height={24} />
        <LoadingSkeleton width="80%" height={24} />
      </div>
      
      {/* Answer options */}
      <div className="space-y-3 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <LoadingSkeleton width="100%" height={48} />
          </motion.div>
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="mt-6">
        <LoadingSkeleton width="100%" height={8} />
      </div>
    </motion.div>
  )
}

export function TopicCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-4 space-y-3"
    >
      {/* Topic icon */}
      <LoadingSkeleton width={48} height={48} className="mx-auto" />
      
      {/* Topic name */}
      <LoadingSkeleton width="80%" height={20} className="mx-auto" />
      
      {/* Subtopic count */}
      <LoadingSkeleton width="60%" height={16} className="mx-auto" />
    </motion.div>
  )
}

export function SubtopicListSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex-1">
            <LoadingSkeleton width="70%" height={18} className="mb-2" />
            <LoadingSkeleton width="40%" height={14} />
          </div>
          <LoadingSkeleton width={24} height={24} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export function ResultsCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 space-y-4"
    >
      {/* Score area */}
      <div className="text-center space-y-3">
        <LoadingSkeleton width={120} height={120} className="mx-auto rounded-full" />
        <LoadingSkeleton width="60%" height={24} className="mx-auto" />
        <LoadingSkeleton width="40%" height={18} className="mx-auto" />
      </div>
      
      {/* Results list */}
      <div className="space-y-3 mt-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="border border-gray-200 rounded-xl p-4 space-y-2"
          >
            <LoadingSkeleton width="100%" height={16} />
            <LoadingSkeleton width="80%" height={14} />
            <LoadingSkeleton width="90%" height={14} />
          </motion.div>
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <LoadingSkeleton width="50%" height={48} />
        <LoadingSkeleton width="50%" height={48} />
      </div>
    </motion.div>
  )
}

export function GameHeaderSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-between items-center p-4"
    >
      <div className="flex items-center space-x-3">
        <LoadingSkeleton width={32} height={32} />
        <div>
          <LoadingSkeleton width={80} height={16} className="mb-1" />
          <LoadingSkeleton width={60} height={12} />
        </div>
      </div>
      
      <div className="text-right">
        <LoadingSkeleton width={60} height={16} className="mb-1" />
        <LoadingSkeleton width={40} height={12} />
      </div>
    </motion.div>
  )
}

// Grid skeleton for topic/subtopic grids
export function GridSkeleton({ 
  items = 6, 
  columns = 2 
}: { 
  items?: number
  columns?: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`grid grid-cols-${columns} gap-4`}
    >
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <TopicCardSkeleton />
        </motion.div>
      ))}
    </motion.div>
  )
}

// List skeleton for vertical lists
export function ListSkeleton({ 
  items = 5 
}: { 
  items?: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex-1 space-y-2">
            <LoadingSkeleton width="70%" height={18} />
            <LoadingSkeleton width="40%" height={14} />
          </div>
          <LoadingSkeleton width={24} height={24} />
        </motion.div>
      ))}
    </motion.div>
  )
}

// Text skeleton for paragraphs
export function TextSkeleton({ 
  lines = 3 
}: { 
  lines?: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          width={i === lines - 1 ? "60%" : "100%"}
          height={16}
        />
      ))}
    </motion.div>
  )
}