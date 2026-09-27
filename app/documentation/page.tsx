import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  BookOpen,
  ArrowRight,
  UploadCloud,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Sliders,
  History,
  Layers,
  Sparkles,
  Search,
  ShieldCheck,
  Compass,
  GraduationCap,
  ExternalLink,
  Info,
  Download,
  Share2,
  Activity,
  BarChart2,
  Split,
  RefreshCw,
  MessageSquareQuote,
  Eye,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — PIXENTRA | User Guide & Forensic Knowledge Hub",
  description:
    "Comprehensive product documentation and learning guide for PIXENTRA: learn how to upload images, interpret localization heatmaps and multi-evidence scores, understand verdicts, export reports, and explore forensic science resources.",
};

const navSections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "understanding-results", label: "Understanding Results" },
  { id: "analysis-workspace", label: "Using the Analysis Page" },
  { id: "localization-guide", label: "Understanding Localization" },
  { id: "reports-history", label: "Reports & History" },
  { id: "resources", label: "Learning Resources" },
  { id: "faq", label: "Practical FAQ" },
];

const externalResources = [
  {
    category: "Forensic Foundations",
    title: "Photo Forensics: Scientific Survey & Fundamentals",
    author: "Hany Farid (MIT Press)",
    description:
      "A standard academic reference covering the mathematical foundations of digital image tampering, lighting inconsistencies, resampling detection, and sensor noise fingerprints.",
    url: "https://mitpress.mit.edu/9780262035347/photo-forensics/",
    type: "Textbook / Reference",
  },
  {
    category: "Contrastive Forensics",
    title: "Multi-Pixel Contrastive Learning for Image Forgery Localization (MPC)",
    author: "Research Publication (arXiv:2307.07252)",
    description:
      "The underlying contrastive representation learning framework that trains neural representations to cluster authentic pixel patches while distinguishing tampered boundaries.",
    url: "https://arxiv.org/abs/2307.07252",
    type: "Research Paper",
  },
  {
    category: "Compression Forensics",
    title: "A Picture's Worth... Digital Image Analysis & Error Level Analysis (ELA)",
    author: "Dr. Neal Krawetz (Hacker Factor)",
    description:
      "The foundational technical overview explaining how JPEG compression grids, quantization tables, and intentional resave differentials reveal composite regions.",
    url: "https://www.hackerfactor.com/blog/index.php?/archives/322-A-Picture-Worth.html",
    type: "Technical Article",
  },
  {
    category: "Deep Forensic Architectures",
    title: "CAT-Net: Compression Artifact Tracing Network for Forgery Localization",
    author: "Research Publication (arXiv:2103.02868)",
    description:
      "End-to-end framework demonstrating joint RGB and DCT domain stream learning to trace double JPEG compression and boundary artifacts.",
    url: "https://arxiv.org/abs/2103.02868",
    type: "Research Paper",
  },
  {
    category: "Benchmark Datasets",
    title: "CASIA Tampered Image Detection Database (CASIA v1 & v2)",
    author: "Institute of Automation, Chinese Academy of Sciences (CASIA)",
    description:
      "The widely adopted standard academic image forensics dataset featuring carefully paired splicing, copy-move forgeries, and ground-truth binary masks.",
    url: "http://forensics.idealtest.org/",
    type: "Dataset Corpus",
  },
  {
    category: "Benchmark Datasets",
    title: "COVERAGE: Copy-Move Forgery Dataset with Similar But Authentic Objects",
    author: "Wen et al. (IEEE ICIP)",
    description:
      "Challenging copy-move benchmark dataset designed specifically with genuine duplicate objects to test localization precision versus false-positive triggering.",
    url: "https://github.com/wenbihan/coverage",
    type: "Dataset Repository",
  },
  {
    category: "Benchmark Datasets",
    title: "Columbia Uncompressed Image Splicing Dataset",
    author: "Columbia University DVMM Lab",
    description:
      "Benchmark dataset containing uncompressed optical splices, providing an ideal testbed for evaluating sensor noise and edge gradient characteristics without JPEG artifacts.",
    url: "https://www.ee.columbia.edu/ln/dvmm/researchProjects/Authentication/downloads.htm",
    type: "Dataset Corpus",
  },
  {
    category: "Benchmark Datasets",
    title: "IMD2020: A Large-Scale In-The-Wild Image Manipulation Dataset",
    author: "Novozamsky et al. (WACV Workshops)",
    description:
      "Curated real-world image manipulation dataset gathered from internet sources containing authentic post-processing, social media compression, and diverse edits.",
    url: "https://github.com/grip-unina/IMD2020",
    type: "Dataset Repository",
  },
  {
    category: "Standards & Governance",
    title: "NIST Guidelines on Digital Media Forensics & Integrity Verification",
    author: "National Institute of Standards and Technology (NIST)",
    description:
      "Official standards regarding digital evidence integrity, audit trails, and reporting methodologies for digital media authentication in investigative settings.",
    url: "https://www.nist.gov/itl/iad/mig/digital-media-forensics",
    type: "Technical Standard",
  },
];

