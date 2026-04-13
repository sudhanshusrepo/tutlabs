"use client";

import Link from "next/link";
import { Copy, FileText, Download, CheckCircle2, ChevronRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <header className="px-6 lg:px-8 py-5 flex items-center justify-between border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight flex items-center">
          <FileText className="w-6 h-6 mr-2 text-blue-600 fill-blue-100" />
          OpenResume
        </h1>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors hidden sm:block">Dashboard</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 transition-colors">
            <Github className="w-5 h-5" />
          </a>
          <Link href="/builder">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md font-semibold px-4 rounded-lg">Open Builder</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-4 pt-20 pb-16 md:pt-32 md:pb-24 max-w-6xl mx-auto">
        <div className="animate-fade-in-up duration-500 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 mb-8 border border-blue-200 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
          100% Free & Open Source
        </div>
        
        <h2 className="animate-fade-in-up delay-100 duration-700 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.05] mb-6">
          No paywalls. <br className="hidden sm:block" />
          No tricks. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 inline-block px-2">
            Just resumes.
          </span>
        </h2>
        
        <p className="animate-fade-in-up delay-200 duration-700 max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed font-medium px-4">
          Build a professional, ATS-friendly resume in minutes. See it adapt dynamically in a real-time A4 preview window, then export directly to PDF. Absolutely zero forced subscriptions or watermarks.
        </p>

        <div className="animate-fade-in-up delay-300 duration-700 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
          <Link href="/builder" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-lg h-14 px-8 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 rounded-xl transition-all hover:-translate-y-1 active:translate-y-0">
              Start Building Now
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <a href="https://github.com/sudhanshusrepo/tutlabs" target="_blank" rel="noreferrer" className="w-full sm:w-auto mt-4 sm:mt-0">
            <Button size="lg" variant="outline" className="w-full text-lg h-14 px-8 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-800 dark:border-slate-800 dark:hover:border-slate-700 hover:bg-slate-100 transition-all">
              View on GitHub
            </Button>
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-24 text-left w-full px-4">
          <FeatureCard 
            icon={<FileText className="w-8 h-8 text-blue-500" />}
            title="Real-time A4 Scaling"
            desc="No more guessing. Watch your resume build securely on a pixel-perfect A4 canvas that instantly maps into a flawless print."
          />
          <FeatureCard 
            icon={<Copy className="w-8 h-8 text-indigo-500" />}
            title="Persistent Accounts"
            desc="Use our smart guest quotas securely or log in utilizing Supabase to safely stash hundreds of variations to your cloud Dashboard."
          />
          <FeatureCard 
            icon={<Download className="w-8 h-8 text-emerald-500" />}
            title="Instant PDF Exports"
            desc="Skip the credit card portals. Instantly download High-DPI outputs sliced gracefully to guard against awkward page-breaks."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-10 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950">
        <p className="text-sm font-medium">Built open source for developers and job seekers. MIT Licensed.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 lg:p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-extrabold mb-3 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center text-sm font-bold text-blue-600 opacity-80">
        <CheckCircle2 className="w-4 h-4 mr-2" /> Verified Open Source
      </div>
    </div>
  );
}
