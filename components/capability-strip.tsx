'use client'

import { ShieldCheck, Brain, Layers, MapPin, Lock } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { containerVariants, fadeUpItem, SPRING_GENTLE } from './motion-utils'

const capabilities = [
  {
    icon: ShieldCheck,
    title: 'High-Quality Analysis',
    description: 'AI-assisted image forensics',
  },
  {
    icon: Brain,
    title: 'Explainable AI',
    description: 'Understand the reasoning',
  },
  {
    icon: Layers,
    title: 'Multi-Evidence',
    description: 'Multiple forensic signals',
  },
  {
    icon: MapPin,
    title: 'Forgery Localization',
    description: 'Identify suspicious regions',
  },
  {
    icon: Lock,
    title: 'Privacy Focused',
    description: 'Designed with secure analysis in mind',
  },
]

export function CapabilityStrip() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="py-12 bg-white border-y border-gray-100" aria-label="Core capabilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {capabilities.map((cap) => {
            const Icon = cap.icon
            return (
              <motion.div
                key={cap.title}
                variants={fadeUpItem}
                className="flex flex-col items-center text-center gap-3 group cursor-default"
              >
                <motion.div
                  className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : { y: -3, backgroundColor: 'rgba(26, 127, 196, 0.1)' }
                  }
                  transition={SPRING_GENTLE}
                >
                  <Icon className="w-5 h-5 text-[#1a7fc4]" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{cap.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cap.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
