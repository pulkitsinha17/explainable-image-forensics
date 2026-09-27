import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Cpu,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Compass,
  Database,
  BarChart3,
  BookOpen,
  ArrowRight,
  Shield,
  Activity,
  Zap,
  Tag,
  Waves,
  Grid,
  Lock,
  GitBranch,
  Target,
  FileSpreadsheet,
  ExternalLink,
  Table,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research & Architecture — PIXENTRA | Explainable Multi-Evidence Forensics",
  description:
    "Scientific foundations, multi-evidence neural fusion methodology, 270-dimensional calibrated classification, and empirical validation benchmarks behind PIXENTRA.",
};

const researchNav = [
  { id: "overview", label: "Research Overview" },
  { id: "system-pipeline", label: "System Pipeline" },
  { id: "mpc-foundation", label: "MPC Foundation" },
  { id: "evidence-channels", label: "Evidence Channels" },
  { id: "localization", label: "Feature Fusion & Localization" },
  { id: "classification", label: "270-D Classification & Calibration" },
  { id: "hybrid-assessment", label: "Hybrid Forensic Assessment" },
  { id: "datasets", label: "Evaluated Datasets" },
  { id: "classification-eval", label: "Classification Evaluation" },
  { id: "localization-eval", label: "Localization Evaluation" },
  { id: "ablation-study", label: "Evidence Channel Ablation" },
  { id: "limitations", label: "Known Limitations" },
  { id: "references", label: "Technical References" },
];

const evidenceChannels = [
  {
    name: "Compression Forensics",
    badge: "Quantization Grids",
    icon: Waves,
    color: "#dc2626",
    bg: "bg-red-50/70",
    border: "border-red-200/60",
    examines: "8×8 block DCT quantization coefficients and grid continuity.",
    utility:
      "Detects differences in compression history when an object from a differently-compressed source is pasted into a host image.",
    inconsistency:
      "Exposes block artifact grid misalignments and differential coefficient distributions.",
    role: "Supporting evidence channel — must be corroborated as benign multiple resaves can create mild compression variance.",
  },
  {
    name: "Frequency & Noise Forensics",
    badge: "Spectral Energy",
    icon: Activity,
    color: "#ea580c",
    bg: "bg-orange-50/70",
    border: "border-orange-200/60",
    examines: "High-frequency radial spectral decay and high-pass sensor noise residuals.",
    utility:
      "Captures periodic interpolation peaks from spatial resampling alongside camera sensor PRNU (Photo-Response Non-Uniformity) deviations.",
    inconsistency:
      "Identifies spliced regions that do not share the baseline camera sensor's high-frequency noise fingerprint.",
    role: "Supporting evidence channel — high-ISO capture or heavy optical bokeh can alter local noise profiles naturally.",
  },
  {
    name: "Local Statistical Variance",
    badge: "Spatial Texture",
    icon: BarChart3,
    color: "#1a7fc4",
    bg: "bg-blue-50/70",
    border: "border-blue-200/60",
    examines: "Local pixel variance, neighborhood covariance matrices, and edge gradient continuity.",
    utility:
      "Highlights unnatural micro-texture smoothness, blurred boundary seams, or statistical distribution shifts characteristic of copy-move cloning or inpainting.",
    inconsistency:
      "Reveals boundary transitions where statistical texture gradients do not match surrounding native context.",
    role: "Supporting evidence channel — sharp natural contrast transitions must be evaluated alongside frequency signals.",
  },
  {
    name: "Error Level Analysis (ELA)",
    badge: "Resave Differentials",
    icon: Grid,
    color: "#ca8a04",
    bg: "bg-amber-50/70",
    border: "border-amber-200/60",
    examines: "Error magnitude variance when re-compressing the image at a known uniform quality level (e.g., 90%).",
    utility:
      "Highlights modified regions that have not reached compression equilibrium with the rest of the image.",
    inconsistency:
      "Produces localized brightness spikes across modified areas that have undergone fewer or different compression cycles.",
    role: "Supporting evidence channel — high-frequency textured regions naturally exhibit higher ELA response than flat surfaces.",
  },
  {
    name: "Metadata & Structural EXIF",
    badge: "Header Signatures",
    icon: Tag,
    color: "#059669",
    bg: "bg-emerald-50/70",
    border: "border-emerald-200/60",
    examines: "Embedded EXIF, XMP, TIFF headers, software tags, and quantization table fingerprints.",
    utility:
      "Identifies explicit digital editing software signatures, camera serial mismatches, or modified capture timestamps.",
    inconsistency:
      "Flags metadata headers indicating third-party image manipulation programs (e.g., Adobe Photoshop, GIMP).",
    role: "Supporting evidence channel — social media platforms often strip EXIF data entirely, resulting in neutral (N/A) scores without implying manipulation.",
  },
];

