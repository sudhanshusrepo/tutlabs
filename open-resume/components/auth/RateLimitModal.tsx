"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, Clock } from "lucide-react";
import { useCountdown } from "@/lib/hooks"; // I need to implement a simple countdown helper or parse it directly natively. I will use a native effect for time.

interface RateLimitModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  resetTime: string | null;
  onLoginClick: () => void;
}

export function RateLimitModal({ open, onOpenChange, resetTime, onLoginClick }: RateLimitModalProps) {
  // Simple react logic to format the ISO string back to remaining duration. Let's just output "Tomorrow at Midnight UTC" for UI simplicity or calculate delta.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-red-200 shadow-red-500/10">
        <DialogHeader>
          <DialogTitle className="text-red-500 flex items-center">
            Daily Download Limit Reached
          </DialogTitle>
          <DialogDescription className="text-base py-2">
            You have exhausted your guest allowance of 3 PDF exports for today. 
            To prevent spam, anonymous generation is temporarily blocked.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between mt-2">
          <div className="flex items-center text-muted-foreground text-sm font-medium">
            <Clock className="w-4 h-4 mr-2" />
            Cooldown resets:
          </div>
          <span className="font-bold text-sm">
            {resetTime ? new Date(resetTime).toLocaleTimeString([], {timeStyle: 'short'}) : "Midnight"}
          </span>
        </div>

        <DialogFooter className="mt-6 sm:justify-start flex-col gap-2">
          <Button type="button" onClick={onLoginClick} className="w-full bg-blue-600 hover:bg-blue-700">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Unlock Unlimited
          </Button>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
