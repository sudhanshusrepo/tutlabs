"use client";

/**
 * PDF Generation Utility utilizing html2pdf.js
 * Scalable approach mapping directly to the DOM to avoid duplication.
 */

export async function generatePDF(elementId: string): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("PDF generation must run in the browser");
  }

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Need to dynamically import html2pdf to prevent Next.js SSR crashes
  const html2pdfModule = await import("html2pdf.js");
  const html2pdf = html2pdfModule.default;

  // Optimized configuration for A4, high resolution canvas scaling, and proper multi-page behavior.
  const opt = {
    margin:       0, // Real-time preview holds its own internal padding equivalent to the resume
    filename:     'resume.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2,           // 2x scale for Retina crispness 
      useCORS: true,      // Ensures foreign images (e.g. portfolio screenshots) don't crash the canvas
      logging: false,
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    // Page break mapping avoids splitting DOM nodes halfway across pages
    pagebreak:    { mode: ['css', 'avoid-all'] }
  };

  // Process the element and output standard Blob
  const pdfBlob = await html2pdf()
    .from(element)
    .set(opt)
    .output('blob');

  return pdfBlob;
}

export function downloadPDF(blob: Blob, filename: string): void {
  // Use classic Blob saving approach
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
