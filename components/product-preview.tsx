'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ScanSearch,
  BarChart3,
  FileText,
  Eye,
  ShieldCheck,
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from './motion-utils'

type Tab = 'overview' | 'heatmap' | 'evidence' | 'explanation'

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'heatmap', label: 'Heatmap', icon: ScanSearch },
  { id: 'evidence', label: 'Evidence', icon: BarChart3 },
  { id: 'explanation', label: 'Explanation', icon: FileText },
]

const evidenceData = [
  { label: 'Compression / ELA', value: 75, color: '#dc2626', active: true },
  { label: 'Frequency Analysis', value: 68, color: '#ea580c', active: true },
  { label: 'Noise Analysis', value: 71, color: '#ca8a04', active: true },
  { label: 'Local Statistical', value: 62, color: '#1a7fc4', active: true },
  { label: 'Metadata', value: 0, color: '#9ca3af', active: false },
]

/* ------------------------------------------------------------------ */
/* Tab content components                                              */
/* ------------------------------------------------------------------ */
function OverviewTab() {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a7fc4] dark:bg-[#5bb8f5]" />
            Input Source Image
          </p>
          <span className="text-[10px] text-gray-400 dark:text-slate-400 font-mono bg-gray-100/80 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200/60 dark:border-slate-700">
            1920 × 1080 px
          </span>
        </div>
        <div
          className="rounded-2xl overflow-hidden relative border border-gray-200/80 dark:border-slate-700 shadow-inner group"
          style={{ aspectRatio: '16/10' }}
        >
          <Image
            src="/images/bg.jpg"
            alt="Sample image for forensic analysis"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <Layers className="w-3.5 h-3.5 text-[#5bb8f5]" />
            <span>Forensic Target Frame</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Forensic Telemetry Summary
        </p>
        <div className="space-y-2.5 bg-gray-50/70 dark:bg-slate-800/70 p-4 rounded-2xl border border-gray-100/80 dark:border-slate-700">
          {[
            {
              label: 'Verdict',
              value: 'Likely Manipulated',
              color: 'text-red-600 dark:text-rose-400 font-bold bg-red-50/80 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-red-100 dark:border-rose-800/60',
            },
            {
              label: 'Forgery Anomaly Score',
              value: '74%',
              color: 'text-gray-900 dark:text-white font-bold font-mono',
            },
            {
              label: 'Prediction Certainty',
              value: '91%',
              color: 'text-gray-900 dark:text-white font-bold font-mono',
            },
            {
              label: 'Suspicious Area',
              value: '14.8% of pixels',
              color: 'text-gray-800 dark:text-slate-200 font-semibold',
            },
            {
              label: 'Evidence Channels',
              value: '5 evaluated',
              color: 'text-gray-800 dark:text-slate-200 font-semibold',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 border-b border-gray-200/50 dark:border-slate-700/60 last:border-none"
            >
              <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">{item.label}</span>
              <span className={`text-sm ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeatmapTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Forgery Heatmap Localization
        </p>
        <span className="text-[10px] text-red-600 dark:text-rose-400 font-medium bg-red-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-red-100 dark:border-rose-800/60">
          High Anomaly Zone Detected
        </span>
      </div>

      <div
        className="rounded-2xl overflow-hidden bg-gray-900 relative max-w-lg mx-auto border border-gray-800 shadow-xl group"
        style={{ aspectRatio: '16/10' }}
      >
        <Image
          src="/images/bg_heatmap.png"
          alt="Forgery localization heatmap"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 600px"
        />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-gray-900/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1.5">
          <ScanSearch className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[10px] text-gray-200 font-medium">Localization Map • Multi-Scale</span>
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md border border-white/10 text-[9px] font-mono text-gray-300">
          Confidence: 91%
        </div>
      </div>
      <p className="text-xs text-center text-gray-500 dark:text-slate-400 max-w-md mx-auto">
        Heatmap illustrates localized areas of forensic concern. Warmer colors indicate higher probability of synthetic manipulation or spliced boundaries.
      </p>
    </div>
  )
}

/** Evidence bars animate their width from 0→target whenever this tab mounts */
function EvidenceTab() {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a7fc4] dark:bg-[#5bb8f5]" />
          Forensic Evidence Breakdown
        </p>
        <span className="text-[10px] text-gray-400 dark:text-slate-400 font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200/60 dark:border-slate-700">
          5 Modalities
        </span>
      </div>

      <div className="space-y-3 bg-gray-50/60 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-gray-100/80 dark:border-slate-700">
        {evidenceData.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300 w-28 sm:w-44 shrink-0 truncate">
              {item.label}
            </span>
            <div className="flex-1 min-w-[60px] h-2.5 sm:h-3 bg-gray-200/70 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 shadow-inner">
              {item.active ? (
                <motion.div
                  className="h-full rounded-full shadow-xs"
                  style={{ background: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{
                    duration: 0.7,
                    ease: EASE_OUT,
                    delay: i * 0.07,
                  }}
                />
              ) : (
                <div className="h-full rounded-full bg-gray-300/80 dark:bg-slate-600" style={{ width: '5%' }} />
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold font-mono text-gray-800 dark:text-slate-200 w-12 sm:w-16 text-right shrink-0">
              {item.active ? `${item.value}%` : 'N/A'}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-center">
        Metadata marked N/A — image EXIF was stripped or benign prior to ingestion.
      </p>
    </div>
  )
}

function ExplanationTab() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a7fc4] dark:bg-[#5bb8f5]" />
        Human-Readable Forensic Explanation
      </p>
      <div className="p-5 bg-gradient-to-br from-blue-50/90 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 rounded-2xl border border-blue-100/80 dark:border-blue-900/50 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1a7fc4]/10 dark:bg-[#1a7fc4]/25 border border-[#1a7fc4]/20 dark:border-[#1a7fc4]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">
              AI-Generated Forensic Synthesis
            </p>
            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
              The forensic model identified suspicious pixel patterns across multiple evidence streams with an anomaly score of <strong className="text-gray-900 dark:text-white font-semibold">74%</strong>. Significant inconsistencies were detected in compression artifacts, error level analysis (ELA), frequency characteristics, and local statistics.
            </p>
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          {
            title: 'Compression / ELA Evidence',
            desc: 'Compression and Error Level Analysis revealed artifact inconsistencies suggesting portions of the image underwent differential compression.',
          },
          {
            title: 'Frequency Evidence',
            desc: 'Frequency-domain analysis revealed spectral energy distributions inconsistent with natural image sensor output.',
          },
          {
            title: 'Noise Evidence',
            desc: 'Irregular noise residuals were detected that deviate from the expected baseline camera noise pattern.',
          },
          {
            title: 'Local Statistical Evidence',
            desc: 'Local pixel variance and statistical gradient distributions showed anomalies consistent with digital manipulation.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200/70 dark:border-slate-700 shadow-xs hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
          >
            <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {item.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500 text-center">
        This explanation is generated based on detected forensic signals for investigative guidance.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Product Preview with 3D Tilt & Floating Levitation                  */
/* ------------------------------------------------------------------ */
const tabContent: Record<Tab, React.ReactNode> = {
  overview: <OverviewTab />,
  heatmap: <HeatmapTab />,
  evidence: <EvidenceTab />,
  explanation: <ExplanationTab />,
}

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const prefersReducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D Tilt Physics using Motion Values
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg'])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5
      x.set(mouseX)
      y.set(mouseY)
    },
    [prefersReducedMotion, x, y]
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <section
      className="py-24 bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-[#0B0B0B] dark:via-[#121212] dark:to-[#0B0B0B] relative overflow-hidden transition-colors duration-200"
      aria-label="Interactive product preview"
    >
      {/* Ambient background blur lights that give the floating feeling */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-blue-400/15 via-[#1a7fc4]/10 to-indigo-400/15 dark:from-white/[0.015] dark:via-white/[0.01] dark:to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-cyan-400/10 dark:bg-white/[0.01] rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 dark:bg-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50/90 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 rounded-full text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-widest mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            See PIXENTRA in Action
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Explore forensic analysis capabilities including forgery localization, multi-evidence scoring, and explainable results.
          </p>
        </motion.div>

        {/* 3D Floating Perspective Wrapper */}
        <div className="relative max-w-4xl mx-auto [perspective:1400px]">
          {/* Floating Satellite Badge 1 — Top Left */}
          <motion.div
            className="hidden lg:flex items-center gap-2 absolute -top-6 -left-8 z-20 px-3.5 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/80 dark:border-slate-800 shadow-[0_10px_25px_-5px_rgba(26,127,196,0.15)] ring-1 ring-black/[0.04] dark:ring-white/[0.05]"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    y: [-6, 6, -6],
                    rotate: [-1, 1.5, -1],
                  }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-800 dark:text-slate-100 leading-none">91% Certainty</p>
              <p className="text-[9px] text-gray-400 dark:text-slate-400 font-medium">Multi-Evidence Stream</p>
            </div>
          </motion.div>

          {/* Floating Satellite Badge 2 — Bottom Right */}
          <motion.div
            className="hidden lg:flex items-center gap-2.5 absolute -bottom-6 -right-6 z-20 px-3.5 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/80 dark:border-slate-800 shadow-[0_10px_25px_-5px_rgba(26,127,196,0.15)] ring-1 ring-black/[0.04] dark:ring-white/[0.05]"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    y: [6, -6, 6],
                    rotate: [1, -1, 1],
                  }
            }
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          >
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-800 dark:text-slate-100 leading-none">Explainable AI</p>
              <p className="text-[9px] text-gray-400 dark:text-slate-400 font-medium">Pixel-Level Heatmaps</p>
            </div>
          </motion.div>

          {/* Continuous Floating Levitation Wrapper */}
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                    y: [-8, 8, -8],
                  }
            }
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Interactive 3D Card */}
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={
                prefersReducedMotion
                  ? {}
                  : {
                      rotateX,
                      rotateY,
                      transformStyle: 'preserve-3d',
                    }
              }
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="group relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-slate-800 shadow-[0_25px_60px_-15px_rgba(26,127,196,0.2),0_10px_30px_-10px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] dark:ring-white/[0.05] overflow-hidden transition-shadow duration-500 hover:shadow-[0_35px_80px_-20px_rgba(26,127,196,0.28),0_15px_40px_-10px_rgba(0,0,0,0.08)]"
            >
              {/* Top Specular Glaze Light */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5bb8f5]/60 to-transparent pointer-events-none" />

              {/* Dashboard Browser Chrome Header */}
              <div className="px-3.5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50/90 via-gray-50/70 to-blue-50/40 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-blue-950/40 border-b border-gray-100 dark:border-slate-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Traffic Light Dots */}
                  <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-400/90 border border-red-500/20 shadow-xs" />
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-amber-400/90 border border-amber-500/20 shadow-xs" />
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-400/90 border border-emerald-500/20 shadow-xs" />
                  </div>

                  <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 ml-0.5 sm:ml-1 shrink-0" />

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 tracking-tight truncate">
                      PIXENTRA Analysis Dashboard
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Demo
                    </span>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={SPRING_PRESS} className="shrink-0">
                  <Link
                    href="/analyze"
                    className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#1a7fc4] to-[#1565a8] text-white text-xs font-semibold rounded-xl shadow-[0_4px_12px_rgba(26,127,196,0.3)] hover:shadow-[0_6px_16px_rgba(26,127,196,0.4)] transition-all duration-200"
                    id="product-preview-cta"
                  >
                    <span>Try Real Image</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              </div>

              {/* Tabs with Smooth Pill Indicator */}
              <div className="px-3 sm:px-6 pt-3 flex gap-1 sm:gap-1.5 border-b border-gray-100 dark:border-slate-800 overflow-x-auto max-w-full bg-gray-50/30 dark:bg-slate-800/30 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      id={`preview-tab-${tab.id}`}
                      className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl whitespace-nowrap transition-colors duration-150 shrink-0 ${
                        isActive
                          ? 'text-[#1a7fc4] dark:text-[#5bb8f5]'
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      {tab.label}
                      {/* Shared-layout active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="tab-active-line"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a7fc4] dark:bg-[#5bb8f5] rounded-t-full shadow-xs"
                          transition={
                            prefersReducedMotion ? { duration: 0 } : SPRING_LAYOUT
                          }
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Tab content — AnimatePresence for smooth transitions */}
              <div className="p-4 sm:p-8 min-h-[300px] bg-white dark:bg-slate-900 max-w-full overflow-hidden transition-colors duration-200">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTab}
                    initial={
                      prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }
                    }
                    transition={{ duration: 0.22, ease: EASE_OUT }}
                  >
                    {tabContent[activeTab]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* Dynamic Ground Contact Shadow (Breathes with floating card) */}
          <motion.div
            className="w-3/4 h-8 bg-blue-900/15 dark:bg-blue-950/30 rounded-[100%] mx-auto blur-xl -mt-2 -z-10 pointer-events-none"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    scaleX: [0.9, 1.05, 0.9],
                    opacity: [0.25, 0.5, 0.25],
                  }
            }
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </section>
  )
}
