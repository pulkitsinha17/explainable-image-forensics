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
  useMotionValue,
  useSpring,
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
      className="relative w-full aspect-[4/3] overflow-hidden select-none cursor-col-resize"
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

      {/* Slider divider line with subtle glow */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none z-10"
        style={{ left: `${sliderPos}%` }}
      />

      {/* Slider handle — premium feel with motion */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.25)] border-2 border-gray-100 flex items-center justify-center pointer-events-none z-20"
        style={{ left: `${sliderPos}%` }}
        animate={dragging ? { scale: 1.15 } : { scale: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : SPRING_GENTLE}
      >
        <svg className="w-5 h-5 text-[#1a7fc4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
        </svg>
      </motion.div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg pointer-events-none border border-white/10">
        <span className="text-[10px] font-semibold text-white tracking-wide uppercase">Original Image</span>
      </div>
      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg pointer-events-none border border-white/10">
        <span className="text-[10px] font-semibold text-white tracking-wide uppercase">Forgery Heatmap</span>
      </div>

      {/* Drag hint — fades out after first interaction */}
      <motion.div
        className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full pointer-events-none border border-white/10 shadow-sm"
        animate={hasInteracted ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: hasInteracted ? 0.2 : 0 }}
      >
        <span className="text-[9px] text-white/90 font-medium tracking-wide">← Drag to Compare →</span>
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
        <span className="text-[9px] text-gray-500 font-medium">{label}</span>
        <span className="text-[9px] font-bold font-mono" style={{ color }}>{val}%</span>
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
/* Scramble text with center outward stagger ('Truth')               */
/* ------------------------------------------------------------------ */
const SCRAMBLE_SYMBOLS = ['†', '※', '#', '+', '?', '*', '%', '&', '/', '~', '§', '!', '0', '1', 'x', 'z']

function ScrambleTruth({
  text = 'Truth',
  prefersReducedMotion,
}: {
  text?: string
  prefersReducedMotion: boolean | null
}) {
  const [displayText, setDisplayText] = useState(text)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text)
      return
    }

    const chars = text.split('')
    const centerIndex = (chars.length - 1) / 2 // index 2 for 'Truth'
    // Slow, highly visible center-outward reveal
    // Center ('u'): 1100ms, Middle ('r', 't'): 1800ms, Edges ('T', 'h'): 2500ms
    const resolveTimes = chars.map((_, i) => {
      const dist = Math.abs(i - centerIndex) // 0, 1, 2
      return 1100 + dist * 700
    })

    const startTime = performance.now()
    let animationFrameId: number
    let lastGlyphChange = 0
    const currentChars = [...chars]

    // Initialize with random glyphs so scramble is visible immediately on mount
    for (let i = 0; i < chars.length; i++) {
      currentChars[i] = SCRAMBLE_SYMBOLS[Math.floor(Math.random() * SCRAMBLE_SYMBOLS.length)]
    }
    setDisplayText(currentChars.join(''))

    const tick = (now: number) => {
      const elapsed = now - startTime
      let allDone = true

      // Slow down glyph morphing to 85ms per change for clear legibility
      const shouldRandomize = now - lastGlyphChange > 85
      if (shouldRandomize) {
        lastGlyphChange = now
      }

      for (let i = 0; i < chars.length; i++) {
        if (elapsed >= resolveTimes[i]) {
          currentChars[i] = chars[i]
        } else {
          allDone = false
          if (shouldRandomize) {
            currentChars[i] = SCRAMBLE_SYMBOLS[Math.floor(Math.random() * SCRAMBLE_SYMBOLS.length)]
          }
        }
      }

      setDisplayText(currentChars.join(''))

      if (!allDone) {
        animationFrameId = requestAnimationFrame(tick)
      } else {
        setDisplayText(text)
      }
    }

    animationFrameId = requestAnimationFrame(tick)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [text, prefersReducedMotion])

  return <>{displayText}</>
}

