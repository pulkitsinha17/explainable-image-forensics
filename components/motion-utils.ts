/**
 * PIXENTRA Motion Utils
 * Shared physics tokens and animation variants.
 * Import from here — never hardcode durations/easings inline.
 */

// ---------------------------------------------------------------------------
// Physics curves (mirrors Motion UI skill lib/ease.ts philosophy)
// ---------------------------------------------------------------------------
export const EASE_OUT = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const

export const SPRING_PRESS = { type: 'spring', stiffness: 500, damping: 30, mass: 0.6 } as const
export const SPRING_PANEL = { type: 'spring', stiffness: 420, damping: 40, mass: 0.5 } as const
export const SPRING_LAYOUT = { type: 'spring', stiffness: 360, damping: 32, mass: 0.6 } as const
export const SPRING_GENTLE = { type: 'spring', stiffness: 180, damping: 24, mass: 1.0 } as const
export const SPRING_SNAPPY = { type: 'spring', stiffness: 600, damping: 35, mass: 0.5 } as const
export const SPRING_FLOAT = { type: 'spring', stiffness: 120, damping: 14, mass: 0.8 } as const

// ---------------------------------------------------------------------------
// Reusable container + item variant pairs
// ---------------------------------------------------------------------------

/** Section-level stagger container */
export const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

/** Tight stagger (feature grids) */
export const containerVariantsFast = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

/** Standard fade-up item */
export const fadeUpItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
}

/** Fade-in only (for headings that are already positioned) */
export const fadeInItem = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
}

/** Slide from left */
export const slideLeftItem = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
}

/** Slide from right */
export const slideRightItem = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
}

/** Hero text stagger — tighter timing */
export const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
}

// ---------------------------------------------------------------------------
// Tab content transition (for ProductPreview AnimatePresence)
// ---------------------------------------------------------------------------
export const tabContentVariants = {
  enter: { opacity: 0, y: 6 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.18, ease: EASE_IN_OUT },
  },
}
