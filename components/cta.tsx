import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section
      className="py-24 bg-[#0d1117] relative overflow-hidden"
      aria-label="Call to action"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1a7fc4]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#1a7fc4 1px, transparent 1px), linear-gradient(to right, #1a7fc4 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow */}
        <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-6">
          TRUST EVIDENCE, NOT ASSUMPTIONS
        </p>

        {/* Headline */}
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          See Beyond the Pixels.
        </h2>

        {/* Supporting text */}
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Explore image forensics through AI-powered localization and explainable multi-evidence analysis.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-[#1a7fc4] text-white font-bold rounded-xl hover:bg-[#1565a8] transition-all duration-200 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/40 text-base"
            id="cta-create-account"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Sign in link */}
        <p className="mt-5 text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="text-[#1a7fc4] hover:text-[#1565a8] font-medium transition-colors"
            id="cta-sign-in-link"
          >
            Sign In
          </Link>
        </p>
      </div>
    </section>
  )
}

