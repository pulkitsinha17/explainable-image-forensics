'use client'

import { useEffect, useRef } from 'react'
import {
  MapPin, Layers, Grid3x3, BarChart2,
  FileText, BookOpen, History, UserCheck,
} from 'lucide-react'

const features = [
  {
    icon: MapPin,
    title: 'AI-Powered Forgery Localization',
    description: 'Automatically identify and highlight suspicious image regions with pixel-level precision using AI-assisted analysis.',
  },
  {
    icon: Layers,
    title: 'Multi-Evidence Forensic Analysis',
    description: 'Combine spatial, frequency, noise, compression, and statistical signals for a more complete forensic picture.',
  },
  {
    icon: Grid3x3,
    title: 'Pixel-Level Heatmaps',
    description: 'Visualize which specific image regions raised forensic flags through intuitive color-coded heatmaps.',
  },
  {
    icon: BarChart2,
    title: 'Evidence Visualization',
    description: 'Visualize your analysis results with clear charts and summaries across all your analyses.',
  },
  {
    icon: FileText,
    title: 'Explainable Results',
    description: 'Every analysis comes with a breakdown of what evidence contributed to the overall result.',
  },
  {
    icon: BookOpen,
    title: 'Human-Readable Insights',
    description: 'Clear, accessible language explanations that make forensic evidence understandable to non-experts.',
  },
  {
    icon: History,
    title: 'Analysis History',
    description: 'Review your past analyses and track forensic evidence across multiple images over time.',
  },
  {
    icon: UserCheck,
    title: 'Secure User Accounts',
    description: 'Your analyses are tied to your authenticated account with security and privacy in mind.',
  },
]

export function Features() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cards = el.querySelectorAll('.feature-card')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('in-view'), i * 60)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="py-24 bg-white" aria-label="PIXENTRA features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Image Forensics
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A complete toolkit for AI-assisted digital image analysis, from heatmaps to explainable evidence.
          </p>
        </div>

        {/* Feature grid */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="feature-card opacity-0 translate-y-4 [&.in-view]:opacity-100 [&.in-view]:translate-y-0 transition-all duration-500 group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-shadow"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/60 flex items-center justify-center mb-4 group-hover:from-[#1a7fc4] group-hover:to-[#1565a8] transition-all duration-300">
                  <Icon className="w-5 h-5 text-[#1a7fc4] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

