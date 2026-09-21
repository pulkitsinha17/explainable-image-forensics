'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, animate } from 'motion/react'
import { containerVariants, fadeUpItem, SPRING_GENTLE } from './motion-utils'

const stats = [
  {
    value: '4+',
    numericPart: 4,
    suffix: '+',
    label: 'Forensic Evidence Streams',
    note: 'System capability',
    isNumeric: true,
  },
  {
    value: '2',
    numericPart: 2,
    suffix: '',
    label: 'Core Analysis Layers',
    note: 'Localization + Forensics',
    isNumeric: true,
  },
  {
    value: '1',
    numericPart: 1,
    suffix: '',
    label: 'Unified Explainable Result',
    note: 'Evidence-based summary',
    isNumeric: true,
  },
  {
    value: 'Pixel-Level',
    numericPart: null,
    suffix: '',
    label: 'Forgery Localization',
    note: 'Spatial precision',
    isNumeric: false,
  },
  {
    value: 'Evidence-Based',
    numericPart: null,
    suffix: '',
    label: 'Analysis',
    note: 'Multi-signal reasoning',
    isNumeric: false,
  },
]

/** Counts up from 0 to target value once inView */
function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [display, setDisplay] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(target)
      return
    }
    const controls = animate(0, target, {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        setDisplay(Math.round(value))
      },
    })
    return controls.stop
  }, [target, prefersReducedMotion])

  return <>{display}{suffix}</>
}

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/60 to-white" aria-label="Platform capabilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-3">
            Platform Architecture
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Makes PIXENTRA Different
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            These numbers describe PIXENTRA&apos;s system architecture and forensic capabilities — not benchmark accuracy claims.
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          ref={sectionRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUpItem}
              whileHover={
                prefersReducedMotion
                  ? {}
                  : {
                      y: -3,
                      boxShadow: '0 8px 24px -4px rgba(26,127,196,0.12)',
                      borderColor: 'rgba(26,127,196,0.2)',
                    }
              }
              transition={SPRING_GENTLE}
              className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm cursor-default"
            >
              <div
                className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1"
                aria-label={`${stat.value} ${stat.label}`}
              >
                {stat.isNumeric && stat.numericPart !== null && hasAnimated ? (
                  <AnimatedNumber target={stat.numericPart} suffix={stat.suffix} />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-sm font-semibold text-gray-700 leading-tight mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-400">{stat.note}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
