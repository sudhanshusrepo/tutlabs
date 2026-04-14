"use client";

import React from "react";
import { useResume } from "@/lib/resumeContext";

// ─── Date formatters ──────────────────────────────────────────────────────────
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Converts "06/2022" → "Jun 2022", "Present" → "Present", anything else as-is */
function formatExpDate(date?: string): string {
  if (!date || date.trim() === "") return "";
  if (date.trim().toLowerCase() === "present") return "Present";
  const match = date.match(/^(\d{2})\/(\d{4})$/);
  if (match) {
    const month = parseInt(match[1], 10);
    const year = match[2];
    const monthName = MONTHS[month - 1] || "";
    return monthName ? `${monthName} ${year}` : year;
  }
  return date; // fallback: show raw
}

/** Renders an experience date range: "Jun 2022 – Present" */
function expDateRange(start: string, end?: string): string {
  const s = formatExpDate(start);
  const e = formatExpDate(end);
  if (!s) return "";
  return e ? `${s} – ${e}` : s;
}

/** Renders an education year range: "2020 – 2024" or "2020 – Present" */
function eduDateRange(start: string, end?: string): string {
  if (!start) return "";
  const e = end?.trim();
  if (!e) return start;
  return `${start} – ${e.toLowerCase() === "present" ? "Present" : e}`;
}

export function LivePreview() {
  const { data, isHydrated } = useResume();

  if (!isHydrated) return null;

  const { personalInfo, summary, experience, education, skills } = data;

  return (
    <div 
      id="resume-preview-container"
      className="bg-white text-black shadow-2xl mx-auto w-[210mm] min-h-[297mm] p-[20mm] box-border print:m-0 print:shadow-none print:w-auto print:h-auto print:min-h-0 print:color-adjust-exact relative"
    >
      {/* HEADER */}
      <header className="border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-4xl font-serif text-slate-900 tracking-tight mb-2">
          {personalInfo.name || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          {personalInfo.email && <span className="flex items-center gap-1">✉ {personalInfo.email}</span>}
          {personalInfo.phone && <span className="flex items-center gap-1">☎ {personalInfo.phone}</span>}
          {personalInfo.location && <span className="flex items-center gap-1">⌂ {personalInfo.location}</span>}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              in/ <a href={personalInfo.linkedin} className="text-blue-600 underline">{personalInfo.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//,'')}</a>
            </span>
          )}
          {personalInfo.portfolio && (
            <span className="flex items-center gap-1">
              ⌘ <a href={personalInfo.portfolio} className="text-blue-600 underline">{personalInfo.portfolio.replace(/https?:\/\//,'')}</a>
            </span>
          )}
        </div>
      </header>

      {/* SUMMARY */}
      {summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">
            Professional Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{summary}</p>
        </section>
      )}

      {/* EXPERIENCE */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="break-inside-avoid print:break-inside-avoid mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-900">{exp.role}</h3>
                  <span className="text-sm font-semibold text-slate-500">
                    {expDateRange(exp.startDate, exp.endDate)}
                  </span>
                </div>
                <div className="text-sm text-slate-600 font-medium mb-2">{exp.company}</div>
                {exp.description && (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="break-inside-avoid print:break-inside-avoid mb-3">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                  <span className="text-sm font-semibold text-slate-500">
                    {eduDateRange(edu.startDate, edu.endDate)}
                  </span>
                </div>
                <div className="text-sm text-slate-600 flex justify-between">
                  <span>{edu.school}</span>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {skills.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2 text-sm text-slate-700">
            {skills.map((skill) => (
              <span key={skill.id} className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
