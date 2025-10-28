import React from 'react'

interface TopicIconProps {
  topicSlug: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const iconMap: Record<string, React.ReactNode> = {
  // Rivers (Nadi)
  'nadi': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      <path d="M2 19h20v2H2z" opacity="0.7"/>
    </svg>
  ),
  
  // Scriptures (Shastras)
  'shastras': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h7l5-5V4c0-1.1-.9-2-2-2zm4 15h-4v4l4-4z"/>
      <path d="M8 6h6v2H8zm0 3h6v2H8zm0 3h4v2H8z" opacity="0.7"/>
    </svg>
  ),
  
  // Books (Granth)
  'granth': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
      <path d="M8 14h8v2H8zm0 3h6v2H8z" opacity="0.7"/>
    </svg>
  ),
  
  // Deities (Bhagvan)
  'bhagvan': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="12" cy="8" r="4"/>
      <path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z"/>
      <path d="M8 2l2 2 2-2 2 2 2-2v4l-4 2-4-2V2z" opacity="0.7"/>
    </svg>
  ),
  
  // Festivals (Utsav)
  'utsav': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      <circle cx="6" cy="6" r="2" opacity="0.7"/>
      <circle cx="18" cy="6" r="2" opacity="0.7"/>
      <circle cx="6" cy="18" r="2" opacity="0.7"/>
      <circle cx="18" cy="18" r="2" opacity="0.7"/>
    </svg>
  ),
  
  // Temples (Dham)
  'dham': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 3L2 12h3v8h14v-8h3L12 3z"/>
      <path d="M9 16h2v4H9zm4 0h2v4h-2z" opacity="0.7"/>
      <path d="M10 12h4v2h-4z"/>
    </svg>
  ),
  
  // Saints (Sant)
  'sant': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="12" cy="6" r="4"/>
      <path d="M12 12c-4 0-6 2-6 4v6h12v-6c0-2-2-4-6-4z"/>
      <path d="M8 2h8v2H8z" opacity="0.7"/>
      <circle cx="9" cy="4" r="1" opacity="0.7"/>
      <circle cx="15" cy="4" r="1" opacity="0.7"/>
    </svg>
  ),
  
  // Mythology
  'mythology': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      <path d="M8 8h8v2H8zm0 3h6v2H8z" opacity="0.7"/>
    </svg>
  ),
  
  // Festivals
  'festivals': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M9 11H7v9a2 2 0 002 2h8a2 2 0 002-2V9h-2v11H9v-9z"/>
      <path d="M13 1L8 6v4h10V6l-5-5z"/>
      <circle cx="12" cy="8" r="1" opacity="0.7"/>
    </svg>
  ),
  
  // Philosophy
  'philosophy': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1" fill="none" opacity="0.7"/>
    </svg>
  ),
  
  // History
  'history': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  ),
  
  // Rituals
  'rituals': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l-2 7H7l5 4-2 7 5-4 5 4-2-7 5-4h-3l-2-7z"/>
      <circle cx="12" cy="12" r="2" opacity="0.7"/>
    </svg>
  ),
  
  // Scriptures
  'scriptures': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
      <path d="M17.5 10.5c.88 0 1.73.09 2.5.26V9.24c-.79-.15-1.64-.24-2.5-.24-1.7 0-3.24.29-4.5.83v1.66c1.13-.64 2.7-.99 4.5-.99z"/>
    </svg>
  )
}

// Fallback emoji icons
const emojiMap: Record<string, string> = {
  'nadi': '🏞️',
  'shastras': '📜',
  'granth': '📖',
  'bhagvan': '🕉️',
  'utsav': '🎉',
  'dham': '🏛️',
  'sant': '🙏',
  'mythology': '📚',
  'festivals': '🎊',
  'scriptures': '📋',
  'philosophy': '🧘',
  'history': '🏛️',
  'rituals': '🕯️'
}

export default function TopicIcon({ topicSlug, size = 'md', className = '' }: TopicIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  const icon = iconMap[topicSlug]
  
  if (icon) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        {icon}
      </div>
    )
  }

  // Fallback to emoji
  const emoji = emojiMap[topicSlug] || '📚'
  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center ${textSizeClasses[size]}`}>
      {emoji}
    </div>
  )
}