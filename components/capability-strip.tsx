'use client'

import { ShieldCheck, Brain, Layers, MapPin, Lock } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_OUT, SPRING_GENTLE, SPRING_PRESS } from './motion-utils'

const capabilities = [
  {
    icon: ShieldCheck,
    title: 'High-Quality Analysis',
    description: 'AI-assisted image forensics',
    accent: '#1a7fc4',
    glow: 'rgba(26,127,196,0.18)',
  },
  {
    icon: Brain,
    title: 'Explainable AI',
    description: 'Understand the reasoning',
    accent: '#7c3aed',
    glow: 'rgba(124,58,237,0.18)',
  },
  {
    icon: Layers,
    title: 'Multi-Evidence',
    description: 'Multiple forensic signals',
    accent: '#0891b2',
    glow: 'rgba(8,145,178,0.18)',
  },
  {
    icon: MapPin,
    title: 'Forgery Localization',
    description: 'Identify suspicious regions',
    accent: '#dc2626',
    glow: 'rgba(220,38,38,0.16)',
  },
  {
    icon: Lock,
    title: 'Privacy Focused',
    description: 'Designed with secure analysis in mind',
    accent: '#059669',
    glow: 'rgba(5,150,105,0.16)',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
}

export function CapabilityStrip() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      className="relative py-16 overflow-hidden"
      aria-label="Core capabilities"
      style={{
        background: 'linear-gradient(135deg, #f0f7ff 0%, #f8f9ff 40%, #f0f4f8 100%)',
      }}
    >
      {/* Subtle top + bottom border lines */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(26,127,196,0.2) 30%, rgba(26,127,196,0.35) 50%, rgba(26,127,196,0.2) 70%, transparent)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(26,127,196,0.15) 30%, rgba(26,127,196,0.25) 50%, rgba(26,127,196,0.15) 70%, transparent)' }}
      />

      {/* Ambient background blobs */}
      <div
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,127,196,0.07) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow label */}
        <motion.p
          className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] mb-8"
          style={{ color: '#1a7fc4' }}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          Platform Capabilities
        </motion.p>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {capabilities.map((cap) => {
            const Icon = cap.icon
            return (
              <motion.div
                key={cap.title}
                variants={cardVariants}
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        y: -4,
                        boxShadow: `0 16px 40px -8px ${cap.glow}, 0 4px 16px -4px rgba(0,0,0,0.06)`,
                        borderColor: `${cap.accent}35`,
                      }
                }
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                transition={SPRING_GENTLE}
                className="relative flex flex-col items-center text-center gap-4 p-5 rounded-2xl cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04), 0 1px 4px -1px rgba(0,0,0,0.04)',
                }}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${cap.accent}60, transparent)` }}
                />

                {/* Icon container */}
                <motion.div
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cap.accent}12` }}
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : {
                          scale: 1.08,
                          background: `${cap.accent}20`,
                        }
                  }
                  transition={SPRING_PRESS}
                >
                  {/* Glow behind icon */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                    style={{ background: `radial-gradient(circle, ${cap.glow} 0%, transparent 70%)` }}
                  />
                  <Icon
                    className="w-5 h-5 relative z-10"
                    style={{ color: cap.accent }}
                    strokeWidth={1.75}
                  />
                </motion.div>

                {/* Text */}
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-gray-800 leading-tight">{cap.title}</p>
                  <p className="text-[11.5px] text-gray-500 leading-relaxed">{cap.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
