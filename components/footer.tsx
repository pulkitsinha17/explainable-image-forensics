import Link from 'next/link'
import Image from 'next/image'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Analysis', href: '/sign-up' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Use Cases', href: '#use-cases' },
    { label: 'Get Started', href: '/sign-up' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Research', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-14 grid sm:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" aria-label="PIXENTRA home">
              <Image
                src="/pixentra-logo.svg"
                alt="PIXENTRA"
                width={140}
                height={70}
                className="h-10 w-auto mb-4"
              />
            </Link>
            <p className="text-sm font-semibold text-gray-700 mb-1">See Beyond the Pixels</p>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Explainable multi-evidence image forgery detection and localization.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-[#1a7fc4] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © 2026 PIXENTRA. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-gray-400 hover:text-[#1a7fc4] transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-[#1a7fc4] transition-colors">Terms</Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-[#1a7fc4] transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

