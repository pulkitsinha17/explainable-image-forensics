'use client'

import { useState, useRef, useCallback } from 'react'
import {
  ScanSearch,
  Layers,
  Grid3x3,
  BarChart3,
  FileText,
  Sparkles,
  History,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import {
  containerVariantsFast,
  fadeUpItem,
  SPRING_GENTLE,
  EASE_OUT,
} from './motion-utils'

interface FeatureCardProps {
  id: string
  index: string
  title: string
  description: string
  category: string
  icon: React.ElementType
  children?: React.ReactNode
}

function SpotlightCard({
  index,
  title,
  description,
  category,
  icon: Icon,
  children,
}: FeatureCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  return (
    <motion.div
      variants={fadeUpItem}
      className="relative group"
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              y: -3,
              transition: SPRING_GENTLE,
            }
      }
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative h-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-blue-200/80 dark:hover:border-blue-700/80 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-default"
      >
        {/* Subtle mouse spotlight gradient */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: isHovered
              ? `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(26, 127, 196, 0.08), transparent 80%)`
              : 'none',
          }}
        />

        {/* Top subtle brand accent bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-[#1a7fc4]/50 to-transparent" />

        {/* Card Header & Content */}
        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center justify-between">
            {/* Icon Container — unified PIXENTRA blue */}
            <div className="w-11 h-11 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Icon className="w-5 h-5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
            </div>

            {/* Technical Index Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-slate-800 rounded-md border border-gray-100 dark:border-slate-700 text-[10px] font-mono font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              <span>{category}</span>
              <span className="text-gray-300 dark:text-slate-600">•</span>
              <span className="text-gray-700 dark:text-slate-200 font-semibold">{index}</span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight mb-1.5 group-hover:text-[#1a7fc4] dark:group-hover:text-[#5bb8f5] transition-colors duration-200">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Telemetry Micro-Widget with matching cohesive styling */}
        {children && (
          <div className="relative z-10 mt-4 pt-3.5 border-t border-gray-100 dark:border-slate-800">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-white dark:bg-[#0B0B0B] relative overflow-hidden transition-colors duration-200"
      aria-label="PIXENTRA features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <p className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-widest mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for Image Forensics
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
            A complete toolkit for AI-assisted digital image analysis, from heatmaps to explainable evidence.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariantsFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Card 1: AI-Powered Forgery Localization */}
          <SpotlightCard
            id="forgery-localization"
            index="01"
            category="Detection"
            title="AI-Powered Forgery Localization"
            description="Automatically identify and highlight suspicious image regions with pixel-level precision using AI-assisted analysis."
            icon={ScanSearch}
          >
            <div className="flex items-center justify-between text-[11px] bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700/60 font-mono text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a7fc4] dark:bg-[#5bb8f5] animate-pulse" />
                <span>Pixel Localization</span>
              </div>
              <span className="text-[#1a7fc4] dark:text-[#5bb8f5] font-semibold">99.4% Precision</span>
            </div>
          </SpotlightCard>

          {/* Card 2: Multi-Evidence Forensic Analysis */}
          <SpotlightCard
            id="multi-evidence"
            index="02"
            category="Synthesis"
            title="Multi-Evidence Forensic Analysis"
            description="Combine spatial, frequency, noise, compression, and statistical signals for a more complete forensic picture."
            icon={Layers}
          >
            <div className="flex items-center gap-1.5 justify-between">
              {['Spatial', 'Freq', 'Noise', 'Stats'].map((ch) => (
                <div
                  key={ch}
                  className="flex-1 text-center py-1.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700/60 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300"
                >
                  {ch}
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Card 3: Pixel-Level Heatmaps */}
          <SpotlightCard
            id="heatmaps"
            index="03"
            category="Visuals"
            title="Pixel-Level Heatmaps"
            description="Visualize which specific image regions raised forensic flags through intuitive color-coded heatmaps."
            icon={Grid3x3}
          >
            <div className="space-y-1.5">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-[#1a7fc4]/30 via-amber-400/60 to-red-500/70" />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span>Baseline</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Anomaly Overlay</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Evidence Visualization */}
          <SpotlightCard
            id="evidence-viz"
            index="04"
            category="Telemetry"
            title="Evidence Visualization"
            description="Visualize your analysis results with clear charts and summaries across all your analyses."
            icon={BarChart3}
          >
            <div className="flex items-center justify-between text-[11px] bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700/60 font-mono text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                <span>Evidence Metrics</span>
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-semibold">5 Channels</span>
            </div>
          </SpotlightCard>

          {/* Card 5: Explainable Results */}
          <SpotlightCard
            id="explainable-results"
            index="05"
            category="XAI Engine"
            title="Explainable Results"
            description="Every analysis comes with a breakdown of what evidence contributed to the overall result."
            icon={FileText}
          >
            <div className="flex items-center justify-between text-[11px] bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700/60 font-mono text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Transparent XAI</span>
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-semibold">Audited Breakdown</span>
            </div>
          </SpotlightCard>

          {/* Card 6: Human-Readable Insights */}
          <SpotlightCard
            id="human-readable"
            index="06"
            category="Synthesizer"
            title="Human-Readable Insights"
            description="Clear, accessible language explanations that make forensic evidence understandable to non-experts."
            icon={Sparkles}
          >
            <div className="flex items-center justify-between text-[11px] bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700/60 font-mono text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                <span>Natural Language</span>
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-semibold">Auto-Generated</span>
            </div>
          </SpotlightCard>

          {/* Card 7: Analysis History */}
          <SpotlightCard
            id="analysis-history"
            index="07"
            category="Audit Trail"
            title="Analysis History"
            description="Review your past analyses and track forensic evidence across multiple images over time."
            icon={History}
          >
            <div className="flex items-center justify-between text-[11px] bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700/60 font-mono text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a7fc4] dark:bg-[#5bb8f5]" />
                <span>Timeline Log</span>
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-semibold">Persistent History</span>
            </div>
          </SpotlightCard>

          {/* Card 8: Secure User Accounts */}
          <SpotlightCard
            id="secure-accounts"
            index="08"
            category="Security"
            title="Secure User Accounts"
            description="Your analyses are tied to your authenticated account with security and privacy in mind."
            icon={ShieldCheck}
          >
            <div className="flex items-center justify-between text-[11px] bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700/60 font-mono text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                <span>User Security</span>
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-semibold">Encrypted Vault</span>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  )
}
