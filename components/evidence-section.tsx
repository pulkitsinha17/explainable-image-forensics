'use client'

import Image from 'next/image'
import { Grid, Waves, Activity, FileImage, BarChart2, Tag } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { SPRING_GENTLE, EASE_OUT } from './motion-utils'

const evidenceCards = [
  {
    icon: Grid,
    title: 'Spatial / Pixel Analysis',
    description: 'Identifies suspicious regions at the pixel level.',
  },
  {
    icon: Waves,
    title: 'Frequency Analysis',
    description: 'Examines frequency-domain inconsistencies associated with manipulation.',
  },
  {
    icon: Activity,
    title: 'Noise Analysis',
    description: 'Highlights irregular noise patterns across image regions.',
  },
  {
    icon: FileImage,
    title: 'Compression / ELA',
    description: 'Examines compression-related inconsistencies.',
  },
  {
    icon: BarChart2,
    title: 'Statistical Analysis',
    description: 'Looks for unusual local statistical characteristics.',
  },
  {
    icon: Tag,
    title: 'Metadata',
    description: 'Uses available image metadata as supporting forensic evidence (when available).',
  },
]

const leftContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const rightContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const leftCardVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

const rightCardVariants = {
  hidden: { opacity: 0, x: 14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

/* ------------------------------------------------------------------ */
/* Castle visualization — refined, no spinning decoration             */
/* ------------------------------------------------------------------ */
function CastleVisualization() {
  return (
    <div className="relative w-[260px] sm:w-[320px] max-w-[85vw] mx-auto overflow-hidden sm:overflow-visible p-3 sm:p-0">
      {/* Outer decorative ring */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-100/80 dark:border-blue-900/40 animate-spin-slow pointer-events-none" style={{ margin: '-16px' }} />
      {/* Inner ring */}
      <div className="absolute inset-0 rounded-full border border-blue-200/50 dark:border-blue-800/30 animate-spin-slow-reverse pointer-events-none" style={{ margin: '-8px' }} />

      {/* Castle image card */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/60 dark:border-slate-700/60 bg-gray-900">
        {/* Layer 1: Original castle */}
        <Image
          src="/images/castle.png"
          alt="Castle photograph for forensic analysis"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
        />

        {/* Layer 2: Frequency analysis overlay — subtle blue tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-blue-900/15 mix-blend-multiply" />

        {/* Layer 3: Forensic heatmap hotspot */}
        <div
          className="absolute rounded-full blur-2xl pointer-events-none"
          style={{
            width: '110px',
            height: '90px',
            background: 'radial-gradient(circle, rgba(220,38,38,0.70) 0%, rgba(220,38,38,0.30) 50%, transparent 70%)',
            top: '18%',
            left: '20%',
          }}
        />
        <div
          className="absolute rounded-full blur-xl pointer-events-none"
          style={{
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, rgba(234,88,12,0.80) 0%, transparent 70%)',
            top: '22%',
            left: '26%',
          }}
        />

        {/* Scan lines effect overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(26,127,196,0.3) 3px, rgba(26,127,196,0.3) 4px)',
          }}
        />

        {/* Hotspot indicator badge */}
        <div
          className="absolute px-2 py-0.5 bg-red-600/90 backdrop-blur-xs rounded text-[9px] font-mono font-bold text-white tracking-wider flex items-center gap-1 shadow-md pointer-events-none"
          style={{ top: '15%', left: '16%' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          ANOMALY DETECTED
        </div>

        {/* Bottom indicator strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-center justify-between text-white/90">
            <div>
              <p className="text-[11px] font-mono font-semibold">castle.png</p>
              <p className="text-[9px] text-white/60">Multi-evidence scan</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono font-bold text-red-400">79.2% Manipulated</span>
              <p className="text-[9px] text-white/60">High Certainty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating evidence nodes */}
      {[
        { label: 'ELA: 82%', top: '12%', left: '-8px', color: '#dc2626' },
        { label: 'Freq: 74%', top: '45%', right: '-8px', color: '#ea580c' },
        { label: 'Noise: 68%', bottom: '20%', left: '-8px', color: '#ca8a04' },
      ].map((node, i) => (
        <motion.div
          key={node.label}
          className="absolute px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 dark:border-slate-700 text-[10px] font-mono font-bold pointer-events-none"
          style={{
            top: node.top,
            left: node.left,
            right: (node as { right?: string }).right,
            color: node.color,
          }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.08, ease: EASE_OUT }}
        />
      ))}
    </div>
  )
}

export function EvidenceSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-white to-blue-50/40 dark:from-[#0B0B0B] dark:to-[#121212] overflow-hidden max-w-full transition-colors duration-200" aria-label="Multi-evidence forensic analysis">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <p className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-widest mb-3">
            Powered by Explainable AI
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            More Than a Prediction.
            <br className="hidden sm:block" />
            <span className="text-[#1a7fc4] dark:text-[#5bb8f5]"> A Forensic Explanation.</span>
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            PIXENTRA combines pixel-level localization with complementary forensic evidence to provide a more interpretable view of potential image manipulation.
          </p>
        </motion.div>

        {/* Main layout: cards + center visualization */}
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left column — slide from left */}
          <motion.div
            className="space-y-5"
            variants={leftContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {evidenceCards.slice(0, 3).map((card) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  variants={leftCardVariants}
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : {
                          x: 3,
                          boxShadow: '0 6px 20px -4px rgba(26,127,196,0.12)',
                          borderColor: 'rgba(26,127,196,0.2)',
                        }
                  }
                  transition={SPRING_GENTLE}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs cursor-default transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-1">{card.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Center: castle visualization */}
          <div className="flex flex-col items-center justify-center py-6 lg:py-8 w-full my-2 lg:my-0">
            <motion.div
              className="w-full flex justify-center"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: EASE_OUT, delay: 0.15 }
              }
            >
              <CastleVisualization />
            </motion.div>
            <p className="mt-6 text-xs text-gray-400 dark:text-slate-500 text-center font-medium">
              Multi-signal convergence
            </p>
          </div>

          {/* Right column — slide from right */}
          <motion.div
            className="space-y-5"
            variants={rightContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {evidenceCards.slice(3).map((card) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  variants={rightCardVariants}
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : {
                          x: -3,
                          boxShadow: '0 6px 20px -4px rgba(26,127,196,0.12)',
                          borderColor: 'rgba(26,127,196,0.2)',
                        }
                  }
                  transition={SPRING_GENTLE}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs cursor-default transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-1">{card.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
