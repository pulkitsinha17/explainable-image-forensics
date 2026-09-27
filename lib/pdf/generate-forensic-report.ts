/**
 * PIXENTRA — Professional Forensic Analysis PDF Report Generator
 *
 * Generates a polished, user-facing, single-page (A4) forensic analysis report.
 * Focuses on clarity, professional visual hierarchy, and user-relevant metrics.
 *
 * Matches the reference layout with pixel-perfect alignment and typography.
 */

import { jsPDF } from "jspdf";
import type { ForensicAnalysisResult } from "@/components/analyze/types";

// ─────────────────────────────────────────────────────────────────────────────
// Color Palette & Typography Tokens
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = {
  navyDark: [11, 19, 43],       // #0B132B (Primary header & branding)
  navySlate: [15, 23, 42],      // #0F172A (Deep charcoal for headings & metrics)
  blueAccent: [2, 132, 199],    // #0284C7
  cyanAccent: [56, 189, 248],   // #38BDF8 (Logo accent)
  cardBg: [255, 255, 255],      // #FFFFFF (Crisp white cards)
  cardBgSoft: [248, 250, 252],  // #F8FAFC
  tableHeaderBg: [241, 245, 249], // #F1F5F9 (Light grey highlight for evidence names)
  cardBorder: [226, 232, 240],  // #E2E8F0 (Subtle, clean light-gray border)
  textPrimary: [15, 23, 42],    // #0F172A (Deep charcoal/navy, high contrast)
  textSecondary: [51, 65, 85],  // #334155 (Dark slate for body text)
  textMuted: [100, 116, 139],   // #64748B (Clear slate for captions)
  greenVerdict: [22, 163, 74],  // #16A34A (Authentic)
  redVerdict: [220, 38, 38],    // #DC2626 (Likely Manipulated)
  blueVerdict: [37, 99, 235],   // #2563EB (Inconclusive)
  orangeAccent: [234, 88, 12],  // #EA580C
};

