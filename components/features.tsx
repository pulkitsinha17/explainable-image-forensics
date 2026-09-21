'use client'

import {
  MapPin, Layers, Grid3x3, BarChart2,
  FileText, BookOpen, History, UserCheck,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { containerVariantsFast, fadeUpItem, SPRING_GENTLE, EASE_OUT } from './motion-utils'

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
  const prefersReducedMotion = useReducedMotion()

  return (
    <section id="features" className="py-24 bg-white" aria-label="PIXENTRA features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Image Forensics
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A complete toolkit for AI-assisted digital image analysis, from heatmaps to explainable evidence.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariantsFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={fadeUpItem}
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        y: -3,
                        boxShadow: '0 8px 24px -6px rgba(26,127,196,0.12)',
                        borderColor: 'rgba(26,127,196,0.18)',
                      }
                }
                transition={SPRING_GENTLE}
                className="group bg-white rounded-2xl p-6 border border-gray-100 cursor-default"
              >
                {/* Icon container with subtle rotation on hover */}
                <motion.div
                  className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4"
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : {
                          backgroundColor: '#1a7fc4',
                          rotate: 6,
                          scale: 1.05,
                        }
                  }
                  transition={SPRING_GENTLE}
                >
                  <Icon className="w-5 h-5 text-[#1a7fc4] group-hover:text-white transition-colors duration-200" />
                </motion.div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
