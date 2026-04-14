"use client";

import React, { useEffect, useState, KeyboardEvent, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, User, Briefcase, GraduationCap, Code2, AlertCircle } from "lucide-react";

import { ResumeSchema, ResumeData } from "@/types/resume";
import { useResume } from "@/lib/resumeContext";

// ─── Style constants ──────────────────────────────────────────────────────────
const inputClass =
  "w-full bg-white/80 border-0 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition";
const inputErrorClass =
  "w-full bg-white/80 border border-red-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300/40 transition";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

// ─── Helper components ────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  );
}

function RequiredMark() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

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

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f2f2f7] rounded-2xl p-5 mb-4">
      {children}
    </div>
  );
}

// ─── Phone input with locked +91 prefix ──────────────────────────────────────
interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  error?: string;
}
function PhoneInput({ value, onChange, onBlur, error }: PhoneInputProps) {
  // value is always stored as "+91XXXXXXXXXX"
  const digits = value.replace(/^\+91/, "");

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(`+91${raw}`);
  };

  return (
    <div>
      <div className={`flex rounded-xl overflow-hidden ${error ? "ring-1 ring-red-300" : "ring-0"} focus-within:ring-2 focus-within:ring-blue-400/40 transition`}>
        <span className="flex items-center px-3 bg-gray-100 border-r border-gray-200 text-sm font-semibold text-gray-600 select-none rounded-l-xl">
          +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="9876543210"
          value={digits}
          onChange={handleDigitsChange}
          onBlur={onBlur}
          className="flex-1 bg-white/80 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none rounded-r-xl"
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

// ─── Date input with MM/YYYY auto-format ─────────────────────────────────────
interface DateInputProps {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
  allowPresent?: boolean;
}
function DateInput({ value, onChange, onBlur, placeholder = "MM/YYYY", error, allowPresent }: DateInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Allow "present" typing
    if (allowPresent && raw.toLowerCase().startsWith("p")) {
      onChange(raw);
      return;
    }

    // Auto-format: insert slash after 2 digits
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    onChange(formatted);
  };

  return (
    <div>
      <input
        className={error ? inputErrorClass : inputClass}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        maxLength={allowPresent ? 10 : 7}
      />
      <FieldError message={error} />
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export function ResumeForm() {
  const { data, dispatch, isHydrated } = useResume();

  const form = useForm<ResumeData>({
    resolver: zodResolver(ResumeSchema),
    defaultValues: data,
    mode: "onBlur",  // validate on blur for good UX
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

  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = form;

  const expArray = useFieldArray({ control, name: "experience" });
  const eduArray = useFieldArray({ control, name: "education" });
  const skillsArray = useFieldArray({ control, name: "skills" });

  const phoneValue = watch("personalInfo.phone") || "+91";

  // Skill tag input
  const [skillInput, setSkillInput] = useState("");
  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      skillsArray.append({ id: uuidv4(), name: skillInput.trim() });
      setSkillInput("");
    }
  };

  // Name: block digits
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[0-9]/g, "");
    setValue("personalInfo.name", cleaned, { shouldValidate: true });
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
    <form className="space-y-2 pb-10" onSubmit={(e) => e.preventDefault()} noValidate>

      {/* ── PERSONAL INFORMATION ── */}
      <SectionCard>
        <SectionHeader
          icon={<User className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
          title="Personal Information"
        />
        <div className="grid grid-cols-2 gap-3">

          {/* Name */}
          <div>
            <label className={labelClass}>Full Name <RequiredMark /></label>
            <input
              className={errors.personalInfo?.name ? inputErrorClass : inputClass}
              placeholder="Sudhanshu Singh"
              {...register("personalInfo.name")}
              onChange={handleNameInput}
            />
            <FieldError message={errors.personalInfo?.name?.message} />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email <RequiredMark /></label>
            <input
              className={errors.personalInfo?.email ? inputErrorClass : inputClass}
              type="email"
              placeholder="dhan@example.com"
              {...register("personalInfo.email")}
            />
            <FieldError message={errors.personalInfo?.email?.message} />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Phone <RequiredMark /></label>
            <PhoneInput
              value={phoneValue}
              onChange={(val) => setValue("personalInfo.phone", val, { shouldValidate: true })}
              onBlur={() => trigger("personalInfo.phone")}
              error={errors.personalInfo?.phone?.message}
            />
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location</label>
            <input
              className={inputClass}
              placeholder="Navi Mumbai, IN"
              {...register("personalInfo.location")}
            />
          </div>

          {/* LinkedIn */}
          <div className="col-span-2">
            <label className={labelClass}>LinkedIn URL</label>
            <input
              className={errors.personalInfo?.linkedin ? inputErrorClass : inputClass}
              placeholder="https://linkedin.com/in/sudhanshu-singh"
              {...register("personalInfo.linkedin")}
            />
            <FieldError message={errors.personalInfo?.linkedin?.message} />
          </div>

          {/* Portfolio */}
          <div className="col-span-2">
            <label className={labelClass}>Portfolio URL</label>
            <input
              className={errors.personalInfo?.portfolio ? inputErrorClass : inputClass}
              placeholder="https://yourportfolio.com"
              {...register("personalInfo.portfolio")}
            />
            <FieldError message={errors.personalInfo?.portfolio?.message} />
          </div>

          {/* Summary */}
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
              onClick={() =>
                expArray.append({
                  id: uuidv4(),
                  company: "",
                  role: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
            />
          }
        />
        <div className="space-y-4">
          {expArray.fields.map((field, index) => {
            const err = errors.experience?.[index];
            return (
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
                    <label className={labelClass}>Company <RequiredMark /></label>
                    <input
                      className={err?.company ? inputErrorClass : inputClass}
                      placeholder="Tata Consultancy Services"
                      {...register(`experience.${index}.company`)}
                    />
                    <FieldError message={err?.company?.message} />
                  </div>
                  <div>
                    <label className={labelClass}>Job Title <RequiredMark /></label>
                    <input
                      className={err?.role ? inputErrorClass : inputClass}
                      placeholder="Software Engineer"
                      {...register(`experience.${index}.role`)}
                    />
                    <FieldError message={err?.role?.message} />
                  </div>
                  <div>
                    <label className={labelClass}>Start Date <RequiredMark /></label>
                    <DateInput
                      value={watch(`experience.${index}.startDate`) || ""}
                      onChange={(val) =>
                        setValue(`experience.${index}.startDate`, val, { shouldValidate: true })
                      }
                      onBlur={() => trigger(`experience.${index}.startDate`)}
                      error={err?.startDate?.message}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <DateInput
                      value={watch(`experience.${index}.endDate`) || ""}
                      onChange={(val) =>
                        setValue(`experience.${index}.endDate`, val, { shouldValidate: true })
                      }
                      onBlur={() => trigger(`experience.${index}.endDate`)}
                      error={err?.endDate?.message}
                      allowPresent
                      placeholder="MM/YYYY or Present"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    className={`${inputClass} min-h-[80px] resize-y`}
                    placeholder="Key achievements, responsibilities..."
                    {...register(`experience.${index}.description`)}
                  />
                </div>
              </div>
            );
          })}
          {expArray.fields.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">
              No experience added yet. Click &quot;Add Experience&quot; above.
            </p>
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
              onClick={() =>
                eduArray.append({
                  id: uuidv4(),
                  school: "",
                  degree: "",
                  startDate: "",
                  endDate: "",
                  gpa: "",
                })
              }
            />
          }
        />
        <div className="space-y-4">
          {eduArray.fields.map((field, index) => {
            const err = errors.education?.[index];
            return (
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
                    <label className={labelClass}>College / University <RequiredMark /></label>
                    <input
                      className={err?.school ? inputErrorClass : inputClass}
                      placeholder="Bharati Vidyapeeth College"
                      {...register(`education.${index}.school`)}
                    />
                    <FieldError message={err?.school?.message} />
                  </div>
                  <div>
                    <label className={labelClass}>Degree <RequiredMark /></label>
                    <input
                      className={err?.degree ? inputErrorClass : inputClass}
                      placeholder="B.E. Computer Engineering"
                      {...register(`education.${index}.degree`)}
                    />
                    <FieldError message={err?.degree?.message} />
                  </div>
                  <div>
                    <label className={labelClass}>Start Year <RequiredMark /></label>
                    <input
                      className={err?.startDate ? inputErrorClass : inputClass}
                      placeholder="2020"
                      maxLength={4}
                      inputMode="numeric"
                      {...register(`education.${index}.startDate`, {
                        onChange: (e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setValue(`education.${index}.startDate`, digits, { shouldValidate: true });
                        },
                      })}
                    />
                    <FieldError message={err?.startDate?.message} />
                  </div>
                  <div>
                    <label className={labelClass}>End Year</label>
                    <input
                      className={err?.endDate ? inputErrorClass : inputClass}
                      placeholder="2024 or Present"
                      maxLength={7}
                      {...register(`education.${index}.endDate`, {
                        onChange: (e) => {
                          const raw = e.target.value;
                          // Allow 'present' typing
                          if (raw.toLowerCase().startsWith("p")) {
                            setValue(`education.${index}.endDate`, raw, { shouldValidate: false });
                            return;
                          }
                          const digits = raw.replace(/\D/g, "").slice(0, 4);
                          setValue(`education.${index}.endDate`, digits, { shouldValidate: true });
                        },
                      })}
                    />
                    <FieldError message={err?.endDate?.message} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>GPA (optional)</label>
                    <input
                      className={err?.gpa ? inputErrorClass : inputClass}
                      placeholder="7.52 or 3.8/4.0"
                      {...register(`education.${index}.gpa`)}
                    />
                    <FieldError message={err?.gpa?.message} />
                  </div>
                </div>
              </div>
            );
          })}
          {eduArray.fields.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">
              No education added yet. Click &quot;Add Education&quot; above.
            </p>
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
          <label className={labelClass}>Add Skill (Press Enter or comma)</label>
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
                  {(field as { id: string; name: string }).name}
                  <button
                    type="button"
                    onClick={() => skillsArray.remove(index)}
                    className="text-gray-400 hover:text-red-500 transition ml-0.5 leading-none"
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
