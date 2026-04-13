"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { ResumeForm } from "@/components/forms/ResumeForm";
import { LivePreview } from "@/components/resume/LivePreview";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Check } from "lucide-react";
import { DownloadButton } from "@/components/resume/DownloadButton";
import { HeaderProfile } from "@/components/layout/HeaderProfile";
import { defaultResumeData } from "@/types/resume";
import { useResume, ResumeProvider } from "@/lib/resumeContext";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import debounce from "lodash.debounce";
import { toast } from "sonner";

function BuilderHeaderInner() {
  const { dispatch, data } = useResume();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const supabase = createClient();

  // Load resume if param exists
  useEffect(() => {
    if (!resumeId) return;
    
    async function fetchResume() {
      const { data: profile } = await supabase.from("resumes").select("data").eq("id", resumeId).single();
      if (profile) {
        dispatch({ type: "SET_ALL_DATA", payload: profile.data });
      } else {
        toast.error("Cloud resume not found or access denied.");
      }
    }
    fetchResume();
  }, [resumeId, supabase, dispatch]);

  const handleSave = async (resumeData: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return; // Silent auto-save bypass for guests

    setIsSaving(true);
    try {
      const payload = {
        ...(resumeId ? { id: resumeId } : {}),
        title: resumeData.personalInfo?.name ? `${resumeData.personalInfo.name}'s Resume` : "Untitled Resume",
        data: resumeData
      };

      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) setLastSaved(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSave = useCallback(debounce(handleSave, 5000), [resumeId]);

  useEffect(() => {
    // Basic skip on totally empty initialize to avoid thrashing empty records 
    if (data.personalInfo.name || data.experience.length > 0) {
       debouncedSave(data);
    }
    return debouncedSave.cancel;
  }, [data, debouncedSave]);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-3 print:hidden shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
          OpenResume
        </h1>
        {lastSaved && (
          <span className="text-xs text-muted-foreground hidden sm:flex items-center">
            <Check className="w-3 h-3 mr-1 text-green-500" />
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        )}
        {isSaving && (
          <span className="text-xs text-muted-foreground hidden sm:flex items-center">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Saving...
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => {
          if (confirm("Are you sure you want to reset all data?")) {
            dispatch({ type: "SET_ALL_DATA", payload: defaultResumeData });
          }
        }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reset
        </Button>
        <DownloadButton />
        <HeaderProfile />
      </div>
    </header>
  );
}

function BuilderHeader() {
  return (
    <Suspense fallback={<div className="h-14 border-b bg-background" />}>
      <BuilderHeaderInner />
    </Suspense>
  );
}

export default function BuilderPage() {
  return (
    <ResumeProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-muted/20">
        <BuilderHeader />
        
        <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT PANE - FORM */}
          <div className="h-full overflow-y-auto border-r bg-background p-6 lg:p-8 print:hidden">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Build Your Resume</h2>
              <ResumeForm />
            </div>
          </div>

          {/* RIGHT PANE - PREVIEW */}
          <div className="h-full overflow-y-auto bg-slate-200/50 p-4 lg:p-12 flex justify-center print:p-0 print:bg-white print:overflow-visible">
            <div className="transform origin-top scale-[0.6] sm:scale-75 md:scale-[0.85] lg:scale-100 xl:scale-100 transition-transform">
              <LivePreview />
            </div>
          </div>
        </main>
      </div>
    </ResumeProvider>
  );
}
