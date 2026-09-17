'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useAuth, UserButton } from '@clerk/nextjs'

const navLinks = [
  { label: 'Home', href: '#home', external: false },
  { label: 'Features', href: '#features', external: false },
  { label: 'How It Works', href: '#how-it-works', external: false },
  { label: 'Use Cases', href: '#use-cases', external: false },
  { label: 'Pricing', href: '/pricing', external: true },
  { label: 'About', href: '/about', external: true },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, external: boolean) => {
    if (!external && href.startsWith('#')) {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo — increased size for better visibility */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 py-2" aria-label="PIXENTRA home">
            <Image
              src="/pixentra-logo.svg"
              alt="PIXENTRA"
              width={180}
              height={90}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              link.external ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-[#1a7fc4] hover:bg-blue-50 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.external)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-[#1a7fc4] hover:bg-blue-50 transition-all duration-200"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#1a7fc4] rounded-lg hover:bg-[#1565a8] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Dashboard
                </Link>
                <UserButton
                  userProfileMode="navigation"
                  userProfileUrl="/settings"
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-[#1a7fc4] hover:bg-blue-50 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#1a7fc4] rounded-lg hover:bg-[#1565a8] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
        } bg-white/98 backdrop-blur-md border-b border-gray-100`}
      >
        <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            link.external ? (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:text-[#1a7fc4] hover:bg-blue-50 transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.external)}
                className="px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:text-[#1a7fc4] hover:bg-blue-50 transition-all duration-200"
              >
                {link.label}
              </a>
            )
          ))}
          <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2">
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
                  userProfileUrl="/settings"
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
                  className="px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:text-[#1a7fc4] hover:bg-blue-50 transition-all duration-200 text-center"
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
      </div>
    </header>
  )
}

