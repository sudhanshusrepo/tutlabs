"use client";

import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import { ResumeData, defaultResumeData } from "@/types/resume";

export type ResumeAction =
  | { type: "SET_ALL_DATA"; payload: ResumeData }
  | { type: "UPDATE_SECTION"; section: keyof ResumeData; payload: any }
  | { type: "ADD_ITEM"; section: "experience" | "education" | "skills"; payload: any }
  | { type: "REMOVE_ITEM"; section: "experience" | "education" | "skills"; id: string }
  | { type: "REORDER_ITEMS"; section: "experience" | "education" | "skills"; payload: any[] };

interface ResumeContextType {
  data: ResumeData;
  dispatch: React.Dispatch<ResumeAction>;
  isHydrated: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

function resumeReducer(state: ResumeData, action: ResumeAction): ResumeData {
  switch (action.type) {
    case "SET_ALL_DATA":
      return { ...action.payload };
    case "UPDATE_SECTION":
      return { ...state, [action.section]: action.payload };
    case "ADD_ITEM":
      return {
        ...state,
        [action.section]: [...(state[action.section] as any[]), action.payload],
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        [action.section]: (state[action.section] as any[]).filter((item: any) => item.id !== action.id),
      };
    case "REORDER_ITEMS":
      return {
        ...state,
        [action.section]: action.payload,
      };
    default:
      return state;
  }
}

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(resumeReducer, defaultResumeData);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("openResumeData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: "SET_ALL_DATA", payload: parsed });
      } catch (e) {
        console.error("Failed to parse resume data from localStorage", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!isHydrated) return;
    const interval = setInterval(() => {
      localStorage.setItem("openResumeData", JSON.stringify(data));
    }, 30000);
    return () => clearInterval(interval);
  }, [data, isHydrated]);

  // Optional: Also save before unload to prevent data loss
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("openResumeData", JSON.stringify(data));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [data]);

  return (
    <ResumeContext.Provider value={{ data, dispatch, isHydrated }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
}
