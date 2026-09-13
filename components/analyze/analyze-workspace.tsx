"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopNavBar } from "./top-nav-bar";
import { ImageUpload } from "./image-upload";
import { AnalysisProgress } from "./analysis-progress";
import { AnalysisResults } from "./analysis-results";
import { FeedbackCard } from "./feedback-card";
import { HowItWorks } from "./how-it-works";
import { PrivacyCard } from "./privacy-card";
import type { SelectedImageData, ForensicAnalysisResult } from "./types";

interface AnalyzeWorkspaceProps {
  userInitial?: string;
  userDisplayName?: string;
}

export function AnalyzeWorkspace({
  userInitial = "P",
  userDisplayName = "Pulkit Sinha",
}: AnalyzeWorkspaceProps) {
  const [selectedImage, setSelectedImage] = useState<SelectedImageData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<
    "uploading" | "analyzing" | "generating" | "finishing"
  >("uploading");
  const [results, setResults] = useState<ForensicAnalysisResult | null>(null);

  // Set default sample image on initial load matching the reference screenshot
  useEffect(() => {
    setSelectedImage({
      previewUrl: "/images/mountain.png",
      name: "mountain-lake.jpg",
      sizeFormatted: "2.4 MB",
      dimensions: "4032 × 3024",
      format: "JPEG",
    });
  }, []);

  const handleStartAnalysis = () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStage("uploading");
    setResults(null);

    // Simulated multi-stage forensic analysis progression (UI demo state)
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);

          // Render UI results matching the reference design
          setResults({
            verdict: "likely_manipulated",
            verdictLabel: "Likely Manipulated",
            verdictDescription: "This image shows strong signs of digital manipulation.",
            forgeryRiskScore: 82,
            evidence: {
              spatial: 87,
              noise: 71,
              frequency: 79,
              ela: 83,
              statistics: 68,
              metadata: 32,
            },
            aiExplanation:
              "The image shows inconsistencies in noise patterns and frequency components, particularly in the sky and mountain regions. The error level analysis (ELA) also highlights regions that are likely to have been manipulated. These findings suggest a high probability of digital manipulation.",
            originalImageUrl: selectedImage.previewUrl,
            localizationMapUrl: "", // Uses the procedural thermal heatmap shader in slider
            elapsedSeconds: 24,
          });

          return 100;
        }

        if (next < 25) {
          setCurrentStage("uploading");
        } else if (next < 65) {
          setCurrentStage("analyzing");
        } else if (next < 90) {
          setCurrentStage("generating");
        } else {
          setCurrentStage("finishing");
        }

        return next;
      });
    }, 100);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setIsAnalyzing(false);
    setProgress(0);
    setResults(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Utility Nav Bar */}
      <TopNavBar userInitial={userInitial} userDisplayName={userDisplayName} />

      {/* Page Header */}
      <div className="space-y-1.5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1a7fc4] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Analyze an Image
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-3xl">
          Upload an image to perform deep multi-evidence forensic analysis and uncover the truth behind its pixels.
        </p>
      </div>

      {/* 1. Upload Card & Selected Image Preview */}
      <ImageUpload
        onImageSelected={(img) => {
          setSelectedImage(img);
          setResults(null);
        }}
        selectedImage={selectedImage}
        onClearImage={handleClearImage}
        onStartAnalysis={handleStartAnalysis}
        isAnalyzing={isAnalyzing}
      />

      {/* 2. Analysis Progress State */}
      {isAnalyzing && (
        <AnalysisProgress
          progress={progress}
          currentStage={currentStage}
        />
      )}

      {/* 3. Analysis Results State */}
      {results && !isAnalyzing && (
        <AnalysisResults results={results} />
      )}

      {/* 4. Feedback Section (Visible when results are shown) */}
      {results && !isAnalyzing && (
        <FeedbackCard />
      )}

      {/* 5. How PIXENTRA Works */}
      <HowItWorks />

      {/* 6. Privacy Reassurance Banner */}
      <PrivacyCard />
    </div>
  );
}