const technicalReferences = [
  {
    category: "Contrastive Representation",
    title: "Multi-Pixel Contrastive Learning for Image Manipulation Localization (MPC)",
    authors: "Research Publication (arXiv:2307.07252)",
    venue: "arXiv Preprint, 2023",
    url: "https://arxiv.org/abs/2307.07252",
    description:
      "Foundation paper introducing Multi-Pixel Contrastive learning that forces pixel representations from authentic regions to cluster while separating tampered boundaries.",
  },
  {
    category: "Compression Domain",
    title: "CAT-Net: Compression Artifact Tracing Network for Forgery Localization",
    authors: "Research Publication (arXiv:2103.02868)",
    venue: "IEEE International Conference on Computer Vision (ICCV)",
    url: "https://arxiv.org/abs/2103.02868",
    description:
      "End-to-end framework leveraging RGB and DCT domain streams to trace compression artifact grids across manipulated image regions.",
  },
  {
    category: "Foundational Textbook",
    title: "Photo Forensics: Scientific Survey & Fundamentals",
    authors: "Hany Farid",
    venue: "MIT Press, 2016",
    url: "https://mitpress.mit.edu/9780262035347/photo-forensics/",
    description:
      "Comprehensive theoretical treatment of digital image forensics, lighting inconsistencies, resampling detection, JPEG compression artifacts, and sensor noise fingerprints.",
  },
  {
    category: "Error Level Analysis",
    title: "A Picture's Worth... Digital Image Analysis & Error Level Analysis",
    authors: "Neal Krawetz",
    venue: "Hacker Factor Solutions, 2007",
    url: "https://www.hackerfactor.com/blog/index.php?/archives/322-A-Picture-Worth.html",
    description:
      "Original technical publication establishing Error Level Analysis (ELA) and quantization matrix differential examination for digital forgery analysis.",
  },
  {
    category: "Benchmark Dataset",
    title: "CASIA Image Tampering Detection Evaluation Database",
    authors: "Jing Dong, Wei Wang, Tieniu Tan",
    venue: "IEEE ChinaSIP, 2013",
    url: "http://forensics.idealtest.org/",
    description:
      "Standard academic benchmark dataset containing authentic, spliced, and copy-move manipulated images with ground-truth binary masks.",
  },
  {
    category: "Benchmark Dataset",
    title: "COVERAGE: A Copy-Move Forgery Database with Similar But Authentic Objects",
    authors: "Bihan Wen et al.",
    venue: "IEEE International Conference on Image Processing (ICIP)",
    url: "https://github.com/wenbihan/coverage",
    description:
      "Challenging copy-move benchmark dataset with genuine duplicate objects designed to test localization accuracy against false-positive triggering.",
  },
  {
    category: "Benchmark Dataset",
    title: "Columbia Uncompressed Image Splicing Detection Evaluation Dataset",
    authors: "DVMM Laboratory, Columbia University",
    venue: "Columbia University Research Repository",
    url: "https://www.ee.columbia.edu/ln/dvmm/researchProjects/Authentication/downloads.htm",
    description:
      "Benchmark dataset containing uncompressed optical splices, providing a controlled testbed for evaluating sensor noise and edge gradient characteristics.",
  },
  {
    category: "Benchmark Dataset",
    title: "IMD2020: A Large-Scale In-The-Wild Image Manipulation Dataset",
    authors: "Adam Novozamsky et al.",
    venue: "IEEE WACV Workshops, 2020",
    url: "https://github.com/grip-unina/IMD2020",
    description:
      "Real-world manipulation dataset gathered from internet sources containing varied authentic post-processing, social media compression, and inpainting.",
  },
  {
    category: "Forensic Standards",
    title: "NIST Guidelines on Digital Media Forensics & Media Authentication",
    authors: "National Institute of Standards and Technology (NIST)",
    venue: "NIST Special Publications & Media Forensics Program",
    url: "https://www.nist.gov/itl/iad/mig/digital-media-forensics",
    description:
      "Official standards regarding digital evidence integrity, audit trails, and reporting methodologies for multimedia verification in investigative settings.",
  },
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-[#fcfdfd] dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 flex flex-col antialiased">
      {/* Shared Public Navbar */}
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-20 bg-gradient-to-b from-blue-50/70 via-white to-[#fcfdfd] dark:from-white/[0.02] dark:via-[#0B0B0B] dark:to-[#0B0B0B] border-b border-gray-100/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50/90 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 rounded-full mb-5 shadow-2xs">
                <Cpu className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                <span className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] tracking-wide uppercase">
                  Technical Architecture &amp; Methodology
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-5">
                Scientific Foundations of PIXENTRA
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mb-8">
                An in-depth technical examination of PIXENTRA&apos;s multi-evidence neural fusion, MPC foundation backbone, 270-dimensional calibrated classification, and empirical dataset evaluations.
              </p>

              {/* Quick Navigation Buttons (Same-tab in-page navigation) */}
              <div className="flex flex-wrap gap-2 pt-1">
                {researchNav.map((item) => (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 hover:border-[#1a7fc4] dark:hover:border-[#5bb8f5] hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all shadow-2xs"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area with Sticky In-Page Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Desktop Sticky In-Page Navigation Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-4 select-none">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-4 shadow-2xs">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                  Research Index
                </p>
                <nav className="flex flex-col space-y-1">
                  {researchNav.map((item) => (
                    <Link
                      key={item.id}
                      href={`#${item.id}`}
                      className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] hover:bg-blue-50/70 dark:hover:bg-blue-950/30 rounded-xl transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* User Guide Helper Card */}
              <div className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-blue-950/30 rounded-2xl border border-blue-100/90 dark:border-slate-800 p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5]">
                  <BookOpen className="w-4 h-4" />
                  <span>Looking for the User Guide?</span>
                </div>
                <p className="text-[11.5px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Need practical guidance on uploading images or understanding results? Visit our Documentation page.
                </p>
                <Link
                  href="/documentation"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] hover:text-[#1565a8] dark:hover:text-blue-300 pt-1"
                >
                  <span>Open Documentation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </aside>

            {/* Technical Sections */}
            <div className="lg:col-span-9 space-y-16">
              {/* ---------------------------------------------------- */}
              {/* 1. RESEARCH OVERVIEW                                 */}
              {/* ---------------------------------------------------- */}
              <section id="overview" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>Scientific Motivation</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    1. Research Overview &amp; Motivation
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  Digital image manipulation detection benefits significantly from combining global image-level classification with spatial pixel-level localization and multiple complementary physical forensic signals.
                </p>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  Traditional standalone deep networks often act as opaque black-box classifiers. While they may memorize semantic patterns within specific training splits, they frequently fail to generalize across unseen camera sensors or explain why an image was deemed suspicious. PIXENTRA is designed as an <strong>explainable multi-evidence image forensics system</strong> that couples contrastive deep representation learning with explicit signal-domain forensic extractors.
                </p>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 2. SYSTEM PIPELINE                                   */}
              {/* ---------------------------------------------------- */}
              <section id="system-pipeline" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>System Architecture</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    2. Conceptual System Pipeline
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  PIXENTRA executes an integrated multi-stage pipeline where spatial pixel localization and image-level classification operate as related but distinct analytical outputs:
                </p>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] rounded-lg">Input Image</span>
                    <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg">Preprocessing</span>
                    <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg">MPC / Deep Forensic Extraction</span>
                    <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg">Multi-Evidence Processing</span>
                    <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg">Feature Fusion</span>
                    <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] rounded-lg">Localization &amp; 270-D Classification</span>
                    <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg">Calibration</span>
                    <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">Hybrid Assessment &amp; Report</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed pt-2">
                    <strong>Separate Output Heads:</strong> The pixel localization head reconstructs fine-grained spatial anomaly maps via feature pyramid skip connections, while the classification head aggregates a rich 270-dimensional feature vector to determine global manipulation likelihood.
                  </p>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 3. MPC FOUNDATION                                    */}
              {/* ---------------------------------------------------- */}
              <section id="mpc-foundation" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Contrastive Representation</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    3. Multi-Pixel Contrastive (MPC) Foundation
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  PIXENTRA incorporates deep learned forensic representations derived from the <strong>Multi-Pixel Contrastive (MPC)</strong> backbone foundation. Contrastive pre-training teaches the network to pull features from authentic pixel patches together in latent space while pushing tampered pixel boundaries apart.
                </p>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Role in PIXENTRA</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    The MPC foundation provides a high-level spatial prior that captures boundary discontinuity. PIXENTRA fuses this deep prior with explicit signal-domain evidence extractors (noise residuals, DCT frequency spectra, ELA, and statistical variance) to ensure both high spatial precision and physical interpretability.
                  </p>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 4. MULTI-EVIDENCE CHANNELS                           */}
              {/* ---------------------------------------------------- */}
              <section id="evidence-channels" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Domain Evidence Streams</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    4. The Five Multi-Evidence Channels
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  In accordance with the project notebooks, PIXENTRA extracts five dedicated forensic evidence channels:
                </p>

                <div className="space-y-4">
                  {evidenceChannels.map((ch) => {
                    const Icon = ch.icon;
                    return (
                      <div
                        key={ch.name}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#1a7fc4] dark:text-[#5bb8f5]">
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                              {ch.name}
                            </h3>
                          </div>
                          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                            {ch.badge}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <div className="p-3 bg-gray-50/70 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60 space-y-1">
                            <p className="font-bold text-gray-800 dark:text-gray-200">What It Examines:</p>
                            <p className="text-gray-500 dark:text-gray-400">{ch.examines}</p>
                          </div>
                          <div className="p-3 bg-gray-50/70 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60 space-y-1">
                            <p className="font-bold text-gray-800 dark:text-gray-200">Forensic Inconsistency Revealed:</p>
                            <p className="text-gray-500 dark:text-gray-400">{ch.inconsistency}</p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-blue-50/40 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                          <strong className="text-[#1a7fc4] dark:text-[#5bb8f5]">Forensic Role:</strong> {ch.role}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 5. FEATURE FUSION & LOCALIZATION                     */}
              {/* ---------------------------------------------------- */}
              <section id="localization" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Search className="w-3.5 h-3.5" />
                    <span>Spatial Decoding</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    5. Feature Fusion &amp; Spatial Localization
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  The Multi-Evidence model fuses the deep forensic representation with explicit evidence channels across multiple spatial resolution scales.
                </p>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Validated 0.38 Operating Threshold</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    The final localization evaluation in the project uses an established <strong>operating evaluation threshold of 0.38</strong> (identified as an operational decision threshold rather than an uncalibrated probability threshold) to generate binary masks from the continuous localization map.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 bg-gray-50 dark:bg-slate-800/70 rounded-xl border border-gray-100 dark:border-slate-700/60">
                      <p className="font-bold text-gray-900 dark:text-white text-xs">Continuous Anomaly Heatmap</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Pixel anomaly intensity across all coordinate positions mapped with JET colormap visualization.
                      </p>
                    </div>
                    <div className="p-3.5 bg-gray-50 dark:bg-slate-800/70 rounded-xl border border-gray-100 dark:border-slate-700/60">
                      <p className="font-bold text-gray-900 dark:text-white text-xs">Thresholded Binary Mask (τ = 0.38)</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Binarized mask for calculating precision, recall, F1, IoU, and forged area percentage.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 6. 270-D CLASSIFICATION & CALIBRATION                */}
              {/* ---------------------------------------------------- */}
              <section id="classification" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Feature Representation</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    6. 270-Dimensional Classification &amp; Calibration
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  In the final project architecture, the image-level classifier operates on a comprehensive <strong>270-dimensional feature vector</strong> structured into three conceptual groups:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <span className="text-[11px] font-mono font-bold text-[#1a7fc4] dark:text-[#5bb8f5] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      Group 1
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Global Pooled Deep Features</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      High-level semantic representations pooled across encoder layers capturing global structural coherence.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <span className="text-[11px] font-mono font-bold text-[#1a7fc4] dark:text-[#5bb8f5] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      Group 2
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Localization Statistics</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Spatial anomaly metrics including peak heatmap intensity, spatial dispersion, boundary gradients, and cluster area fraction.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <span className="text-[11px] font-mono font-bold text-[#1a7fc4] dark:text-[#5bb8f5] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      Group 3
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Evidence Channel Contributions</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Normalized scalar contributions extracted from compression, frequency/noise, local statistics, and ELA pipelines.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Probability Calibration</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Raw logits are calibrated conceptually so that output values accurately reflect empirical manipulation probabilities, yielding calibrated manipulation probabilities, authenticity probabilities, and prediction certainty scores.
                  </p>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 7. HYBRID FORENSIC ASSESSMENT                        */}
              {/* ---------------------------------------------------- */}
              <section id="hybrid-assessment" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Decision Fusion</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    7. Hybrid Forensic Assessment
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  PIXENTRA synthesizes image-level classification with localized spatial evidence to determine the final assessment:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-5 border border-emerald-200/60 dark:border-emerald-900/50 space-y-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Authentic</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Concordant low classifier risk and clean spatial localization (minimal spatial anomaly fraction).
                    </p>
                  </div>

                  <div className="bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl p-5 border border-rose-200/60 dark:border-rose-900/50 space-y-2">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Manipulated</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Concordant high classifier risk and contiguous localized anomaly clusters exceeding the operating threshold.
                    </p>
                  </div>

                  <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-5 border border-amber-200/60 dark:border-amber-900/50 space-y-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Inconclusive</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Triggered when channels conflict (e.g., elevated localized anomaly area with low global classifier risk).
                    </p>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 8. EVALUATED DATASETS                                */}
              {/* ---------------------------------------------------- */}
              <section id="datasets" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Benchmark Corpora</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    8. Evaluated Datasets
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  As established in the project notebooks, the final classifier was developed using a training pool consisting of <strong>CASIA2 + Columbia + IMD2020</strong>, while <strong>COVERAGE</strong> was reserved strictly as an external benchmark.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: "CASIA2",
                      type: "Classification & Localization",
                      role: "Training Pool & Held-Out Test",
                      desc: "Contains authentic, spliced, and copy-move manipulated images across diverse natural scenes with ground-truth binary masks.",
                    },
                    {
                      name: "Columbia",
                      type: "Classification & Dedicated Localization",
                      role: "Training Pool & External Localization",
                      desc: "Uncompressed optical splicing benchmark containing 180 spliced images evaluated for boundary precision without JPEG compression confounding.",
                    },
                    {
                      name: "IMD2020",
                      type: "Classification Benchmark",
                      role: "Training Pool & External Generalization",
                      desc: "Real-world in-the-wild manipulations gathered from internet sources evaluating cross-domain robustness under realistic compression.",
                    },
                    {
                      name: "COVERAGE",
                      type: "Dedicated Localization Evaluation",
                      role: "External Benchmark (Not in Classifier Training Pool)",
                      desc: "100 correctly paired copy-move tampered images with genuine duplicate background objects evaluated for spatial localization precision.",
                    },
                  ].map((ds) => (
                    <div
                      key={ds.name}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{ds.name}</h3>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] rounded-md">
                            {ds.type}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{ds.role}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{ds.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 9. CLASSIFICATION EVALUATION                         */}
              {/* ---------------------------------------------------- */}
              <section id="classification-eval" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Quantitative Validation</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    9. Image-Level Classification Evaluation
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  Validated classification results from the final notebook on canonical held-out test data and external IMD2020 generalization data:
                </p>

                {/* Canonical Held-Out Test Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                  <div className="px-5 py-3.5 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase">
                      Canonical Held-Out Test Evaluation
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">Final Classifier Notebook</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-slate-800 text-center p-2">
                    <div className="p-3.5 space-y-1">
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">0.9975</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">ROC-AUC</p>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">0.9981</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">PR-AUC</p>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">97.30%</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Accuracy</p>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">97.44%</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Bal. Accuracy</p>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">97.60%</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">F1-Score</p>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-gray-50/50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Precision:</span>{" "}
                      <strong className="text-gray-800 dark:text-gray-200 font-mono">98.78%</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Recall:</span>{" "}
                      <strong className="text-gray-800 dark:text-gray-200 font-mono">96.44%</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Brier Score:</span>{" "}
                      <strong className="text-gray-800 dark:text-gray-200 font-mono">0.0205</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Selective Accuracy:</span>{" "}
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono">98.96% (94.65% cov)</strong>
                    </div>
                  </div>
                </div>

                {/* External IMD2020 Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                  <div className="px-5 py-3.5 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase">
                      External IMD2020 Generalization Benchmark
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">In-The-Wild Evaluation</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-slate-800 text-center p-2">
                    <div className="p-3.5 space-y-1">
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">0.9487</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">ROC-AUC</p>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">0.8470</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">PR-AUC</p>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">91.45%</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Accuracy</p>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono">81.91%</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">F1-Score</p>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-gray-50/50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Balanced Accuracy:</span>{" "}
                      <strong className="text-gray-800 dark:text-gray-200 font-mono">87.89%</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Precision:</span>{" "}
                      <strong className="text-gray-800 dark:text-gray-200 font-mono">82.76%</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-500">Recall:</span>{" "}
                      <strong className="text-gray-800 dark:text-gray-200 font-mono">81.08%</strong>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 10. LOCALIZATION EVALUATION                          */}
              {/* ---------------------------------------------------- */}
              <section id="localization-eval" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Grid className="w-3.5 h-3.5" />
                    <span>Pixel-Level Benchmarks</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    10. Spatial Localization Evaluation
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  Pixel-level localization results evaluated on dedicated external benchmark datasets using ground-truth binary masks:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Columbia */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Columbia Splicing Dataset</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] rounded-md font-bold">
                        180 Spliced Images
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center py-2">
                      <div className="p-2.5 bg-gray-50 dark:bg-slate-800/70 rounded-xl">
                        <p className="text-lg font-black text-gray-900 dark:text-white font-mono">94.42%</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Pixel Precision</p>
                      </div>
                      <div className="p-2.5 bg-gray-50 dark:bg-slate-800/70 rounded-xl">
                        <p className="text-lg font-black text-gray-900 dark:text-white font-mono">87.29%</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Pixel Recall</p>
                      </div>
                      <div className="p-2.5 bg-gray-50 dark:bg-slate-800/70 rounded-xl">
                        <p className="text-lg font-black text-gray-900 dark:text-white font-mono">89.53%</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Pixel F1-Score</p>
                      </div>
                      <div className="p-2.5 bg-gray-50 dark:bg-slate-800/70 rounded-xl">
                        <p className="text-lg font-black text-gray-900 dark:text-white font-mono">86.43%</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Pixel IoU</p>
                      </div>
                    </div>
                  </div>

                  {/* COVERAGE */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">COVERAGE Copy-Move Dataset</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] rounded-md font-bold">
                        100 Paired Tampered
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center py-2">
                      <div className="p-3 bg-gray-50 dark:bg-slate-800/70 rounded-xl">
                        <p className="text-xl font-black text-gray-900 dark:text-white font-mono">0.4152</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pixel-Level F1</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-slate-800/70 rounded-xl">
                        <p className="text-xl font-black text-gray-900 dark:text-white font-mono">0.3472</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pixel-Level IoU</p>
                      </div>
                    </div>
                    <p className="text-[11.5px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      Evaluated on challenging copy-move images featuring authentic duplicate objects with similar texture characteristics.
                    </p>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 11. ABLATION STUDY                                   */}
              {/* ---------------------------------------------------- */}
              <section id="ablation-study" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Table className="w-3.5 h-3.5" />
                    <span>Evidence Channel Ablation</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    11. Evidence Contribution &amp; Ablation Analysis
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  The purpose of the ablation study is <strong>to examine the contribution of individual forensic evidence channels to localization performance</strong>.
                </p>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Key Finding</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Ablation experiments in the notebook confirm that fusing physical signal channels (Noise Residuals, DCT Frequency, ELA, and Local Statistics) with the deep MPC prior provides superior boundary sensitivity compared to relying on any single modality or pure RGB features alone.
                  </p>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 12. KNOWN LIMITATIONS                                */}
              {/* ---------------------------------------------------- */}
              <section id="limitations" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Scientific Boundaries</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    12. Known Limitations &amp; Operational Boundaries
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">External-Domain Variation</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Images subject to extreme multi-round social media compression or resizing can exhibit attenuated frequency artifacts, leading to reduced sensitivity.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Localization False Positives on Authentic Images</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Strong optical depth-of-field blur, high-ISO noise reduction, or extreme lighting contrast can induce localized variance on authentic photos.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Copy-Move Global Pooling Limitations</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Copy-move manipulation (where content is cloned from within the same image) produces identical noise profiles, making it more challenging for global image classifiers than splicing.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Inconclusive Conflicting Signals</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      When forensic evidence channels yield contradictory indicators, the system reserves the Inconclusive verdict to prevent ungrounded predictions.
                    </p>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 13. TECHNICAL REFERENCES (External links open new tab)*/}
              {/* ---------------------------------------------------- */}
              <section id="references" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Academic Literature &amp; Datasets</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    13. Technical References &amp; External Reading
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  Published research papers, dataset repositories, and digital forensics standards that inform PIXENTRA&apos;s methodology. All external links open in a new tab:
                </p>

                <div className="space-y-3.5">
                  {technicalReferences.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs hover:border-[#1a7fc4] dark:hover:border-[#5bb8f5] hover:shadow-md transition-all flex flex-col justify-between block"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-[#1a7fc4] dark:text-[#5bb8f5] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                            {ref.category}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                            {ref.venue}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#1a7fc4] dark:group-hover:text-[#5bb8f5] transition-colors leading-snug">
                          {ref.title}
                        </h3>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {ref.authors}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {ref.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5]">
                        <span>Visit Source / Paper</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>

              {/* Callout Footer Banner */}
              <div className="p-8 bg-gradient-to-r from-blue-50/90 via-blue-50/50 to-white dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 rounded-3xl border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Explore PIXENTRA in action
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Upload an image to inspect live multi-evidence channels and localization heatmaps.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/documentation"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold hover:border-[#1a7fc4] dark:hover:border-[#5bb8f5] hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] transition-colors whitespace-nowrap shadow-2xs"
                  >
                    User Guide
                  </Link>
                  <Link
                    href="/analyze"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a7fc4] text-white text-xs sm:text-sm font-semibold hover:bg-[#1565a8] transition-colors shadow-sm whitespace-nowrap"
                  >
                    Start Analysis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Shared Public Footer */}
      <Footer />
    </div>
  );
}
