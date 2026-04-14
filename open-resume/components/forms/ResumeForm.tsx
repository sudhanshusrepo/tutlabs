"use client";

import React, { useEffect, useState, KeyboardEvent } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, User, Briefcase, GraduationCap, Code2, FolderGit2 } from "lucide-react";

import { ResumeSchema, ResumeData } from "@/types/resume";
import { useResume } from "@/lib/resumeContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ─── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  action?: React.ReactNode;
}
function SectionHeader({ icon, iconBg, title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─── Add Button ───────────────────────────────────────────────────────────────
interface AddButtonProps {
  label: string;
  color: string;
  onClick: () => void;
}
function AddButton({ label, color, onClick }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all hover:opacity-90 active:scale-95 ${color}`}
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f2f2f7] rounded-2xl p-5 mb-4">
      {children}
    </div>
  );
}

// ─── Field styles ─────────────────────────────────────────────────────────────
const inputClass =
  "w-full bg-white/80 border-0 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 shadow-none focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

// ─── Main Form ────────────────────────────────────────────────────────────────
export function ResumeForm() {
  const { data, dispatch, isHydrated } = useResume();

  const form = useForm<ResumeData>({
    resolver: zodResolver(ResumeSchema),
    defaultValues: data,
    mode: "onBlur",
  });

  useEffect(() => {
    if (isHydrated) form.reset(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  useEffect(() => {
    const subscription = form.watch(() => {
      const currentValues = form.getValues();
      dispatch({ type: "SET_ALL_DATA", payload: { ...data, ...currentValues } as ResumeData });
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch, dispatch, form, data]);

  const { register, control } = form;

  const expArray = useFieldArray({ control, name: "experience" });
  const eduArray = useFieldArray({ control, name: "education" });
  const skillsArray = useFieldArray({ control, name: "skills" });

  // Skill tag input state
  const [skillInput, setSkillInput] = useState("");
  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      skillsArray.append({ id: uuidv4(), name: skillInput.trim() });
      setSkillInput("");
    }
  };

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#f2f2f7] rounded-2xl p-5 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-40 mb-4" />
            <div className="h-10 bg-gray-200 rounded-xl mb-3" />
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <form className="space-y-2 pb-10" onSubmit={(e) => e.preventDefault()}>

      {/* ── PERSONAL INFORMATION ── */}
      <SectionCard>
        <SectionHeader
          icon={<User className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
          title="Personal Information"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Full Name</label>
            <input className={inputClass} placeholder="Sudhanshu Singh" {...register("personalInfo.name")} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" placeholder="john@example.com" {...register("personalInfo.email")} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} placeholder="+1 234 567 890" {...register("personalInfo.phone")} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input className={inputClass} placeholder="New York, NY" {...register("personalInfo.location")} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Website / LinkedIn</label>
            <input className={inputClass} placeholder="linkedin.com/in/johndoe" {...register("personalInfo.linkedin")} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Portfolio URL</label>
            <input className={inputClass} placeholder="https://yourportfolio.com" {...register("personalInfo.portfolio")} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Professional Summary</label>
            <textarea
              className={`${inputClass} min-h-[96px] resize-y`}
              placeholder="Briefly describe your background and goals..."
              {...register("summary")}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── EXPERIENCE ── */}
      <SectionCard>
        <SectionHeader
          icon={<Briefcase className="w-5 h-5 text-orange-500" />}
          iconBg="bg-orange-100"
          title="Experience"
          action={
            <AddButton
              label="Add Experience"
              color="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100"
              onClick={() => expArray.append({ id: uuidv4(), company: "", role: "", startDate: "", endDate: "", description: "" })}
            />
          }
        />
        <div className="space-y-4">
          {expArray.fields.map((field, index) => (
            <div key={field.id} className="bg-white/80 rounded-xl p-4 space-y-3 relative">
              <button
                type="button"
                onClick={() => expArray.remove(index)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Company</label>
                  <input className={inputClass} placeholder="Company Name" {...register(`experience.${index}.company`)} />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <input className={inputClass} placeholder="Job Title" {...register(`experience.${index}.role`)} />
                </div>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input className={inputClass} placeholder="MM/YYYY" {...register(`experience.${index}.startDate`)} />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input className={inputClass} placeholder="MM/YYYY or Present" {...register(`experience.${index}.endDate`)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  className={`${inputClass} min-h-[80px] resize-y`}
                  placeholder="Describe your achievements and responsibilities..."
                  {...register(`experience.${index}.description`)}
                />
              </div>
            </div>
          ))}
          {expArray.fields.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">No experience added yet.</p>
          )}
        </div>
      </SectionCard>

      {/* ── EDUCATION ── */}
      <SectionCard>
        <SectionHeader
          icon={<GraduationCap className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-100"
          title="Education"
          action={
            <AddButton
              label="Add Education"
              color="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
              onClick={() => eduArray.append({ id: uuidv4(), school: "", degree: "", startDate: "", endDate: "", gpa: "" })}
            />
          }
        />
        <div className="space-y-4">
          {eduArray.fields.map((field, index) => (
            <div key={field.id} className="bg-white/80 rounded-xl p-4 space-y-3 relative">
              <button
                type="button"
                onClick={() => eduArray.remove(index)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>School</label>
                  <input className={inputClass} placeholder="University Name" {...register(`education.${index}.school`)} />
                </div>
                <div>
                  <label className={labelClass}>Degree</label>
                  <input className={inputClass} placeholder="B.S. Computer Science" {...register(`education.${index}.degree`)} />
                </div>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input className={inputClass} placeholder="YYYY" {...register(`education.${index}.startDate`)} />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input className={inputClass} placeholder="YYYY" {...register(`education.${index}.endDate`)} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>GPA (optional)</label>
                  <input className={inputClass} placeholder="3.8 / 4.0" {...register(`education.${index}.gpa`)} />
                </div>
              </div>
            </div>
          ))}
          {eduArray.fields.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">No education added yet.</p>
          )}
        </div>
      </SectionCard>

      {/* ── SKILLS ── */}
      <SectionCard>
        <SectionHeader
          icon={<Code2 className="w-5 h-5 text-teal-600" />}
          iconBg="bg-teal-100"
          title="Skills"
        />
        <div>
          <label className={labelClass}>Add Skill (Press Enter)</label>
          <input
            className={inputClass}
            placeholder="e.g. React, TypeScript, Project Management"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
          />
          {skillsArray.fields.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skillsArray.fields.map((field, index) => (
                <span
                  key={field.id}
                  className="inline-flex items-center gap-1.5 bg-white/80 text-gray-700 text-sm font-medium px-3 py-1 rounded-full border border-gray-200"
                >
                  {(field as any).name}
                  <button
                    type="button"
                    onClick={() => skillsArray.remove(index)}
                    className="text-gray-400 hover:text-red-500 transition ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

    </form>
  );
}
