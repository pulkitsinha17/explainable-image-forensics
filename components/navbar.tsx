'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useAuth, UserButton } from '@clerk/nextjs'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'motion/react'
import { SPRING_LAYOUT, SPRING_PANEL, SPRING_PRESS } from './motion-utils'

const navLinks = [
  { label: 'Home', href: '#home', external: false },
  { label: 'Features', href: '#features', external: false },
  { label: 'How It Works', href: '#how-it-works', external: false },
  { label: 'Use Cases', href: '#use-cases', external: false },
  { label: 'Pricing', href: '/pricing', external: true },
  { label: 'About', href: '/about', external: true },
]

import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const { isSignedIn, isLoaded } = useAuth()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, external: boolean) => {
    if (!external && href.startsWith('#')) {
      const target = document.querySelector(href)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        e.preventDefault()
        window.location.href = `/${href}`
      }
      setMobileOpen(false)
    } else {
      setMobileOpen(false)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#0B0B0B]/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-800/80'
          : 'bg-white/80 dark:bg-[#0B0B0B]/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 py-2" aria-label="PIXENTRA home">
            <Image
              src="/pixentra-logo.svg"
              alt="PIXENTRA"
              width={200}
              height={100}
              className="h-10 sm:h-12 md:h-16 w-auto object-contain block dark:hidden"
              priority
            />
            <Image
              src="/pixentra-logo-dark.svg"
              alt="PIXENTRA"
              width={200}
              height={100}
              className="h-10 sm:h-12 md:h-16 w-auto object-contain hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map((link) => {
              const isHovered = hoveredLink === link.label
              const content = (
                <span className="relative z-10">{link.label}</span>
              )
              const baseClass =
                'relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 rounded-lg transition-colors duration-200 hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] cursor-pointer'

              return link.external ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className={baseClass}
                  onMouseEnter={() => setHoveredLink(link.label)}
                >
                  {/* Shared-layout hover pill */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 rounded-lg bg-blue-50 dark:bg-blue-950/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : SPRING_LAYOUT}
                      />
                    )}
                  </AnimatePresence>
                  {content}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.external)}
                  className={baseClass}
                  onMouseEnter={() => setHoveredLink(link.label)}
                >
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 rounded-lg bg-blue-50 dark:bg-blue-950/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : SPRING_LAYOUT}
                      />
                    )}
                  </AnimatePresence>
                  {content}
                </a>
              )
            })}
          </nav>

          {/* Desktop CTA & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle variant="compact" />

            {isLoaded && isSignedIn ? (
              <>
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                  transition={SPRING_PRESS}
                >
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#1a7fc4] rounded-lg hover:bg-[#1565a8] transition-colors duration-200 shadow-sm block"
                  >
                    Dashboard
                  </Link>
                </motion.div>
                <UserButton
                  userProfileMode="navigation"
                  userProfileUrl="/settings/profile"
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 ring-2 ring-[#1a7fc4]/20 hover:ring-[#1a7fc4] transition-all',
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 rounded-lg hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200"
                >
                  Sign In
                </Link>
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                  transition={SPRING_PRESS}
                >
                  <Link
                    href="/sign-up"
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#1a7fc4] rounded-lg hover:bg-[#1565a8] transition-colors duration-200 shadow-sm block"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Right Action Area: Theme Toggle + Hamburger */}
          <div className="md:hidden flex items-center gap-1.5">
            <ThemeToggle variant="compact" />
            <motion.button
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              whileTap={prefersReducedMotion ? {} : { scale: 0.92 }}
              transition={SPRING_PRESS}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, rotate: 45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -45 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Nav — AnimatePresence for proper enter/exit */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : SPRING_PANEL}
            className="md:hidden overflow-hidden bg-white/98 dark:bg-[#0B0B0B]/98 backdrop-blur-md border-b border-gray-100 dark:border-slate-800/80"
          >
            <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) =>
                link.external ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-200 rounded-xl hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.external)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-200 rounded-xl hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="pt-3 mt-2 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2">
                {isLoaded && isSignedIn ? (
                  <div className="flex items-center justify-between px-2 py-2">
                    <Link
                      href="/dashboard"
                      className="flex-1 mr-3 px-4 py-3 text-sm font-semibold text-white bg-[#1a7fc4] rounded-xl hover:bg-[#1565a8] transition-all duration-200 text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <UserButton
                      userProfileMode="navigation"
                      userProfileUrl="/settings/profile"
                      appearance={{
                        elements: {
                          avatarBox: 'w-9 h-9',
                        },
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-200 rounded-xl hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200 text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      className="px-4 py-3 text-sm font-semibold text-white bg-[#1a7fc4] rounded-xl hover:bg-[#1565a8] transition-all duration-200 text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
