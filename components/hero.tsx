'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import {
  heroContainerVariants,
  heroItemVariants,
  SPRING_PRESS,
  SPRING_GENTLE,
  EASE_OUT,
} from './motion-utils'

/* ------------------------------------------------------------------ */
/* Image comparison slider using mountain.png                          */
/* ------------------------------------------------------------------ */
function ImageComparisonSlider() {
  const [sliderPos, setSliderPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const updateSlider = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setSliderPos((x / rect.width) * 100)
    if (!hasInteracted) setHasInteracted(true)
  }, [hasInteracted])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return
    updateSlider(e.clientX)
  }, [dragging, updateSlider])

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging) return
    updateSlider(e.touches[0].clientX)
  }, [dragging, updateSlider])

  const stopDrag = useCallback(() => setDragging(false), [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', stopDrag)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', stopDrag)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', stopDrag)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', stopDrag)
    }
  }, [onMouseMove, onTouchMove, stopDrag])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none cursor-col-resize shadow-xl border border-gray-200"
      onMouseDown={(e) => { setDragging(true); updateSlider(e.clientX) }}
      onTouchStart={(e) => { setDragging(true); updateSlider(e.touches[0].clientX) }}
    >
      {/* BASE: Original mountain photograph */}
      <div className="absolute inset-0">
        <Image
          src="/images/mountain.png"
          alt="Original mountain photograph"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* OVERLAY: Same mountain with forensic heatmap */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <Image
          src="/images/mountain-heatmap.png"
          alt="Forgery Heatmap"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Slider divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      />

      {/* Slider handle — premium feel with motion */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-xl border-2 border-gray-200 flex items-center justify-center pointer-events-none z-10"
        style={{ left: `${sliderPos}%` }}
        animate={dragging ? { scale: 1.12 } : { scale: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : SPRING_GENTLE}
      >
        <svg className="w-5 h-5 text-[#1a7fc4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
        </svg>
      </motion.div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg pointer-events-none">
        <span className="text-[10px] font-semibold text-white tracking-wide uppercase">Original Image</span>
      </div>
      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg pointer-events-none">
        <span className="text-[10px] font-semibold text-white tracking-wide uppercase">Forgery Heatmap</span>
      </div>

      {/* Drag hint — fades out after first interaction */}
      <motion.div
        className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full pointer-events-none"
        animate={hasInteracted ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: hasInteracted ? 0.2 : 0 }}
      >
        <span className="text-[9px] text-white/90 font-medium">← Drag to Compare →</span>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Animated evidence bar                                               */
/* ------------------------------------------------------------------ */
function EvidenceBar({ label, val, color, delay }: {
  label: string; val: number; color: string; delay: number
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[9px] text-gray-500">{label}</span>
        <span className="text-[9px] font-bold" style={{ color }}>{val}%</span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${val}%` }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero section                                                        */
/* ------------------------------------------------------------------ */
export function Hero() {
  const { isSignedIn } = useAuth()
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  // Subtle parallax on the right panel — scroll drives a very slight Y offset
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const rightPanelY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 40]
  )

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white"
    >
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-white pointer-events-none" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content — staggered Motion entrance */}
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow badge */}
            <motion.div
              variants={heroItemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#1a7fc4] animate-pulse" />
              <span className="text-xs font-semibold text-[#1a7fc4] tracking-wide uppercase">
                AI-Powered • Explainable • Multi-Evidence Analysis
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={heroItemVariants}
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6"
            >
              Uncover the{' '}
              <span className="relative">
                <span className="text-[#1a7fc4]">Truth</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="4"
                  viewBox="0 0 100 4"
                  preserveAspectRatio="none"
                >
                  <path d="M0 2 Q50 0 100 2" stroke="#1a7fc4" strokeWidth="1.5" fill="none" opacity="0.5" />
                </svg>
              </span>
              {' '}Behind Every Image
            </motion.h1>

            {/* Supporting copy */}
            <motion.p
              variants={heroItemVariants}
              className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl"
            >
              PIXENTRA combines AI-powered forgery localization with multiple digital forensic signals to detect suspicious image regions and explain the evidence behind every result.
            </motion.p>

            {/* Feature indicators */}
            <motion.div variants={heroItemVariants} className="flex flex-wrap gap-4 mb-10">
              {['Forgery Detection', 'Pixel-Level Localization', 'Explainable Evidence'].map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1a7fc4]" />
                  <span className="text-sm font-medium text-gray-700">{feat}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={heroItemVariants} className="flex flex-wrap gap-4 mb-6">
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                transition={SPRING_PRESS}
              >
                <Link
                  href={isSignedIn ? "/dashboard" : "/sign-up"}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[#1a7fc4] text-white font-semibold rounded-xl hover:bg-[#1565a8] transition-colors duration-200 shadow-md hover:shadow-lg hover:shadow-blue-100 text-sm"
                  id="hero-cta-get-started"
                >
                  Get Started
                  <motion.span
                    className="inline-block"
                    whileHover={prefersReducedMotion ? {} : { x: 2 }}
                    transition={SPRING_PRESS}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </motion.div>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-[#1a7fc4] hover:text-[#1a7fc4] transition-all duration-200 text-sm cursor-pointer"
                id="hero-cta-how-it-works"
              >
                Explore How It Works
              </a>
            </motion.div>

            {/* Trust statement */}
            <motion.div variants={heroItemVariants} className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Sign in required to analyze images</span>
              <span className="text-gray-300">•</span>
              <span>Secure analysis</span>
              <span className="text-gray-300">•</span>
              <span>Privacy focused</span>
            </motion.div>
          </motion.div>

          {/* Right: Image comparison slider — subtle parallax */}
          <motion.div
            className="relative"
            style={{ y: rightPanelY }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.8, ease: EASE_OUT, delay: 0.2 }
            }
          >
            <div className="relative">
              {/* Header bar above slider */}
              <div className="bg-gray-50 rounded-t-2xl border border-gray-200 border-b-0 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono ml-1">mountain.jpg — Forensic Analysis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-green-600 font-semibold">Analysis Complete</span>
                </div>
              </div>

              {/* Comparison slider */}
              <ImageComparisonSlider />

              {/* Evidence summary below slider — animated bars */}
              <div className="bg-white rounded-b-2xl border border-gray-200 border-t border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Evidence Summary</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Compression', val: 78, color: '#dc2626' },
                    { label: 'Frequency', val: 62, color: '#ea580c' },
                    { label: 'Noise', val: 71, color: '#ca8a04' },
                  ].map((ev, i) => (
                    <EvidenceBar key={ev.label} {...ev} delay={0.4 + i * 0.1} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
