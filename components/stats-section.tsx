'use client'

import { useEffect, useRef } from 'react'

const stats = [
  {
    value: '4+',
    label: 'Forensic Evidence Streams',
    note: 'System capability',
  },
  {
    value: '2',
    label: 'Core Analysis Layers',
    note: 'Localization + Forensics',
  },
  {
    value: '1',
    label: 'Unified Explainable Result',
    note: 'Evidence-based summary',
  },
  {
    value: 'Pixel-Level',
    label: 'Forgery Localization',
    note: 'Spatial precision',
  },
  {
    value: 'Evidence-Based',
    label: 'Analysis',
    note: 'Multi-signal reasoning',
  },
]

function useIntersectionObserver(ref: React.RefObject<Element | null>, options?: IntersectionObserverInit) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('animate-in')
        observer.disconnect()
      }
    }, options)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, options])
}

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  useIntersectionObserver(sectionRef as React.RefObject<Element>, { threshold: 0.15 })

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/60 to-white" aria-label="Platform capabilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-3">
            Platform Architecture
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Makes PIXENTRA Different
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            These numbers describe PIXENTRA&apos;s system architecture and forensic capabilities — not benchmark accuracy claims.
          </p>
        </div>

        {/* Stats grid */}
        <div
          ref={sectionRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 opacity-0 translate-y-8 [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0 transition-all duration-700"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 group"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div
                className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1 group-hover:text-[#1a7fc4] transition-colors duration-200"
                aria-label={`${stat.value} ${stat.label}`}
              >
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-gray-700 leading-tight mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-400">{stat.note}</div>
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#1a7fc4] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

