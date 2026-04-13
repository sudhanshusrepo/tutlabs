"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2 } from "lucide-react";

import { ResumeSchema, ResumeData } from "@/types/resume";
import { useResume } from "@/lib/resumeContext";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ResumeForm() {
  const { data, dispatch, isHydrated } = useResume();

  const form = useForm<ResumeData>({
    resolver: zodResolver(ResumeSchema),
    defaultValues: data,
    mode: "onBlur",
  });

  // Reset form when hydrated from localStorage
  useEffect(() => {
    if (isHydrated) {
      form.reset(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // Sync to global context on every change for the live preview
  useEffect(() => {
    const subscription = form.watch(() => {
      // Use getValues() to fetch the full object, preventing partial deep undefined errors
      const currentValues = form.getValues();
      dispatch({ 
        type: "SET_ALL_DATA", 
        payload: { ...data, ...currentValues } as ResumeData 
      });
    });
    return () => subscription.unsubscribe();
  }, [form.watch, dispatch, form, data]);

  const {
    register,
    control,
    formState: { errors },
  } = form;

  const expArray = useFieldArray({
    control,
    name: "experience",
  });

  const eduArray = useFieldArray({
    control,
    name: "education",
  });

  const skillsArray = useFieldArray({
    control,
    name: "skills",
  });

  if (!isHydrated) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading saved data...</div>;
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* PERSONAL INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("personalInfo.name")} />
              {errors.personalInfo?.name && <p className="text-sm text-red-500">{errors.personalInfo.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register("personalInfo.email")} />
              {errors.personalInfo?.email && <p className="text-sm text-red-500">{errors.personalInfo.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" {...register("personalInfo.phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, State" {...register("personalInfo.location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/..." {...register("personalInfo.linkedin")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input id="portfolio" type="url" placeholder="https://..." {...register("personalInfo.portfolio")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PROFESSIONAL SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="A brief overview of your professional background and goals..."
              className="min-h-[100px]"
              {...register("summary")}
            />
          </div>
        </CardContent>
      </Card>

      {/* EXPERIENCE */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {expArray.fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md relative space-y-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => expArray.remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Input {...register(`experience.${index}.company` as const)} placeholder="Company Name" />
                  {errors.experience?.[index]?.company && (
                    <p className="text-sm text-red-500">{errors.experience[index]?.company?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Input {...register(`experience.${index}.role` as const)} placeholder="Job Title" />
                  {errors.experience?.[index]?.role && (
                    <p className="text-sm text-red-500">{errors.experience[index]?.role?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input {...register(`experience.${index}.startDate` as const)} placeholder="MM/YYYY" />
                  {errors.experience?.[index]?.startDate && (
                    <p className="text-sm text-red-500">{errors.experience[index]?.startDate?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input {...register(`experience.${index}.endDate` as const)} placeholder="MM/YYYY or Present" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  {...register(`experience.${index}.description` as const)}
                  placeholder="Describe your achievements and responsibilities..."
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              expArray.append({ id: uuidv4(), company: "", role: "", startDate: "", endDate: "", description: "" })
            }
          >
            <Plus className="w-4 h-4 mr-2" /> Add Experience
          </Button>
        </CardContent>
      </Card>

      {/* EDUCATION */}
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {eduArray.fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md relative space-y-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => eduArray.remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>School *</Label>
                  <Input {...register(`education.${index}.school` as const)} placeholder="University Name" />
                  {errors.education?.[index]?.school && (
                    <p className="text-sm text-red-500">{errors.education[index]?.school?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Degree *</Label>
                  <Input {...register(`education.${index}.degree` as const)} placeholder="B.S. Computer Science" />
                  {errors.education?.[index]?.degree && (
                    <p className="text-sm text-red-500">{errors.education[index]?.degree?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input {...register(`education.${index}.startDate` as const)} placeholder="YYYY" />
                  {errors.education?.[index]?.startDate && (
                    <p className="text-sm text-red-500">{errors.education[index]?.startDate?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input {...register(`education.${index}.endDate` as const)} placeholder="YYYY" />
                </div>
                <div className="space-y-2">
                  <Label>GPA</Label>
                  <Input {...register(`education.${index}.gpa` as const)} placeholder="3.8/4.0" />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => eduArray.append({ id: uuidv4(), school: "", degree: "", startDate: "", endDate: "", gpa: "" })}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Education
          </Button>
        </CardContent>
      </Card>

      {/* SKILLS */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {skillsArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                <Input
                  className="bg-transparent border-none h-6 p-0 w-24 focus-visible:ring-0 shadow-none text-sm"
                  {...register(`skills.${index}.name` as const)}
                />
                <button
                  type="button"
                  onClick={() => skillsArray.remove(index)}
                  className="ml-2 text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => skillsArray.append({ id: uuidv4(), name: "New Skill" })}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Skill
          </Button>
        </CardContent>
      </Card>
      
      {/* Note: The download generation is a placeholder for Day 3 requirement */}
      <div className="hidden">
        {/* Forces error indicators to re-render properly */}
        {Object.keys(errors).length > 0 && <span id="form-has-errors"></span>}
      </div>
    </form>
  );
}
