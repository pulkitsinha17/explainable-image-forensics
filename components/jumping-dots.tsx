'use client'

import { motion, useReducedMotion } from 'motion/react'

interface JumpingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
}

const jumpDistances = {
  sm: -8,
  md: -11,
  lg: -15,
}

export function JumpingDots({
  size = 'md',
  color,
  className = '',
}: JumpingDotsProps) {
  const prefersReducedMotion = useReducedMotion()
  const dotClass = sizeClasses[size]
  const jumpY = jumpDistances[size]

  return (
    <div
      className={`inline-flex items-center justify-center gap-2 select-none ${className}`}
      aria-label="Loading"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`${dotClass} rounded-full shadow-xs ${
            color ? '' : 'bg-[#1565a8] dark:bg-[#5bb8f5]'
          }`}
          style={color ? { backgroundColor: color } : undefined}
          animate={
            prefersReducedMotion
              ? {
                  opacity: [0.35, 1, 0.35],
                  scale: [0.95, 1.05, 0.95],
                }
              : {
                  y: [0, jumpY, 0, 0],
                  scale: [1, 1.15, 0.95, 1],
                  opacity: [0.65, 1, 0.75, 0.65],
                }
          }
          transition={{
            duration: 0.85,
            repeat: Infinity,
            ease: [0.36, 0, 0.66, -0.56], // smooth spring-like bounce curve
            delay: i * 0.16,
            times: prefersReducedMotion ? undefined : [0, 0.35, 0.7, 1],
          }}
        />
      ))}
    </div>
  )
}
