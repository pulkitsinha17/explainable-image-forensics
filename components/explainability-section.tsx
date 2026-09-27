'use client'

import { useEffect, useRef } from 'react'
import { ScanSearch, BarChart3, Eye } from 'lucide-react'

const evidenceStrength = [
  { label: 'Spatial Evidence', strength: 78, color: '#ef4444' },
  { label: 'Frequency Evidence', strength: 62, color: '#f97316' },
  { label: 'Noise Evidence', strength: 71, color: '#eab308' },
  { label: 'Compression (ELA)', strength: 55, color: '#5bb8f5' },
  { label: 'Statistical', strength: 49, color: '#8b5cf6' },
]

function ForensicReportMock() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden max-w-2xl mx-auto">
      {/* Report header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-850 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#5bb8f5] animate-pulse" />
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">PIXENTRA Forensic Report</span>
          <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">— Illustrative Example</span>
        </div>
        <div className="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 rounded-full">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Suspicious Activity Detected</span>
        </div>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Left: image pair */}
        <div className="space-y-3">
          {/* Original */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-1.5">Original Image</p>
            <div className="rounded-xl aspect-video overflow-hidden bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 relative">
              <svg className="absolute bottom-0 w-full" viewBox="0 0 200 80" fill="none">
                <path d="M0 80 L0 45 L20 25 L40 45 L40 80Z" fill="#334155" opacity="0.5"/>
                <path d="M35 80 L35 35 L55 15 L75 35 L75 80Z" fill="#1e293b" opacity="0.6"/>
                <path d="M70 80 L70 50 L90 30 L110 50 L110 80Z" fill="#334155" opacity="0.4"/>
                <path d="M140 80 L140 40 L160 18 L180 40 L180 80Z" fill="#1e293b" opacity="0.6"/>
                <path d="M80 80 L110 15 L140 80Z" fill="#475569" opacity="0.3"/>
              </svg>
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-blue-200/50 dark:from-blue-900/30 to-transparent" />
            </div>
          </div>

          {/* Analyzed */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-1.5">Analyzed Heatmap</p>
            <div className="rounded-xl aspect-video overflow-hidden bg-gray-900 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900" />
              <div
                className="absolute rounded-full blur-xl"
                style={{
                  width: '80px', height: '80px',
                  background: 'radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(239,68,68,0.3) 50%, transparent 70%)',
                  top: '5%', left: '18%',
                }}
              />
              <div
                className="absolute rounded-full blur-lg"
                style={{
                  width: '55px', height: '55px',
                  background: 'radial-gradient(circle, rgba(249,115,22,0.7) 0%, transparent 70%)',
                  top: '35%', right: '25%',
                }}
              />
              <div className="absolute inset-2 border border-blue-800/30 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right: evidence breakdown */}
        <div className="space-y-4">
          {/* Suspicion score */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" className="dark:stroke-slate-800" strokeWidth="6" />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${0.71 * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-red-500">71%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Suspicion Score</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">Elevated Suspicion</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">Illustrative score — not calibrated benchmark</p>
            </div>
          </div>

          {/* Evidence strength */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#5bb8f5]" />
              <p className="text-xs font-semibold text-gray-700 dark:text-slate-200">Evidence Strength</p>
            </div>
            <div className="space-y-2">
              {evidenceStrength.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 w-28 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.strength}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI explanation */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-start gap-2">
              <ScanSearch className="w-4 h-4 text-[#5bb8f5] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-700 dark:text-slate-200 mb-1">Human-Readable Insight</p>
                <p className="text-[10px] text-gray-600 dark:text-slate-300 leading-relaxed">
                  Suspicious activity was localized primarily around the highlighted region. Supporting inconsistencies were observed across spatial, noise and frequency evidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExplainabilitySection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-in')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className="py-24 bg-white dark:bg-[#0B0B0B] border-t border-slate-100 dark:border-slate-800"
      aria-label="Explainable AI forensic dashboard"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-[#5bb8f5] uppercase tracking-widest mb-3">
            Explainable AI
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Don&apos;t Just Get a Result.
            <br className="hidden sm:block" />
            <span className="text-[#5bb8f5]"> Understand Why.</span>
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-base">
            PIXENTRA provides a breakdown of the forensic evidence supporting each result — so you can evaluate the reasoning, not just the verdict.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Heatmaps', 'Evidence Visualization', 'Human-Readable Insights'].map((feat) => (
              <div key={feat} className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/60 rounded-full border border-blue-100 dark:border-blue-900/40">
                <Eye className="w-3.5 h-3.5 text-[#5bb8f5]" />
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock dashboard */}
        <div
          ref={ref}
          className="opacity-0 translate-y-8 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 transition-all duration-700"
        >
          <ForensicReportMock />
          <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4">
            ↑ Illustrative UI example — scores and regions shown are for demonstration purposes only
          </p>
        </div>
      </div>
    </section>
  )
}
