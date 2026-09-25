'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { SPRING_PRESS, SPRING_GENTLE, containerVariants, fadeUpItem } from './motion-utils'

export function CTA() {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLElement>(null)
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="py-28 bg-[#090d14] relative overflow-hidden"
      aria-label="Call to action"
    >
      {/* Dynamic Cursor Spotlight Tracking in Dark Space */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{
          background: isHovered
            ? `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(26, 127, 196, 0.12), transparent 75%)`
            : 'none',
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Ambient Breathing Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-[#1a7fc4]/25 via-indigo-600/15 to-cyan-500/15 rounded-full blur-[100px]"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [0.9, 1.1, 0.9],
                  opacity: [0.5, 0.8, 0.5],
                }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#1a7fc4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        {/* Subtle Architectural Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#1a7fc4 1px, transparent 1px), linear-gradient(to right, #1a7fc4 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Decorative Forensic Targeting Crosshairs */}
        <div className="absolute top-12 left-12 text-[#1a7fc4]/20 font-mono text-xs select-none">
          + LOC_GRID // 0x4F
        </div>
        <div className="absolute bottom-12 right-12 text-[#1a7fc4]/20 font-mono text-xs select-none">
          SEC_AUTH // 256_GCM +
        </div>
      </div>

      <motion.div
        className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {/* Eyebrow Badge */}
        <motion.div
          variants={fadeUpItem}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-950/60 border border-blue-800/50 rounded-full text-xs font-semibold text-[#5bb8f5] uppercase tracking-widest mb-6 shadow-sm backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5bb8f5] animate-pulse" />
          <span>Trust Evidence, Not Assumptions</span>
        </motion.div>

        {/* Headline with Luminous Sheen */}
        <motion.h2
          variants={fadeUpItem}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 mb-6 leading-tight tracking-tight drop-shadow-sm"
        >
          See Beyond the Pixels.
        </motion.h2>

        {/* Supporting text */}
        <motion.p
          variants={fadeUpItem}
          className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Explore image forensics through AI-powered localization and explainable multi-evidence analysis.
        </motion.p>

        {/* CTA with Floating & Hover Motion */}
        <motion.div
          variants={fadeUpItem}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                    y: [-4, 4, -4],
                  }
            }
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
          >
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#1a7fc4] via-[#1670af] to-[#1565a8] text-white font-bold rounded-2xl shadow-[0_10px_35px_-5px_rgba(26,127,196,0.5),0_0_20px_rgba(26,127,196,0.25)] hover:shadow-[0_15px_45px_-5px_rgba(26,127,196,0.65),0_0_30px_rgba(26,127,196,0.4)] border border-blue-400/30 transition-all duration-300 text-base overflow-hidden"
              id="cta-create-account"
            >
              {/* Top Specular Shine Line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              <span>Create Your Account</span>

              {/* Floating Animated Arrow Icon */}
              <motion.span
                className="inline-flex items-center justify-center"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        x: [0, 3, 0],
                      }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Sign in link */}
        <motion.p variants={fadeUpItem} className="mt-6 text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="text-[#5bb8f5] hover:text-[#1a7fc4] font-semibold transition-colors underline-offset-4 hover:underline"
            id="cta-sign-in-link"
          >
            Sign In
          </Link>
        </motion.p>
      </motion.div>
    </section>
  )
}

