'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { JumpingDots } from './jumping-dots'

const MIN_DISPLAY_TIME_MS = 200
const SAFETY_TIMEOUT_MS = 3500

export function GlobalPageTransition() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prefersReducedMotion = useReducedMotion()

  const [isNavigating, setIsNavigating] = useState(false)
  const navStartTimeRef = useRef<number | null>(null)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null)

  const currentUrl = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`
  const lastUrlRef = useRef(currentUrl)

  const stopNavigating = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }

    if (!navStartTimeRef.current) {
      setIsNavigating(false)
      return
    }

    const elapsed = Date.now() - navStartTimeRef.current
    const remaining = Math.max(0, MIN_DISPLAY_TIME_MS - elapsed)

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)

    hideTimerRef.current = setTimeout(() => {
      setIsNavigating(false)
      navStartTimeRef.current = null
    }, remaining)
  }, [])

  const startNavigating = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }

    navStartTimeRef.current = Date.now()
    setIsNavigating(true)

    // Safety timeout to ensure loader never remains stuck under any condition
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    safetyTimerRef.current = setTimeout(() => {
      setIsNavigating(false)
      navStartTimeRef.current = null
    }, SAFETY_TIMEOUT_MS)
  }, [])

  // When pathname or searchParams change, navigation has arrived at destination
  useEffect(() => {
    if (lastUrlRef.current !== currentUrl) {
      lastUrlRef.current = currentUrl
      stopNavigating()
    }
  }, [currentUrl, stopNavigating])

  // Global click interception on internal links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore right clicks or clicks with modifiers
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return
      }

      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Ignore pure hash links, tel:, mailto:, and external links
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return
      }

      if (anchor.target && anchor.target !== '_self') {
        return
      }

      if (anchor.hasAttribute('download')) {
        return
      }

      // Resolve URL to check if it's internal
      try {
        const targetUrl = new URL(anchor.href, window.location.origin)
        const currentOriginUrl = new URL(window.location.href)

        // Only handle same-origin navigations
        if (targetUrl.origin !== currentOriginUrl.origin) {
          return
        }

        // If it's the exact same page & hash or same URL, don't trigger navigation
        if (
          targetUrl.pathname === currentOriginUrl.pathname &&
          targetUrl.search === currentOriginUrl.search
        ) {
          return
        }

        startNavigating()
      } catch {
        // Ignore invalid URLs
      }
    }

    const handlePopState = () => {
      startNavigating()
    }

    document.addEventListener('click', handleDocumentClick, { capture: true })
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true })
      window.removeEventListener('popstate', handlePopState)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    }
  }, [startNavigating])

  return (
    <AnimatePresence mode="wait">
      {isNavigating && (
        <motion.div
          key="global-nav-loader"
          className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-white/70 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.05 : 0.18,
            ease: 'easeOut',
          }}
          aria-hidden={!isNavigating}
        >
          <motion.div
            className="px-5 py-4 rounded-2xl bg-white/95 shadow-[0_10px_35px_-5px_rgba(21,101,168,0.18)] border border-gray-100 flex items-center justify-center min-w-[80px]"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.05 : 0.18,
              ease: 'easeOut',
            }}
          >
            <JumpingDots size="md" color="#1565a8" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
