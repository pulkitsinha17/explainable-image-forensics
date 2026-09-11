import { ShieldCheck, Brain, Layers, MapPin, Lock } from 'lucide-react'

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
  return (
    <section className="py-12 bg-white border-y border-gray-100" aria-label="Core capabilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {capabilities.map((cap) => {
            const Icon = cap.icon
            return (
              <div
                key={cap.title}
                className="flex flex-col items-center text-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-[#1a7fc4]/10 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-[#1a7fc4]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{cap.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cap.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

