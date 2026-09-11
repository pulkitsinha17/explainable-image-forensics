'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ScanSearch, BarChart3, FileText, Eye } from 'lucide-react'

type Tab = 'overview' | 'heatmap' | 'evidence' | 'explanation'

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'heatmap', label: 'Heatmap', icon: ScanSearch },
  { id: 'evidence', label: 'Evidence', icon: BarChart3 },
  { id: 'explanation', label: 'Explanation', icon: FileText },
]

const evidenceData = [
  { label: 'Spatial / Pixel Analysis', value: 78, color: '#dc2626', active: true },
  { label: 'Frequency Analysis', value: 62, color: '#ea580c', active: true },
  { label: 'Noise Analysis', value: 71, color: '#ca8a04', active: true },
  { label: 'Compression / ELA', value: 55, color: '#1a7fc4', active: true },
  { label: 'Statistical Analysis', value: 49, color: '#7c3aed', active: true },
  { label: 'Metadata', value: 0, color: '#9ca3af', active: false },
]

function OverviewTab() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Input Image</p>
        {/* campus.png as the analyzed image */}
        <div className="rounded-xl overflow-hidden relative" style={{ aspectRatio: '16/10' }}>
          <Image
            src="/images/campus.png"
            alt="Sample image for forensic analysis"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-700">Suspicious Activity Detected</span>
          </span>
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Summary</p>
        <div className="space-y-3">
          {[
            { label: 'Overall Suspicion', value: 'Elevated', color: 'text-amber-600' },
            { label: 'Localized Region', value: 'Upper-center', color: 'text-gray-700' },
            { label: 'Evidence Streams', value: '5 of 6 active', color: 'text-gray-700' },
            { label: 'Analysis Type', value: 'Multi-evidence', color: 'text-gray-700' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-gray-600">
          <span className="font-semibold">Note:</span> This is a mock analysis for demonstration. Connect FastAPI backend to enable real ML inference.
        </div>
      </div>
    </div>
  )
}

function HeatmapTab() {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Forgery Heatmap Visualization</p>
      <div className="rounded-xl overflow-hidden bg-gray-900 relative max-w-lg mx-auto" style={{ aspectRatio: '16/10' }}>
        {/* Campus image darkened as base */}
        <Image
          src="/images/campus.png"
          alt="Heatmap overlay on analyzed image"
          fill
          className="object-cover opacity-30"
          sizes="(max-width: 768px) 100vw, 600px"
        />
        {/* Heatmap blobs */}
        <div className="absolute rounded-full blur-2xl" style={{ width: '140px', height: '120px', background: 'radial-gradient(circle, rgba(220,38,38,0.9) 0%, rgba(220,38,38,0.4) 50%, transparent 70%)', top: '8%', left: '22%' }} />
        <div className="absolute rounded-full blur-xl" style={{ width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(234,88,12,0.75) 0%, transparent 70%)', top: '40%', right: '20%' }} />
        <div className="absolute rounded-full blur-lg" style={{ width: '50px', height: '50px', background: 'radial-gradient(circle, rgba(202,138,4,0.65) 0%, transparent 70%)', bottom: '20%', left: '40%' }} />
        {/* Legend */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          {[['High', '#dc2626'], ['Medium', '#ea580c'], ['Low', '#ca8a04']].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[9px] text-gray-300 font-medium">{label}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-3 left-3 px-2 py-1 bg-gray-800/70 rounded-lg">
          <span className="text-[9px] text-gray-300">Suspicion Intensity</span>
        </div>
      </div>
      <p className="text-xs text-center text-gray-400">Heatmap illustrates localized areas of forensic concern. Warmer colors indicate higher suspicion.</p>
    </div>
  )
}

function EvidenceTab() {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Forensic Evidence Breakdown</p>
      {evidenceData.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-40 flex-shrink-0">{item.label}</span>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            {item.active ? (
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${item.value}%`, background: item.color }}
              />
            ) : (
              <div className="h-full rounded-full bg-gray-200" style={{ width: '5%' }} />
            )}
          </div>
          <span className="text-sm font-semibold text-gray-700 w-16 text-right">
            {item.active ? `${item.value}%` : 'N/A'}
          </span>
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-2">Metadata marked N/A — not available in this sample image.</p>
    </div>
  )
}

function ExplanationTab() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Human-Readable Forensic Explanation</p>
      <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
        <div className="flex items-start gap-2">
          <ScanSearch className="w-5 h-5 text-[#1a7fc4] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">AI-Generated Forensic Summary</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Suspicious activity was localized primarily around the highlighted region in the upper-center of the image. Supporting inconsistencies were observed across spatial, noise, and frequency evidence streams.
            </p>
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { title: 'Spatial Evidence', desc: 'Pixel-level inconsistencies were detected in the flagged region, suggesting potential compositing or content modification.' },
          { title: 'Frequency Evidence', desc: 'Frequency-domain analysis revealed patterns inconsistent with the surrounding image content.' },
          { title: 'Noise Evidence', desc: 'Irregular noise characteristics were identified that differ from the expected camera noise profile.' },
          { title: 'Compression Evidence', desc: 'Compression artifact patterns suggest the region may have undergone separate processing.' },
        ].map((item) => (
          <div key={item.title} className="p-4 bg-white rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-800 mb-1">{item.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">
        This explanation is based on detected forensic signals. PIXENTRA does not claim to identify exact manipulation methods.
      </p>
    </div>
  )
}

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabContent: Record<Tab, React.ReactNode> = {
    overview: <OverviewTab />,
    heatmap: <HeatmapTab />,
    evidence: <EvidenceTab />,
    explanation: <ExplanationTab />,
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50/40" aria-label="Interactive product preview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-[#1a7fc4] uppercase tracking-widest mb-3">
            Product Preview
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            See PIXENTRA in Action
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Explore the mock analysis dashboard. Real analysis requires sign-in and will connect to the ML inference backend.
          </p>
        </div>

        {/* Mock dashboard */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-4xl mx-auto">
          {/* Dashboard header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-600 ml-2">PIXENTRA Analysis Dashboard</span>
            </div>
            <Link
              href="/sign-up"
              className="px-4 py-1.5 bg-[#1a7fc4] text-white text-xs font-semibold rounded-lg hover:bg-[#1565a8] transition-colors"
              id="product-preview-cta"
            >
              Try with Real Image →
            </Link>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4 flex gap-1 border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  id={`preview-tab-${tab.id}`}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#1a7fc4] text-[#1a7fc4] bg-blue-50/60'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="p-6">
            <div key={activeTab} className="animate-fade-in">
              {tabContent[activeTab]}
            </div>
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Mock data only — connect FastAPI/PyTorch backend for real inference
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-400">Backend not connected</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
