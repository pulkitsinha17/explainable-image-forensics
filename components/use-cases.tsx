'use client'

import { useEffect, useRef } from 'react'
import { Newspaper, Search, GraduationCap, User } from 'lucide-react'
import Link from 'next/link'

const useCases = [
  {
    icon: Newspaper,
    title: 'Media & Journalism',
    description: 'Verify images before publication and investigate suspicious visual content with forensic evidence.',
  },
  {
    icon: Search,
    title: 'Digital Investigations',
    description: 'Support image-based forensic analysis with localized and explainable evidence streams.',
  },
  {
    icon: GraduationCap,
    title: 'Academic & Research',
    description: 'Explore image manipulation and digital forensics through interpretable AI-assisted analysis.',
  },
  {
    icon: User,
    title: 'Individuals',
    description: 'Understand whether an image contains suspicious signs of manipulation using evidence-based analysis.',
  },
]

export function UseCases() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cards = el.querySelectorAll('.use-case-card')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('in-view'), i * 100)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="use-cases" className="py-24 bg-gradient-to-b from-blue-50/40 to-white" aria-label="Use cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-3">
              Built for a More Trustworthy Digital World
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Trusted Across Domains
            </h2>
          </div>
          <Link
            href="/sign-up"
            className="text-sm font-semibold text-[#1a7fc4] hover:text-[#1565a8] flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            Explore Use Cases →
          </Link>
        </div>

        {/* Cards */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {useCases.map((uc, i) => {
            const Icon = uc.icon
            return (
              <div
                key={uc.title}
                className="use-case-card opacity-0 translate-y-6 [&.in-view]:opacity-100 [&.in-view]:translate-y-0 transition-all duration-500 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-[#1a7fc4] transition-colors duration-200">
                  <Icon className="w-5 h-5 text-[#1a7fc4] group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{uc.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

