'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { EASE_OUT, containerVariants, fadeUpItem } from './motion-utils'

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Analysis', href: '/sign-up' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Use Cases', href: '/#use-cases' },
    { label: 'Get Started', href: '/sign-up' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Research', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <motion.div
          className="py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {/* Brand column */}
          <motion.div variants={fadeUpItem} className="lg:col-span-2">
            <Link href="/" aria-label="PIXENTRA home">
              <Image
                src="/pixentra-logo.svg"
                alt="PIXENTRA"
                width={140}
                height={70}
                className="h-10 w-auto mb-4"
              />
            </Link>
            <p className="text-sm font-semibold text-gray-700 mb-1">See Beyond the Pixels</p>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Explainable multi-evidence image forgery detection and localization.
            </p>
          </motion.div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div key={category} variants={fadeUpItem}>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-[#1a7fc4] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          className="py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 }}
        >
          <p className="text-xs text-gray-400">
            © 2026 PIXENTRA. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
