'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ScanSearch, BarChart3, FileText, Eye } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { EASE_OUT, SPRING_LAYOUT } from './motion-utils'

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
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Input Image</p>
        <div className="rounded-xl overflow-hidden relative" style={{ aspectRatio: '16/10' }}>
          <Image
            src="/images/bg.jpg"
            alt="Sample image for forensic analysis"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Summary</p>
        <div className="space-y-3">
          {[
            { label: 'Verdict', value: 'Likely Manipulated', color: 'text-red-600 font-bold' },
            { label: 'Forgery Anomaly Score', value: '74%', color: 'text-gray-700 font-semibold' },
            { label: 'Prediction Certainty', value: '91%', color: 'text-gray-700 font-semibold' },
            { label: 'Suspicious Area', value: '14.8% of pixels', color: 'text-gray-700 font-semibold' },
            { label: 'Evidence Channels', value: '5 evaluated', color: 'text-gray-700 font-semibold' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{item.label}</span>
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
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Forgery Heatmap Visualization</p>
      <div className="rounded-xl overflow-hidden bg-gray-900 relative max-w-lg mx-auto" style={{ aspectRatio: '16/10' }}>
        <Image
          src="/images/bg_heatmap.png"
          alt="Forgery localization heatmap"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
        <div className="absolute top-3 left-3 px-2 py-1 bg-gray-800/70 backdrop-blur-xs rounded-lg">
          <span className="text-[9px] text-gray-300 font-medium">Localization Map</span>
        </div>
      </div>
      <p className="text-xs text-center text-gray-400">Heatmap illustrates localized areas of forensic concern. Warmer colors indicate higher suspicion.</p>
    </div>
  )
}

/** Evidence bars animate their width from 0→target whenever this tab mounts */
function EvidenceTab() {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Forensic Evidence Breakdown</p>
      {evidenceData.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-44 flex-shrink-0">{item.label}</span>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            {item.active ? (
              <motion.div
                className="h-full rounded-full"
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
              <div className="h-full rounded-full bg-gray-200" style={{ width: '5%' }} />
            )}
          </div>
          <span className="text-sm font-semibold text-gray-700 w-16 text-right">
            {item.active ? `${item.value}%` : 'N/A'}
          </span>
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-2">Metadata marked N/A — no anomalous metadata flags detected.</p>
    </div>
  )
}

function ExplanationTab() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Human-Readable Forensic Explanation</p>
      <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
        <div className="flex items-start gap-2">
          <ScanSearch className="w-5 h-5 text-[#1a7fc4] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">AI-Generated Forensic Summary</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The forensic model identified suspicious pixel patterns across multiple evidence streams with an anomaly score of 74%. Significant inconsistencies were detected in compression artifacts, error level analysis (ELA), frequency characteristics, and local statistics.
            </p>
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { title: 'Compression / ELA Evidence', desc: 'Compression and Error Level Analysis revealed artifact inconsistencies suggesting portions of the image underwent re-saving or differential compression.' },
          { title: 'Frequency Evidence', desc: 'Frequency-domain analysis revealed spectral energy distributions inconsistent with natural image sensor output.' },
          { title: 'Noise Evidence', desc: 'Irregular noise residuals were detected that deviate from the expected baseline camera noise pattern.' },
          { title: 'Local Statistical Evidence', desc: 'Local pixel variance and statistical gradient distributions showed anomalies consistent with digital manipulation.' },
        ].map((item) => (
          <div key={item.title} className="p-4 bg-white rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-800 mb-1">{item.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">
        This explanation is based on detected forensic signals. PIXENTRA does not claim to identify exact manipulation methods.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Product Preview                                                     */
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

  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50/40" aria-label="Interactive product preview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-3">
            Product Preview
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            See PIXENTRA in Action
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Explore forensic analysis capabilities including forgery localization, multi-evidence scoring, and explainable results.
          </p>
        </motion.div>

        {/* Dashboard preview card */}
        <motion.div
          className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
        >
          {/* Dashboard header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-600 ml-2">PIXENTRA Analysis Dashboard</span>
            </div>
            <Link
              href="/analyze"
              className="px-4 py-1.5 bg-[#1a7fc4] text-white text-xs font-semibold rounded-lg hover:bg-[#1565a8] transition-colors"
              id="product-preview-cta"
            >
              Try with Real Image →
            </Link>
          </div>

          {/* Tabs — shared-layout sliding indicator */}
          <div className="px-6 pt-4 flex gap-1 border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  id={`preview-tab-${tab.id}`}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors duration-150 ${
                    isActive
                      ? 'text-[#1a7fc4]'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {/* Shared-layout active underline */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-active-line"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a7fc4] rounded-t-full"
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
          <div className="p-6 min-h-[280px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