/* ------------------------------------------------------------------ */
/* Rolling staggered text button component                            */
/* ------------------------------------------------------------------ */
function RollingText({
  text,
  isHovered,
  prefersReducedMotion,
}: {
  text: string
  isHovered: boolean
  prefersReducedMotion: boolean | null
}) {
  if (prefersReducedMotion) {
    return <span>{text}</span>
  }

  const characters = text.split('')

  return (
    <span className="relative inline-flex items-center overflow-hidden leading-none select-none">
      {characters.map((char, index) => {
        const isSpace = char === ' '
        return (
          <span
            key={index}
            className="relative inline-block overflow-hidden"
            style={{ width: isSpace ? '0.3em' : undefined }}
          >
            <motion.span
              className="inline-block"
              animate={{ y: isHovered ? '-100%' : '0%' }}
              transition={{
                duration: 0.28,
                ease: [0.33, 1, 0.68, 1],
                delay: index * 0.018,
              }}
            >
              {isSpace ? '\u00A0' : char}
            </motion.span>
            <motion.span
              className="absolute left-0 top-0 inline-block"
              aria-hidden="true"
              initial={{ y: '100%' }}
              animate={{ y: isHovered ? '0%' : '100%' }}
              transition={{
                duration: 0.28,
                ease: [0.33, 1, 0.68, 1],
                delay: index * 0.018,
              }}
            >
              {isSpace ? '\u00A0' : char}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Hero section                                                        */
/* ------------------------------------------------------------------ */
export function Hero() {
  const { isSignedIn } = useAuth()
  const prefersReducedMotion = useReducedMotion()
  const [isGetStartedHovered, setIsGetStartedHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imagePanelRef = useRef<HTMLDivElement>(null)

  // 3D Mouse Tilt Physics for the Image Window
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mouseXSpring = useSpring(mouseX, { stiffness: 200, damping: 22 })
  const mouseYSpring = useSpring(mouseY, { stiffness: 200, damping: 22 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['4deg', '-4deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-4deg', '4deg'])

  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !imagePanelRef.current) return
    const rect = imagePanelRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }, [prefersReducedMotion, mouseX, mouseY])

  const handleImageMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  // Subtle parallax on the right panel
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const rightPanelY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 30]
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
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-6 shadow-xs"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#1a7fc4] animate-pulse" />
              <span className="text-xs font-semibold text-[#1a7fc4] tracking-wide uppercase">
                AI-Powered • Explainable • Multi-Evidence Analysis
              </span>
            </motion.div>

            {/* Headline with animated 'Truth' */}
            <motion.h1
              variants={heroItemVariants}
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6"
            >
              Uncover the{' '}
              <span className="relative inline-block">
                {/* Subtle luminous ambient glow behind 'Truth' */}
                <span className="absolute inset-0 bg-blue-400/15 blur-lg rounded-full -z-10 pointer-events-none animate-pulse" />
                {/* Shimmering animated brand blue text */}
                <span className="bg-gradient-to-r from-[#1a7fc4] via-[#5bb8f5] to-[#1a7fc4] bg-[length:200%_auto] bg-clip-text text-transparent animate-text-shimmer font-bold">
                  <ScrambleTruth text="Truth" prefersReducedMotion={prefersReducedMotion} />
                </span>
                {/* Animated draw-in curved underline */}
                <motion.svg
                  className="absolute -bottom-1 left-0 w-full overflow-visible pointer-events-none"
                  height="6"
                  viewBox="0 0 100 6"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M 0 3 Q 50 0 100 3"
                    stroke="#1a7fc4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.85 }}
                    transition={{
                      duration: 1.1,
                      ease: EASE_OUT,
                      delay: 0.5,
                    }}
                  />
                </motion.svg>
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
            <motion.div variants={heroItemVariants} className="flex flex-wrap gap-3 mb-10">
              {['Forgery Detection', 'Pixel-Level Localization', 'Explainable Evidence'].map((feat) => (
                <motion.div
                  key={feat}
                  whileHover={prefersReducedMotion ? {} : { y: -2 }}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50/90 hover:bg-blue-50/60 rounded-full border border-slate-200/70 hover:border-blue-200 shadow-2xs transition-all duration-200 cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#1a7fc4]" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{feat}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={heroItemVariants} className="relative flex flex-wrap gap-4 mb-6 items-center">
              {/* Subtle ambient backlight behind CTA buttons */}
              <div className="absolute -inset-2 w-72 h-16 bg-[#1a7fc4]/10 rounded-full blur-2xl pointer-events-none -z-10" />

              <div>
                <Link
                  href={isSignedIn ? "/dashboard" : "/sign-up"}
                  className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-[#1a7fc4] via-[#1670af] to-[#1565a8] text-white font-semibold rounded-xl hover:shadow-[0_12px_28px_rgba(26,127,196,0.45)] transition-all duration-200 shadow-[0_8px_22px_rgba(26,127,196,0.32)] border border-blue-400/25 text-sm"
                  id="hero-cta-get-started"
                  onMouseEnter={() => setIsGetStartedHovered(true)}
                  onMouseLeave={() => setIsGetStartedHovered(false)}
                >
                  <RollingText
                    text="Get Started"
                    isHovered={isGetStartedHovered}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                  <span className="inline-flex items-center justify-center">
                    <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isGetStartedHovered && !prefersReducedMotion ? 'translate-x-1' : ''}`} />
                  </span>
                </Link>
              </div>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-[#1a7fc4] hover:text-[#1a7fc4] hover:shadow-xs transition-all duration-200 text-sm cursor-pointer"
                id="hero-cta-how-it-works"
              >
                Explore How It Works
              </a>
            </motion.div>

            {/* Trust statement */}
            <motion.div variants={heroItemVariants} className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5 text-[#1a7fc4]" />
              <span>Sign in required to analyze images</span>
              <span className="text-gray-300">•</span>
              <span>Secure analysis</span>
              <span className="text-gray-300">•</span>
              <span>Privacy focused</span>
            </motion.div>
          </motion.div>


          {/* Right: Floating 3D Image Comparison Window */}
          <motion.div
            className="relative [perspective:1200px]"
            style={{ y: rightPanelY }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.8, ease: EASE_OUT, delay: 0.2 }
            }
          >
            {/* Ambient Background Aura behind Image Window */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-gradient-to-tr from-blue-400/20 via-[#1a7fc4]/15 to-indigo-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Continuous Floating Levitation Wrapper */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      y: [-7, 7, -7],
                    }
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Interactive 3D Card with Tilt */}
              <motion.div
                ref={imagePanelRef}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
                style={
                  prefersReducedMotion
                    ? {}
                    : {
                        rotateX,
                        rotateY,
                        transformStyle: 'preserve-3d',
                      }
                }
                className="relative bg-white rounded-3xl border border-gray-200/90 shadow-[0_20px_50px_-12px_rgba(26,127,196,0.18),0_8px_24px_-6px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] overflow-hidden group transition-shadow duration-500 hover:shadow-[0_30px_70px_-15px_rgba(26,127,196,0.26),0_12px_32px_-8px_rgba(0,0,0,0.08)]"
              >
                {/* Top Specular Glaze Line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5bb8f5]/60 to-transparent pointer-events-none z-30" />

                {/* Header bar above slider */}
                <div className="bg-gray-50/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-200/80">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/90 border border-red-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/90 border border-yellow-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/90 border border-green-500/20" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono ml-1.5 font-medium">
                      mountain.jpg — Forensic Analysis
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-full border border-green-200/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] text-green-700 font-semibold tracking-wide uppercase">
                      Analysis Complete
                    </span>
                  </div>
                </div>

                {/* Comparison slider */}
                <ImageComparisonSlider />

                {/* Evidence summary below slider — animated bars */}
                <div className="bg-white px-5 py-3.5 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Evidence Summary
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">3 Active Channels</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Compression', val: 78, color: '#dc2626' },
                      { label: 'Frequency', val: 62, color: '#ea580c' },
                      { label: 'Noise', val: 71, color: '#ca8a04' },
                    ].map((ev, i) => (
                      <EvidenceBar key={ev.label} {...ev} delay={0.4 + i * 0.1} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Dynamic Ground Contact Shadow */}
            <motion.div
              className="w-3/4 h-7 bg-blue-900/15 rounded-[100%] mx-auto blur-xl -mt-2 -z-10 pointer-events-none"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      scaleX: [0.9, 1.05, 0.9],
                      opacity: [0.2, 0.45, 0.2],
                    }
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
