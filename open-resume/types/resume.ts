import { z } from "zod";

// ── Helpers ────────────────────────────────────────────────────────────────────
const nameRegex = /^[a-zA-Z\s'\-\.]+$/;
const mmYYYYRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
const presentOrDate = (val: string) =>
  val.trim().toLowerCase() === "present" || mmYYYYRegex.test(val);

// ── Schemas ────────────────────────────────────────────────────────────────────
export const PersonalInfoSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long")
    .regex(nameRegex, "Name must contain only letters, spaces, hyphens or apostrophes"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address (e.g. you@example.com)"),

  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(
      /^\+91\d{10}$/,
      "Enter a valid 10-digit Indian mobile number (+91XXXXXXXXXX)"
    ),

  location: z.string().optional(),

  linkedin: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || /^https?:\/\/.+\..+/.test(val),
      "Must be a valid URL starting with https://"
    ),

  portfolio: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || /^https?:\/\/.+\..+/.test(val),
      "Must be a valid URL starting with https://"
    ),
});

export const ExperienceSchema = z.object({
  id: z.string(),

  company: z
    .string()
    .min(1, "Company name is required"),

  role: z
    .string()
    .min(1, "Job title is required"),

  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (val) => mmYYYYRegex.test(val),
      "Use MM/YYYY format (e.g. 06/2022)"
    ),

  endDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || presentOrDate(val),
      "Use MM/YYYY format or write 'Present'"
    ),

  description: z.string().optional(),
});

export const EducationSchema = z.object({
  id: z.string(),

  school: z
    .string()
    .min(1, "College / University name is required"),

  degree: z
    .string()
    .min(1, "Degree / course is required"),

  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (val) => mmYYYYRegex.test(val),
      "Use MM/YYYY format (e.g. 06/2020)"
    ),

  endDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || presentOrDate(val),
      "Use MM/YYYY format or write 'Present'"
    ),

  gpa: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || /^\d(\.\d{1,2})?(\/\d(\.\d{1,2})?)?$/.test(val),
      "Enter GPA like 7.52 or 3.8/4.0"
    ),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill name cannot be empty"),
});

export const ResumeSchema = z.object({
  personalInfo: PersonalInfoSchema,
  summary: z.string().optional(),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
});

// ── Types ──────────────────────────────────────────────────────────────────────
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type SkillItem = z.infer<typeof SkillSchema>;
export type ResumeData = z.infer<typeof ResumeSchema>;

// ── Default Data ───────────────────────────────────────────────────────────────
export const defaultResumeData: ResumeData = {
  personalInfo: {
    name: "",
    email: "",
    phone: "+91",
    location: "",
    linkedin: "",
    portfolio: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
};
