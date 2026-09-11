import Link from "next/link";
import Image from "next/image";
import { Upload, History, Settings, BarChart3, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard navbar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/">
          <Image
            src="/pixentra-logo.svg"
            alt="PIXENTRA"
            width={120}
            height={60}
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Dashboard</span>
          <div className="w-8 h-8 rounded-full bg-[#1a7fc4] flex items-center justify-center">
            <span className="text-white text-xs font-bold">U</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PIXENTRA</h1>
          <p className="text-gray-500">
            Analyze images for forensic evidence and explore explainable results.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {[
            { icon: Upload, label: 'Analyze Image', desc: 'Upload and analyze a new image', color: '#1a7fc4', href: '/analyze' },
            { icon: History, label: 'Analysis History', desc: 'Review past analyses', color: '#8b5cf6', href: '/history' },
            { icon: BarChart3, label: 'Recent Results', desc: 'View recent forensic results', color: '#10b981', href: '/results' },
            { icon: Settings, label: 'Settings', desc: 'Manage your account', color: '#f59e0b', href: '/settings' },
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${action.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
                <p className="text-sm text-gray-500">{action.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: action.color }}>
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Integration note */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Backend Integration Pending</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This dashboard is ready for Clerk authentication and FastAPI/PyTorch backend integration.
            Once connected, users can upload real images and receive live forensic analysis results
            with heatmaps, evidence breakdowns, and explainable AI summaries.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#1a7fc4] hover:text-[#1565a8] transition-colors"
          >
            ← Back to landing page
          </Link>
        </div>
      </div>
    </div>
  );
}
