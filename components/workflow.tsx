'use client'

import { useEffect, useRef } from 'react'
import { LogIn, Upload, FileSearch } from 'lucide-react'

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

export function Workflow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cards = el.querySelectorAll('.step-card')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => {
            setTimeout(() => {
              card.classList.add('in-view')
            }, i * 180)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="py-24 bg-white" aria-label="How PIXENTRA works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            From Image to Insight in 3 Simple Steps
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            PIXENTRA turns a complex forensic analysis into an understandable visual report.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector lines (desktop) */}
          <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-100 to-blue-100 pointer-events-none" />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="step-card opacity-0 translate-y-6 [&.in-view]:opacity-100 [&.in-view]:translate-y-0 transition-all duration-600"
              >
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 group h-full">
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#1a7fc4] flex items-center justify-center shadow-md shadow-blue-100 group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-4xl font-black text-[#1a7fc4] group-hover:text-[#1565a8] transition-colors">{step.number}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>

                  {/* Arrow connector for desktop */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-[#1a7fc4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