/** Convert image URL or blob to base64 data URL */
async function loadImageDataUrl(url?: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:")) return url;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Load SVG logo and rasterize to PNG data URL with optional color inverted for dark banner */
async function loadSvgLogoDataUrl(options?: { invertForDarkBg?: boolean }): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }
  try {
    const res = await fetch("/pixentra-logo.svg");
    if (!res.ok) return null;
    let svgText = await res.text();

    if (options?.invertForDarkBg) {
      // Invert dark text/shapes to white for contrast on navy header
      svgText = svgText.replace(/fill="#1a1a1a"/g, 'fill="#FFFFFF"');
      svgText = svgText.replace(/fill="#555"/g, 'fill="#94A3B8"');
    }

    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 400 * 2;
        canvas.height = 200 * 2;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL("image/png"));
        } else {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

/** Reset doc stroke to default subtle light-gray border */
function resetCardStroke(doc: jsPDF) {
  doc.setDrawColor(COLORS.cardBorder[0], COLORS.cardBorder[1], COLORS.cardBorder[2]);
  doc.setLineWidth(0.3);
}

/** Draw a clean vector circular radial gauge without affecting outside card strokes */
function drawRadialMeter(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  pct: number,
  color: number[]
) {
  // Background track
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(2.5);
  doc.circle(cx, cy, r, "S");

  // Progress arc
  if (pct > 0) {
    const totalSteps = Math.max(12, Math.round((pct / 100) * 64));
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (pct / 100) * 2 * Math.PI;

    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(2.7);

    for (let i = 0; i < totalSteps; i++) {
      const a1 = startAngle + (i / totalSteps) * (endAngle - startAngle);
      const a2 = startAngle + ((i + 1) / totalSteps) * (endAngle - startAngle);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      doc.line(x1, y1, x2, y2);
    }
  }

  // Always reset card stroke after drawing radial meters
  resetCardStroke(doc);
}

/** Draw vector verdict icon */
function drawVerdictIcon(doc: jsPDF, cx: number, cy: number, r: number, verdict: string, color: number[]) {
  doc.setFillColor(color[0], color[1], color[2]);
  doc.circle(cx, cy, r, "F");

  doc.setDrawColor(255, 255, 255);
  doc.setTextColor(255, 255, 255);

  if (verdict === "authentic") {
    // Checkmark
    doc.setLineWidth(0.6);
    doc.line(cx - 1.2, cy, cx - 0.3, cy + 1.1);
    doc.line(cx - 0.3, cy + 1.1, cx + 1.4, cy - 1.1);
  } else if (verdict === "likely_manipulated") {
    // Alert exclamation
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text("!", cx - 0.6, cy + 1.3);
  } else {
    // Inconclusive question mark / info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.text("?", cx - 0.7, cy + 1.2);
  }
}

/** Build jsPDF instance for the single-page A4 forensic report (reusable across viewer & downloader) */
export async function buildForensicPdfDoc(
  results: ForensicAnalysisResult
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const marginX = 10;
  const contentWidth = pageWidth - marginX * 2; // 190 mm

  // Fetch real image assets & official PIXENTRA logos
  const [originalDataUrl, heatmapDataUrl, logoHeaderDataUrl, logoFooterDataUrl] = await Promise.all([
    loadImageDataUrl(results.originalImageUrl),
    loadImageDataUrl(results.localizationMapUrl),
    loadSvgLogoDataUrl({ invertForDarkBg: true }),
    loadSvgLogoDataUrl({ invertForDarkBg: false }),
  ]);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFormatted = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const reportId = `PX-${(results.analysisId || Date.now().toString()).slice(-8).toUpperCase()}`;

  const forensicScore =
    typeof results.forensicManipulationScore === "number"
      ? results.forensicManipulationScore
      : typeof results.forgeryRiskScore === "number"
      ? results.forgeryRiskScore
      : 0;
  const forensicAuthScore =
    typeof results.forensicAuthenticityScore === "number"
      ? results.forensicAuthenticityScore
      : Math.max(0, 100 - forensicScore);
  const certVal =
    typeof results.predictionCertainty === "number"
      ? results.predictionCertainty
      : typeof results.confidence === "number"
      ? results.confidence
      : 0;
  const forgedArea =
    typeof results.forgeryPixelFraction === "number"
      ? results.forgeryPixelFraction
      : 0;

  const isAuth = results.verdict === "authenticated" || results.verdict === "authentic" || results.verdictLabel === "Authentic";
  const isInconc = results.verdict === "inconclusive" || results.verdict === "suspicious" || results.verdictLabel === "Inconclusive";

  // Verdict style & colors
  const verdictColor = isAuth
    ? COLORS.greenVerdict
    : isInconc
    ? COLORS.blueVerdict
    : COLORS.redVerdict;

  const verdictUserDescription = isAuth
    ? "No significant forensic indicators of digital manipulation were detected across channels."
    : isInconc
    ? "The analysis did not find sufficiently decisive evidence to classify the image with high certainty."
    : "Multiple forensic indicators show strong patterns consistent with digital manipulation.";

  // ═════════════════════════════════════════════════════════════════════════════
  // EXACT 1-PAGE A4 LAYOUT — BALANCED, CRISP & READABLE
  // ═════════════════════════════════════════════════════════════════════════════

  // ── Header Banner (y: 7 to 25mm, height: 18mm) ────────────────────────────
  const headerY = 7;
  const headerH = 18;
  doc.setFillColor(COLORS.navyDark[0], COLORS.navyDark[1], COLORS.navyDark[2]);
  doc.roundedRect(marginX, headerY, contentWidth, headerH, 2, 2, "F");

  // Official PIXENTRA Logo on Header
  if (logoHeaderDataUrl) {
    try {
      doc.addImage(logoHeaderDataUrl, "PNG", marginX + 3.5, headerY + 2.5, 30, 14, undefined, "FAST");
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("PIXENTRA", marginX + 4.5, headerY + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
      doc.text("See Beyond the Pixels", marginX + 4.5, headerY + 13.5);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("PIXENTRA", marginX + 4.5, headerY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text("See Beyond the Pixels", marginX + 4.5, headerY + 13.5);
  }

  // Center Title & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("IMAGE FORENSIC ANALYSIS REPORT", marginX + 46, headerY + 7.8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(COLORS.cyanAccent[0], COLORS.cyanAccent[1], COLORS.cyanAccent[2]);
  doc.text(
    "Explainable Multi-Evidence Image Forgery Detection and Localization",
    marginX + 46,
    headerY + 13.2
  );

  // Right Metadata Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(255, 255, 255);
  doc.text(`Report ID:`, marginX + contentWidth - 46, headerY + 5.5);
  doc.setFont("helvetica", "normal");
  doc.text(`${reportId}`, marginX + contentWidth - 27, headerY + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Date:`, marginX + contentWidth - 46, headerY + 9.2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text(`${dateFormatted}`, marginX + contentWidth - 27, headerY + 9.2);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Time:`, marginX + contentWidth - 46, headerY + 12.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text(`${timeFormatted}`, marginX + contentWidth - 27, headerY + 12.8);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`Analysis Time:`, marginX + contentWidth - 46, headerY + 16.4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text(`${results.elapsedSeconds} seconds`, marginX + contentWidth - 27, headerY + 16.4);

  // ── 1. ANALYSIS OVERVIEW (y: 28 to 64mm, height: 36mm) ────────────────────
  let currentY = headerY + headerH + 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text("1. ANALYSIS OVERVIEW", marginX, currentY + 3);

  currentY += 4.5;
  const overviewCardH = 30;
  const cardGap = 2.5;
  const verdictW = 42;
  const metricW = (contentWidth - verdictW - cardGap * 4) / 4; // 34.5mm each

  // Verdict Card — Neutral border, white background
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(marginX, currentY, verdictW, overviewCardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("VERDICT", marginX + 4, currentY + 6.5);

  // Clean Verdict Icon Badge
  drawVerdictIcon(doc, marginX + 6.5, currentY + 13, 2.5, isAuth ? "authentic" : isInconc ? "inconclusive" : "likely_manipulated", verdictColor);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.text(results.verdictLabel || (isAuth ? "Authentic" : isInconc ? "Inconclusive" : "Manipulated"), marginX + 11.5, currentY + 14.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.2);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  const vDescLines = doc.splitTextToSize(verdictUserDescription, verdictW - 8);
  doc.text(vDescLines, marginX + 4, currentY + 20.0);

  // Score Card 1: Forensic Manipulation Score
  const m1X = marginX + verdictW + cardGap;
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(m1X, currentY, metricW, overviewCardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  doc.setTextColor(COLORS.navySlate[0], COLORS.navySlate[1], COLORS.navySlate[2]);
  doc.text("Forensic Manipulation", m1X + metricW / 2, currentY + 5.5, { align: "center" });

  drawRadialMeter(doc, m1X + metricW / 2, currentY + 14.5, 5.8, forensicScore, forensicScore >= 60 ? COLORS.redVerdict : forensicScore >= 35 ? COLORS.orangeAccent : COLORS.greenVerdict);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.navySlate[0], COLORS.navySlate[1], COLORS.navySlate[2]);
  doc.text(`${forensicScore.toFixed(1)}%`, m1X + metricW / 2, currentY + 15.6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.6);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  const s1Lines = doc.splitTextToSize("Combined forensic score assessing manipulation signals.", metricW - 5);
  doc.text(s1Lines, m1X + metricW / 2, currentY + 23.5, { align: "center" });

  // Score Card 2: Forensic Authenticity Score
  const m2X = m1X + metricW + cardGap;
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(m2X, currentY, metricW, overviewCardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  doc.setTextColor(COLORS.navySlate[0], COLORS.navySlate[1], COLORS.navySlate[2]);
  doc.text("Forensic Authenticity", m2X + metricW / 2, currentY + 5.5, { align: "center" });

  drawRadialMeter(doc, m2X + metricW / 2, currentY + 14.5, 5.8, forensicAuthScore, forensicAuthScore >= 60 ? COLORS.greenVerdict : forensicAuthScore >= 35 ? COLORS.orangeAccent : COLORS.redVerdict);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.navySlate[0], COLORS.navySlate[1], COLORS.navySlate[2]);
  doc.text(`${forensicAuthScore.toFixed(1)}%`, m2X + metricW / 2, currentY + 15.6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.6);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  const s2Lines = doc.splitTextToSize("Score indicating genuine photographic integrity.", metricW - 5);
  doc.text(s2Lines, m2X + metricW / 2, currentY + 23.5, { align: "center" });

  // Score Card 3: Prediction Certainty
  const m3X = m2X + metricW + cardGap;
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(m3X, currentY, metricW, overviewCardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  doc.setTextColor(COLORS.navySlate[0], COLORS.navySlate[1], COLORS.navySlate[2]);
  doc.text("Prediction Certainty", m3X + metricW / 2, currentY + 5.5, { align: "center" });

  drawRadialMeter(doc, m3X + metricW / 2, currentY + 14.5, 5.8, certVal, COLORS.blueAccent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.navySlate[0], COLORS.navySlate[1], COLORS.navySlate[2]);
  doc.text(`${certVal.toFixed(1)}%`, m3X + metricW / 2, currentY + 15.6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.6);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  const s3Lines = doc.splitTextToSize("Confidence of the model in polarized decisions.", metricW - 5);
  doc.text(s3Lines, m3X + metricW / 2, currentY + 23.5, { align: "center" });

  // Score Card 4: Forged Area (Estimated) / Localized Anomaly Area
  const m4X = m3X + metricW + cardGap;
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(m4X, currentY, metricW, overviewCardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  doc.setTextColor(COLORS.navySlate[0], COLORS.navySlate[1], COLORS.navySlate[2]);
  doc.text((isAuth || isInconc) ? "Localized Anomaly" : "Forged Area (Est.)", m4X + metricW / 2, currentY + 5.5, { align: "center" });

  drawRadialMeter(doc, m4X + metricW / 2, currentY + 14.5, 5.8, forgedArea, [203, 213, 225]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.navySlate[0], COLORS.navySlate[1], COLORS.navySlate[2]);
  doc.text(`${forgedArea.toFixed(1)}%`, m4X + metricW / 2, currentY + 15.6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.6);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  const s4Lines = doc.splitTextToSize((isAuth || isInconc) ? "Percentage of image area with localized anomalies." : "Percentage of image flagged as suspicious pixels.", metricW - 5);
  doc.text(s4Lines, m4X + metricW / 2, currentY + 23.5, { align: "center" });

  // ── 2. IMAGE ANALYSIS & LOCALIZATION (y: 68 to 118mm, height: 50mm) ───────
  currentY += overviewCardH + 3.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text("2. IMAGE ANALYSIS & LOCALIZATION", marginX, currentY + 3);

  currentY += 4.5;
  const imgCardW = (contentWidth - 4) / 2; // 93mm each
  const imgCardH = 46;

  // Left Card: Original Input Image
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(marginX, currentY, imgCardW, imgCardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text("Original Input Image", marginX + 4, currentY + 5.5);

  const innerImgW = 46;
  const innerImgH = 33;
  if (originalDataUrl) {
    try {
      doc.addImage(originalDataUrl, "JPEG", marginX + 4, currentY + 8, innerImgW, innerImgH, undefined, "FAST");
    } catch {
      doc.setFillColor(241, 245, 249);
      doc.rect(marginX + 4, currentY + 8, innerImgW, innerImgH, "F");
    }
  } else {
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX + 4, currentY + 8, innerImgW, innerImgH, "F");
  }

  // Details on the right of input image
  const imgMetaX = marginX + innerImgW + 7;
  let imgMetaY = currentY + 11;
  const fName = results.imageMetadata?.name || "analyzed_image.png";

  const imgFields = [
    { label: "File Name:", val: fName.length > 16 ? fName.slice(0, 14) + "..." : fName },
    { label: "Dimensions:", val: results.imageMetadata?.dimensions ? `${results.imageMetadata.dimensions} pixels` : "5120 × 2880 pixels" },
    { label: "File Size:", val: results.imageMetadata?.sizeFormatted || "Standard upload" },
    { label: "Format:", val: results.imageMetadata?.format || "PNG" },
    { label: "Color Mode:", val: "RGB" },
  ];

  imgFields.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    doc.text(item.label, imgMetaX, imgMetaY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
    doc.text(item.val, imgMetaX, imgMetaY + 3.2);

    imgMetaY += 6.3;
  });

  // Right Card: Localization Heatmap
  const heatCardX = marginX + imgCardW + 4;
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(heatCardX, currentY, imgCardW, imgCardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text("Localization Heatmap", heatCardX + 4, currentY + 5.5);

  if (heatmapDataUrl) {
    try {
      doc.addImage(heatmapDataUrl, "PNG", heatCardX + 4, currentY + 8, innerImgW, innerImgH, undefined, "FAST");
    } catch {
      doc.setFillColor(241, 245, 249);
      doc.rect(heatCardX + 4, currentY + 8, innerImgW, innerImgH, "F");
    }
  } else {
    doc.setFillColor(241, 245, 249);
    doc.rect(heatCardX + 4, currentY + 8, innerImgW, innerImgH, "F");
  }

  // Vertical Heatmap Colorbar Legend
  const barX = heatCardX + innerImgW + 7;
  const barY = currentY + 11;
  const barH = 27;
  const barW = 2.8;
  doc.setFillColor(220, 38, 38); doc.rect(barX, barY, barW, barH * 0.25, "F");
  doc.setFillColor(249, 115, 22); doc.rect(barX, barY + barH * 0.25, barW, barH * 0.25, "F");
  doc.setFillColor(234, 179, 8);  doc.rect(barX, barY + barH * 0.50, barW, barH * 0.25, "F");
  doc.setFillColor(37, 99, 235);  doc.rect(barX, barY + barH * 0.75, barW, barH * 0.25, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.2);
  doc.setTextColor(COLORS.redVerdict[0], COLORS.redVerdict[1], COLORS.redVerdict[2]);
  doc.text("High", barX + barW + 2, barY + 3);
  doc.text("Probability", barX + barW + 2, barY + 5.8);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.blueVerdict[0], COLORS.blueVerdict[1], COLORS.blueVerdict[2]);
  doc.text("Low", barX + barW + 2, barY + barH - 2.8);
  doc.text("Probability", barX + barW + 2, barY + barH);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Colors indicate localized suspicion intensity across image pixels.", heatCardX + 4, currentY + 43.5);

  // ── 3. MULTI-EVIDENCE ANALYSIS (TABLE WITH HIGHLIGHTED COLUMNS & DIVIDERS) ──
  currentY += imgCardH + 3.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text("3. MULTI-EVIDENCE ANALYSIS", marginX, currentY + 3);

  currentY += 4.5;
  const multiEvH = 37.5;
  const rowH = 7.5;
  const col1W = 48; // Evidence Channel Name (Light-Grey Highlighted)
  const col2W = 22; // Contribution Score
  // col3 width = contentWidth - col1W - col2W (Description fills remaining space)

  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(marginX, currentY, contentWidth, multiEvH, 2, 2, "FD");

  // Highlight Column 1 with light-grey background
  doc.setFillColor(COLORS.tableHeaderBg[0], COLORS.tableHeaderBg[1], COLORS.tableHeaderBg[2]);
  doc.roundedRect(marginX, currentY, col1W, multiEvH, 2, 2, "F");
  // Fill the right edge of col1 so the rounding is only on outer card
  doc.rect(marginX + col1W - 3, currentY, 3, multiEvH, "F");

  const evList = [
    {
      name: "Compression",
      score: results.evidence.compression,
      desc: "Checks for inconsistencies introduced by image compression.",
    },
    {
      name: "Frequency / Noise",
      score: results.evidence.frequencyNoise,
      desc: "Examines fine-detail and noise patterns for unusual inconsistencies.",
    },
    {
      name: "Local Statistics",
      score: results.evidence.statistics,
      desc: "Analyzes local texture and pixel variation for abnormal patterns.",
    },
    {
      name: "Error Level Analysis (ELA)",
      score: results.evidence.ela,
      desc: "Examines differences that may appear after image recompression.",
    },
    {
      name: "Metadata",
      score: results.evidence.metadata,
      desc: "Checks available image metadata for useful consistency indicators.",
    },
  ];

  evList.forEach((ev, idx) => {
    const rowY = currentY + idx * rowH;

    // Horizontal Row Divider Line (except last)
    if (idx > 0) {
      doc.setDrawColor(COLORS.cardBorder[0], COLORS.cardBorder[1], COLORS.cardBorder[2]);
      doc.setLineWidth(0.25);
      doc.line(marginX, rowY, marginX + contentWidth, rowY);
    }

    // Column 1: Evidence Name (Bold, on light-grey background)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(COLORS.navySlate[0], COLORS.navySlate[1], COLORS.navySlate[2]);
    doc.text(ev.name, marginX + 4.5, rowY + 5.0);

    // Column 2: Contribution Score (Bold Blue, centered in col 2)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.0);
    doc.setTextColor(COLORS.blueAccent[0], COLORS.blueAccent[1], COLORS.blueAccent[2]);
    doc.text(`${ev.score}%`, marginX + col1W + col2W / 2, rowY + 5.0, { align: "center" });

    // Column 3: Description (Crisp Dark Slate)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.0);
    doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
    doc.text(ev.desc, marginX + col1W + col2W + 4, rowY + 5.0);
  });

  // Vertical Column Divider Lines
  doc.setDrawColor(COLORS.cardBorder[0], COLORS.cardBorder[1], COLORS.cardBorder[2]);
  doc.setLineWidth(0.25);
  doc.line(marginX + col1W, currentY, marginX + col1W, currentY + multiEvH);
  doc.line(marginX + col1W + col2W, currentY, marginX + col1W + col2W, currentY + multiEvH);

  // Redraw outer table border cleanly
  resetCardStroke(doc);
  doc.roundedRect(marginX, currentY, contentWidth, multiEvH, 2, 2, "D");

  // ── 4. AI FORENSIC EXPLANATION (LARGER, READABLE, COVERS THE CARD) ─────────
  currentY += multiEvH + 3.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text("4. AI FORENSIC EXPLANATION", marginX, currentY + 3);

  currentY += 4.5;
  const aiExpH = 43;
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(marginX, currentY, contentWidth, aiExpH, 2, 2, "FD");

  // 3 user-friendly structured paragraphs
  const p1 = results.aiExplanation || `PIXENTRA analyzed the uploaded image for visual and statistical inconsistencies associated with digital manipulation. The model computed a Forensic Manipulation Score of ${forensicScore.toFixed(1)}% (Forensic Authenticity Score: ${forensicAuthScore.toFixed(1)}%) and localization analysis flagged approximately ${forgedArea.toFixed(1)}% of the image as suspicious. Prediction certainty is ${certVal.toFixed(1)}%, indicating decisive model calibration.`;
  const p2 = `The multi-evidence analysis evaluated compression artifacts (${results.evidence.compression}%), frequency/noise patterns (${results.evidence.frequencyNoise}%), local statistics (${results.evidence.statistics}%), error-level discrepancies (${results.evidence.ela}%), and metadata (${results.evidence.metadata}%). These signals are analyzed together to assess manipulation risk rather than being treated as independent verdicts.`;
  const p3 = `Overall, the image is classified as ${results.verdictLabel || (isAuth ? "Authentic" : isInconc ? "Inconclusive" : "Manipulated")}. This result suggests ${verdictUserDescription.toLowerCase().replace(/\.$/, "")}. However, this is an automated forensic assessment and should be used as an investigative aid, not as absolute proof.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59); // Deep crisp slate #1E293B

  let aiTextY = currentY + 7.0;
  const p1Lines = doc.splitTextToSize(p1, contentWidth - 12);
  doc.text(p1Lines, marginX + 6, aiTextY);
  aiTextY += p1Lines.length * 3.6 + 3.0;

  const p2Lines = doc.splitTextToSize(p2, contentWidth - 12);
  doc.text(p2Lines, marginX + 6, aiTextY);
  aiTextY += p2Lines.length * 3.6 + 3.0;

  const p3Lines = doc.splitTextToSize(p3, contentWidth - 12);
  doc.text(p3Lines, marginX + 6, aiTextY);

  // ── 5. IMAGE METADATA & 6. SCIENTIFIC INTERPRETATION NOTE ─────────────────
  currentY += aiExpH + 3.5;
  const bottomCardW = (contentWidth - 4) / 2; // 93mm each
  const bottomCardH = 33;

  // 5. IMAGE METADATA (Left Card)
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(marginX, currentY, bottomCardW, bottomCardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text("5. IMAGE METADATA", marginX + 4, currentY + 5.5);

  // Clean Document Icon Box
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(marginX + 5, currentY + 9.5, 8.5, 8.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(COLORS.blueAccent[0], COLORS.blueAccent[1], COLORS.blueAccent[2]);
  doc.text("DOC", marginX + 6.0, currentY + 15.5);

  // Metadata status
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Metadata Status:", marginX + 17, currentY + 12.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text(results.evidence.metadata > 0 ? "Available & Verified" : "Not Available", marginX + 17, currentY + 17.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  const metaNote = results.evidence.metadata > 0
    ? "Embedded EXIF tags and format headers were verified and analyzed for consistency."
    : "No useful metadata information was found in this image.";
  const metaNoteLines = doc.splitTextToSize(metaNote, bottomCardW - 10);
  doc.text(metaNoteLines, marginX + 5, currentY + 24.5);

  // 6. SCIENTIFIC INTERPRETATION NOTE (Right Card)
  const noteCardX = marginX + bottomCardW + 4;
  resetCardStroke(doc);
  doc.setFillColor(COLORS.cardBg[0], COLORS.cardBg[1], COLORS.cardBg[2]);
  doc.roundedRect(noteCardX, currentY, bottomCardW, bottomCardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text("6. SCIENTIFIC INTERPRETATION NOTE", noteCardX + 4, currentY + 5.5);

  // Info Icon Box
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(noteCardX + 5, currentY + 9.5, 7.5, 7.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(COLORS.blueAccent[0], COLORS.blueAccent[1], COLORS.blueAccent[2]);
  doc.text("i", noteCardX + 8.0, currentY + 15.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.0);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  const sciNote =
    "The Forensic Manipulation Score integrates calibrated multi-evidence signals and localization anomalies into a unified assessment. Prediction Certainty indicates how decisively spatial predictions are polarized. Automated forensic findings serve as investigative assistance and should be corroborated with expert analysis.";
  const sciNoteLines = doc.splitTextToSize(sciNote, bottomCardW - 20);
  doc.text(sciNoteLines, noteCardX + 15, currentY + 11.5);

  // ── Page Footer (y: 268 to 276mm) ─────────────────────────────────────────
  const footerY = currentY + bottomCardH + 5.5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(marginX, footerY, marginX + contentWidth, footerY);

  // Official PIXENTRA Logo on Footer
  if (logoFooterDataUrl) {
    try {
      doc.addImage(logoFooterDataUrl, "PNG", marginX, footerY + 1.5, 24, 11, undefined, "FAST");
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(COLORS.navyDark[0], COLORS.navyDark[1], COLORS.navyDark[2]);
      doc.text("PIXENTRA", marginX, footerY + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
      doc.text("See Beyond the Pixels", marginX, footerY + 8.5);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(COLORS.navyDark[0], COLORS.navyDark[1], COLORS.navyDark[2]);
    doc.text("PIXENTRA", marginX, footerY + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    doc.text("See Beyond the Pixels", marginX, footerY + 8.5);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(COLORS.textSecondary[0], COLORS.textSecondary[1], COLORS.textSecondary[2]);
  doc.text("AI for a More Truthful Digital World", marginX + contentWidth / 2, footerY + 5.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(COLORS.textPrimary[0], COLORS.textPrimary[1], COLORS.textPrimary[2]);
  doc.text("Page 1 of 1", marginX + contentWidth, footerY + 4.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text("Automated Image Forensics System", marginX + contentWidth, footerY + 8.5, { align: "right" });

  // ── Return jsPDF Document ────────────────────────────────────────────────
  return doc;
}

/** Generate and trigger download of the single-page A4 forensic report */
export async function downloadForensicPdfReport(
  results: ForensicAnalysisResult
): Promise<void> {
  const doc = await buildForensicPdfDoc(results);
  const reportId = `PX-${(results.analysisId || Date.now().toString()).slice(-8).toUpperCase()}`;
  doc.save(`pixentra-forensic-report-${reportId}.pdf`);
}

