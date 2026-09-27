'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { containerVariants, fadeUpItem, SPRING_GENTLE, EASE_OUT } from './motion-utils'

const useCases = [
  {
    image: '/images/pixentra_media_journalism.png',
    title: 'Media & Journalism',
    description: 'Verify images before publication and investigate suspicious visual content with forensic evidence.',
  },
  {
    image: '/images/pixentra_digital_investigations_clean.png',
    title: 'Digital Investigations',
    description: 'Support image-based forensic analysis with localized and explainable evidence streams.',
  },
  {
    image: '/images/pixentra_academic_research_clean.png',
    title: 'Academic & Research',
    description: 'Explore image manipulation and digital forensics through interpretable AI-assisted analysis.',
  },
  {
    image: '/images/pixentra_individuals_clean.png',
    title: 'Individuals',
    description: 'Understand whether an image contains suspicious signs of manipulation using evidence-based analysis.',
  },
]

export function UseCases() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section id="use-cases" className="py-24 bg-gradient-to-b from-blue-50/40 to-white dark:from-[#121212] dark:to-[#0B0B0B] transition-colors duration-200" aria-label="Use cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <div>
            <p className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-widest mb-3">
              Built for a More Trustworthy Digital World
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Trusted Across Domains
            </h2>
          </div>
          <Link
            href="/sign-up"
            className="text-sm font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] hover:text-[#1565a8] dark:hover:text-[#88ccfa] flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            Explore Use Cases →
          </Link>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {useCases.map((uc) => (
            <motion.div
              key={uc.title}
              variants={fadeUpItem}
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
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs cursor-default overflow-hidden transition-colors duration-200"
            >
              {/* Image with subtle zoom on card hover */}
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-5 bg-gray-50 dark:bg-slate-800">
                <motion.div
                  className="absolute inset-0"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <Image
                    src={uc.image}
                    alt={uc.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </motion.div>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{uc.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{uc.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