const docFaqs = [
  {
    q: "What image formats and file size limits are supported?",
    a: "PIXENTRA supports standard digital image formats including JPEG, JPG, PNG, and WebP, with a maximum file upload limit of 10 MB. High-resolution photographs, document scans, and web graphics are automatically preprocessed into standardized 512×512 multi-channel evaluation tensors.",
  },
  {
    q: "What does an Inconclusive verdict mean?",
    a: "An Inconclusive assessment occurs when the platform's multi-evidence channels produce conflicting or borderline forensic signals. For example, an image might display localized noise texture variations caused by optical lens blur while maintaining clean, uniform compression grids and baseline frequency decay. Rather than guessing, PIXENTRA flags the result as Inconclusive to signify that human forensic verification is recommended.",
  },
  {
    q: "What does the localization heatmap show?",
    a: "The localization heatmap maps the spatial concentration of forensic anomalies across your image. Warmer hues (red, orange, yellow) indicate pixel regions where noise residuals, DCT frequency anomalies, compression differentials, or local statistics deviate significantly from the baseline camera profile. Cool hues (blue, cyan) represent natural baseline consistency.",
  },
  {
    q: "Does a high Forensic Manipulation Score guarantee that an image was tampered with?",
    a: "No. PIXENTRA provides scientific forensic indicators and AI-assisted probability estimates to guide investigations. While elevated scores reflect strong statistical and physical anomalies consistent with tampering, forensic indicators should be corroborated with context and independent evidence for high-stakes or legal determinations.",
  },
  {
    q: "Why can the localization heatmap and the image-level classification disagree?",
    a: "Localization and image-level classification examine related but distinct dimensions of an image. A tiny spliced object (e.g., 1% of total pixels) may generate a distinct, localized heatmap hotspot while the global image classifier sees 99% authentic context. Conversely, global social-media compression might elevate global classifier uncertainty without creating localized spatial clusters. PIXENTRA's hybrid engine handles these discrepancies transparently.",
  },
  {
    q: "What do the individual evidence breakdown bars represent?",
    a: "The evidence breakdown displays normalized 0%–100% scores for each evaluated modality: Compression (quantization grid & ELA consistency), Frequency / Noise (spectral energy decay & high-pass sensor PRNU residuals), Local Statistics (spatial variance & gradient continuity), and Error Level Analysis (ELA). Each bar shows how strongly that specific physical modality contributed to the assessment.",
  },
  {
    q: "What does metadata analysis mean in PIXENTRA?",
    a: "Metadata analysis inspects embedded structural EXIF and XMP tags for editing software signatures (e.g., Photoshop, GIMP), camera model consistency, and timestamp integrity. If an image was shared via messaging platforms that strip metadata, the metadata channel will display neutral (N/A) without penalizing the visual forensic channels.",
  },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-[#fcfdfd] dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 flex flex-col antialiased transition-colors duration-200">
      {/* Shared Public Navbar */}
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-20 bg-gradient-to-b from-blue-50/70 via-white to-[#fcfdfd] dark:from-white/[0.02] dark:via-[#0B0B0B] dark:to-[#0B0B0B] border-b border-gray-100/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50/90 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/60 rounded-full mb-5 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                <span className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] tracking-wide uppercase">
                  User Guide &amp; Knowledge Hub
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-5">
                How to Use PIXENTRA &amp; Interpret Evidence
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 leading-relaxed max-w-2xl mb-8">
                Learn how to upload images, evaluate pixel-level localization heatmaps, understand multi-evidence forensic channels, generate PDF reports, and explore trusted forensics resources.
              </p>

              {/* Quick Jump Buttons (Same-tab in-page navigation) */}
              <div className="flex flex-wrap gap-2 pt-1">
                {navSections.map((item) => (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 hover:border-[#1a7fc4] dark:hover:border-[#5bb8f5] hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-300 transition-all shadow-2xs"
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
                <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                  Documentation Index
                </p>
                <nav className="flex flex-col space-y-1">
                  {navSections.map((item) => (
                    <Link
                      key={item.id}
                      href={`#${item.id}`}
                      className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-slate-400 hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] hover:bg-blue-50/70 dark:hover:bg-blue-950/40 rounded-xl transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Technical Hub Helper Card */}
              <div className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 rounded-2xl border border-blue-100/90 dark:border-slate-800 p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5]">
                  <Cpu className="w-4 h-4" />
                  <span>Looking for Technical Specs?</span>
                </div>
                <p className="text-[11.5px] text-gray-500 dark:text-slate-400 leading-relaxed">
                  Explore our neural pipeline, multi-evidence fusion methodology, and validated CASIA/Columbia evaluation metrics on the Research page.
                </p>
                <Link
                  href="/research"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] hover:text-[#1565a8] dark:hover:text-[#88ccfa] pt-1"
                >
                  <span>Explore Research</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </aside>

            {/* Document Content Sections */}
            <div className="lg:col-span-9 space-y-16">
              {/* ---------------------------------------------------- */}
              {/* 1. GETTING STARTED                                   */}
              {/* ---------------------------------------------------- */}
              <section id="getting-started" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Workflow Walkthrough</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    1. Getting Started with PIXENTRA
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
                  PIXENTRA transforms deep digital image forensics into a clear, explainable, step-by-step investigative process. Here is how an image flows from upload to insight:
                </p>

                {/* Workflow Flow Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    {
                      step: "01",
                      title: "Upload Your Image",
                      desc: "Select or drop a JPEG, PNG, or WebP image file (up to 10 MB). Preview image dimensions and file size before initiating analysis.",
                      icon: UploadCloud,
                    },
                    {
                      step: "02",
                      title: "Multi-Evidence Analysis",
                      desc: "The backend processes the image across 5 distinct evidence channels (noise residuals, DCT frequency spectra, ELA, statistics, metadata).",
                      icon: Cpu,
                    },
                    {
                      step: "03",
                      title: "Inspect the Verdict & Scores",
                      desc: "Review the calibrated verdict (Authentic, Manipulated, or Inconclusive) alongside the overall Forensic Manipulation Score and Certainty.",
                      icon: ShieldCheck,
                    },
                    {
                      step: "04",
                      title: "Explore the Localization Heatmap",
                      desc: "Examine the spatial overlay and split-slider comparison to inspect exactly which pixel neighborhoods triggered forensic concern.",
                      icon: Search,
                    },
                    {
                      step: "05",
                      title: "Review Forensic Evidence Breakdown",
                      desc: "Evaluate individual evidence bar metrics to understand whether compression, noise, frequency, or statistical gradients were anomalous.",
                      icon: BarChart2,
                    },
                    {
                      step: "06",
                      title: "Read the AI Forensic Explanation",
                      desc: "Read a plain-language synthesis summarizing the key forensic indicators and why the system reached its analytical conclusion.",
                      icon: MessageSquareQuote,
                    },
                    {
                      step: "07",
                      title: "Generate Report & Save to History",
                      desc: "Export an immutable, publication-ready PDF audit report and revisit your complete analysis record anytime in History.",
                      icon: FileText,
                    },
                    {
                      step: "08",
                      title: "Submit Feedback",
                      desc: "Provide feedback directly on analysis accuracy to help audit and refine model diagnostics over time.",
                      icon: CheckCircle2,
                    },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={s.step}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-200 dark:hover:border-blue-700/60 hover:shadow-xs transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-[#1a7fc4] dark:text-[#5bb8f5]">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-mono font-bold text-gray-400 dark:text-slate-500">
                            STEP {s.step}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{s.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 2. UNDERSTANDING RESULTS                             */}
              {/* ---------------------------------------------------- */}
              <section id="understanding-results" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Analytical Terminology</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    2. Understanding PIXENTRA Results
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
                  PIXENTRA clearly separates calibrated statistical classifier probabilities from fused forensic indicators and spatial localization evidence.
                </p>

                {/* Verdicts Explained */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">The Three Forensic Verdicts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-50/40 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authentic</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                        The image exhibits consistent noise residuals, uniform compression grids, and natural frequency decay with minimal or zero localized spatial anomalies.
                      </p>
                    </div>

                    <div className="bg-rose-50/40 dark:bg-rose-950/30 rounded-2xl p-5 border border-rose-200/60 dark:border-rose-800/60 space-y-2">
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Manipulated</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                        Elevated forensic risk combined with spatial anomaly clusters, frequency interpolation peaks, or differential compression artifacts indicating tampering.
                      </p>
                    </div>

                    <div className="bg-amber-50/40 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-200/60 dark:border-amber-800/60 space-y-2">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                        <HelpCircle className="w-4 h-4" />
                        <span>Inconclusive</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                        Forensic channels conflict (e.g., optical bokeh inducing noise variance without compression tampering). Signals that manual expert review is recommended.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics Definitions Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                  <div className="px-5 py-3.5 bg-gray-50/70 dark:bg-slate-800/70 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                      Core Metrics &amp; Diagnostic Indicators
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-slate-400">0% – 100% Normalized Scale</span>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-slate-800 text-xs sm:text-sm">
                    {[
                      {
                        name: "Calibrated Classifier Probability",
                        desc: "The mathematically calibrated probability output of the image-level neural classifier (distinguishing manipulation vs. authenticity likelihood).",
                        category: "Statistical Calibration",
                      },
                      {
                        name: "Forensic Manipulation / Authenticity Score",
                        desc: "Composite diagnostic indicators synthesizing classifier probability with spatial anomaly area and multi-evidence channel convergence.",
                        category: "Fused Forensic Score",
                      },
                      {
                        name: "Prediction Certainty",
                        desc: "Confidence margin derived from the classifier's distance to the decision boundary, reflecting prediction stability.",
                        category: "Model Certainty",
                      },
                      {
                        name: "Forged Area / Localized Anomaly Area",
                        desc: "Percentage of total image pixels flagged as anomalous by the spatial localization mask at the validated 0.38 operating threshold.",
                        category: "Spatial Quantification",
                      },
                      {
                        name: "Localization Heatmap",
                        desc: "Continuous JET spatial map displaying pixel anomaly intensities (red/orange = high anomaly; blue/cyan = baseline consistency).",
                        category: "Visual Evidence",
                      },
                      {
                        name: "Evidence Channel Breakdown",
                        desc: "Individual modality metrics for Compression (ELA), Frequency, Noise Residuals, Local Statistics, and Metadata.",
                        category: "Multi-Evidence Breakdown",
                      },
                      {
                        name: "AI Forensic Explanation",
                        desc: "Structured natural language summary detailing why specific evidence streams triggered forensic flags.",
                        category: "XAI Synthesis",
                      },
                    ].map((m) => (
                      <div key={m.name} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5 max-w-xl">
                          <p className="font-semibold text-gray-900 dark:text-white">{m.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
                        </div>
                        <span className="inline-block self-start sm:self-center px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] rounded-lg text-[11px] font-medium font-mono whitespace-nowrap">
                          {m.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Conceptual Distinction Banner */}
                <div className="p-4 sm:p-5 bg-blue-50/70 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-700 rounded-2xl flex items-start gap-3.5">
                  <Info className="w-5 h-5 text-[#1a7fc4] dark:text-[#5bb8f5] shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      Important Distinction: Scores vs. Probabilities vs. Spatial Evidence
                    </p>
                    <p>
                      <strong>1. Calibrated Classifier Probability:</strong> The statistical likelihood produced by the image-level classifier.<br />
                      <strong>2. Final Forensic Scores:</strong> A fused, multi-channel index that incorporates evidence convergence.<br />
                      <strong>3. Localized Anomaly Evidence:</strong> Spatial pixel-level detections. A fused score is NOT a calibrated probability, and localized anomaly signals are supporting evidence rather than standalone proof of malice.
                    </p>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 3. USING THE ANALYSIS PAGE                           */}
              {/* ---------------------------------------------------- */}
              <section id="analysis-workspace" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Interactive Workspace</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    3. Using the Analysis Page
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                      <UploadCloud className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                      <span>Supported Image Formats</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                      Upload JPEG, JPG, PNG, or WebP files up to 10 MB. High-resolution photographs, document scans, and exported digital graphics are supported.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                      <Split className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                      <span>Split Slider &amp; Side-by-Side Comparison</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                      Use the interactive split slider to compare the original image directly with the localized JET anomaly heatmap overlay in real time.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                      <Layers className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                      <span>Evidence Breakdown Inspection</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                      Inspect individual modality bars to examine whether compression, frequency, noise residuals, or local statistics contributed to the verdict.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                      <RefreshCw className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                      <span>Analyze Another Image</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                      Seamlessly reset the upload workspace with a single click to analyze additional images while preserving your past evaluations in History.
                    </p>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 4. UNDERSTANDING LOCALIZATION                        */}
              {/* ---------------------------------------------------- */}
              <section id="localization-guide" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Spatial Interpretation</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    4. Understanding Localization Heatmaps
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
                  The localization heatmap is an intuitive visual overlay that indicates where physical and statistical forensic signals deviate from the expected baseline.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">What the Heatmap Shows</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      Continuous predictions are colorized using a JET colormap: warm regions (red, orange, yellow) indicate high anomaly concentration; cool regions (blue, cyan) indicate baseline consistency.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Localized Anomaly vs. Forged Pixels</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      A localized anomaly indicates statistical inconsistency. While spliced or cloned objects create strong anomaly clusters, benign factors like extreme bokeh or high-ISO noise reduction can also induce localized variance.
                    </p>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 5. REPORTS & HISTORY                                 */}
              {/* ---------------------------------------------------- */}
              <section id="reports-history" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <History className="w-3.5 h-3.5" />
                    <span>Audit Trail &amp; Export</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    5. Forensic Reports &amp; Analysis History
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
                  Every analysis you perform while signed in is saved in your private account history for permanent auditing and review.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                      <FileText className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                      <span>View Full Report</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      Open a clean, formatted web report displaying all evidence channels, localization maps, metadata, and natural-language summaries.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                      <Download className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                      <span>Download PDF</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      Export an immutable, publication-ready PDF document containing cryptographic analysis IDs for legal and investigative archiving.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                      <Share2 className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                      <span>Share Analysis</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      Share the unique analysis ID with colleagues or clients so they can review the identical forensic evidence record.
                    </p>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 6. LEARNING RESOURCES (External links open in new tab) */}
              {/* ---------------------------------------------------- */}
              <section id="resources" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Curated External Resources</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    6. Learn More: Forensic Science Resources
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
                  Deepen your understanding of digital image forensics, noise residual extraction, Error Level Analysis, and contrastive representation learning with these reputable external resources.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {externalResources.map((res) => (
                    <a
                      key={res.title}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-2xs hover:border-[#1a7fc4] dark:hover:border-[#5bb8f5] hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#1a7fc4] dark:text-[#5bb8f5] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {res.category}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 dark:text-slate-400">
                            {res.type}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#1a7fc4] dark:group-hover:text-[#5bb8f5] transition-colors leading-snug">
                          {res.title}
                        </h3>
                        <p className="text-xs font-medium text-gray-600 dark:text-slate-300">
                          {res.author}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {res.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5]">
                        <span>Open Resource</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* 7. PRACTICAL FAQ                                     */}
              {/* ---------------------------------------------------- */}
              <section id="faq" className="scroll-mt-28 space-y-6">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a7fc4] dark:text-[#5bb8f5] uppercase tracking-wider mb-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Frequently Asked Questions</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    7. Practical FAQ
                  </h2>
                </div>

                <div className="space-y-3.5">
                  {docFaqs.map((faq, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-2"
                    >
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {faq.q}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Callout Footer Banner */}
              <div className="p-8 bg-gradient-to-r from-blue-50/90 via-blue-50/50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 rounded-3xl border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Ready to analyze an image?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                    Test an image with PIXENTRA&apos;s explainable forensic pipeline today.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/research"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:border-[#1a7fc4] dark:hover:border-[#5bb8f5] hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] transition-colors whitespace-nowrap shadow-2xs"
                  >
                    View Research
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
