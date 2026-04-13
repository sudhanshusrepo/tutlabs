"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useResume } from "@/lib/resumeContext";
import { generatePDF, downloadPDF } from "@/lib/pdf";
import { toast } from "sonner";
import { DownloadCounter } from "./DownloadCounter";
import { RateLimitModal } from "../auth/RateLimitModal";

const MAX_DOWNLOADS_PER_DAY = 3;

export function DownloadButton() {
  const { data } = useResume();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Rate Limiting States integrating backend logic natively
  const [remaining, setRemaining] = useState(MAX_DOWNLOADS_PER_DAY);
  const [isLimitVerifying, setIsLimitVerifying] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [resetTime, setResetTime] = useState<string | null>(null);

  useEffect(() => {
    async function verifyLimits() {
      try {
        const res = await fetch("/api/download/check", { method: "POST" });
        if (res.ok) {
          const authCheck = await res.json();
          setRemaining(authCheck.remaining);
          setResetTime(authCheck.resetTime);
        }
      } catch (e) {
        // Assume empty context failover gracefully
      } finally {
        setIsLimitVerifying(false);
      }
    }
    verifyLimits();
  }, []);

  const handleDownload = async () => {
    // 1. Enforce business rule: Prevent blank resume downloads
    if (!data.personalInfo.name && data.experience.length === 0 && data.education.length === 0 && !data.summary) {
      toast.error("Resume is empty", { description: "Please add some content before exporting a PDF." });
      return;
    }

    // 2. Enforce limits: Global database verification cutoff
    if (remaining <= 0) {
      setShowBlockModal(true);
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); 

    try {
      // Hand-off to DOM logic securely querying the elements natively mapped
      const blob = await generatePDF("resume-preview-container");
      
      const firstName = data.personalInfo.name.split(" ")[0]?.trim() || "My";
      const lastName = data.personalInfo.name.split(" ")[1]?.trim() || "Resume";
      const sanitizedName = `${firstName}-${lastName}`.replace(/[^a-zA-Z0-9-]/g, "");

      downloadPDF(blob, `${sanitizedName}-Resume.pdf`);

      // Increment Backend Count securely
      const result = await fetch('/api/download/increment', { method: 'POST' });
      if (result.ok) {
        setRemaining(prev => Math.max(0, prev - 1));
      }

      toast.success("Download Successful!");
    } catch (error: any) {
      console.error(error);
      toast.error("Generation Failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DownloadCounter remaining={remaining} max={MAX_DOWNLOADS_PER_DAY} loading={isLimitVerifying} />
      
      <Button size="sm" onClick={handleDownload} disabled={isGenerating || isLimitVerifying}>
        {isGenerating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {isGenerating ? "Processing..." : "Download PDF"}
      </Button>

      <RateLimitModal 
        open={showBlockModal} 
        onOpenChange={setShowBlockModal} 
        resetTime={resetTime}
        onLoginClick={() => {
          setShowBlockModal(false);
          // Exploit standard DOM trigger safely wrapping across decoupled React boundaries
          document.getElementById('global-auth-trigger')?.click();
        }} 
      />
    </div>
  );
}
