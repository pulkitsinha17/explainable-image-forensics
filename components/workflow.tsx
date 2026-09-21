'use client'

import { LogIn, Upload, FileSearch } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { SPRING_GENTLE, EASE_OUT } from './motion-utils'

const steps = [
  {
    number: '01',
    icon: LogIn,
    title: 'Sign In',
    description: 'Create an account or sign in to access the PIXENTRA image analysis platform.',
  },
  {
    number: '02',
    icon: Upload,
    title: 'Upload & Analyze',
    description: 'Upload an image and let PIXENTRA perform AI-powered localization and multi-evidence forensic analysis.',
  },
  {
    number: '03',
    icon: FileSearch,
    title: 'Understand the Evidence',
    description: 'Explore suspicious regions, forensic evidence, confidence indicators and human-readable explanations.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
}

export function Workflow() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section id="how-it-works" className="py-24 bg-white" aria-label="How PIXENTRA works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            From Image to Insight in 3 Simple Steps
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            PIXENTRA turns a complex forensic analysis into an understandable visual report.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Animated connector line (desktop only) */}
          <div className="hidden md:block absolute top-14 left-[33%] right-[33%] h-0.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-100 via-[#1a7fc4]/30 to-blue-100"
              initial={{ scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.8, ease: EASE_OUT, delay: 0.3 }
              }
            />
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  variants={cardVariants}
                  className="relative"
                >
                  <motion.div
                    className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm h-full cursor-default"
                    whileHover={
                      prefersReducedMotion
                        ? {}
                        : {
                            y: -4,
                            boxShadow: '0 12px 32px -8px rgba(26,127,196,0.14)',
                            borderColor: 'rgba(26,127,196,0.2)',
                          }
                    }
                    transition={SPRING_GENTLE}
                  >
                    {/* Step number + icon */}
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div
                        className="w-12 h-12 rounded-xl bg-[#1a7fc4] flex items-center justify-center shadow-md shadow-blue-100"
                        whileHover={prefersReducedMotion ? {} : { scale: 1.06 }}
                        transition={SPRING_GENTLE}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <span className="text-4xl font-black text-[#1a7fc4]">{step.number}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>

                    {/* Arrow connector for desktop */}
                    {i < steps.length - 1 && (
                      <div className="hidden md:flex absolute -right-4 top-14 -translate-y-1/2 z-10">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center shadow-sm">
                          <svg className="w-3 h-3 text-[#1a7fc4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
