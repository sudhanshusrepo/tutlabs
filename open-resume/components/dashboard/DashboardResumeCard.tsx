"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Copy, Trash, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function DashboardResumeCard({ resume, onDelete }: { resume: any; onDelete: (id: string) => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/resumes/${resume.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failed');
      toast.success('Resume deleted successfully');
      onDelete(resume.id);
    } catch (e) {
      toast.error('Failed to delete resume');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    // Basic duplication UX flow.
    toast.info("Duplicating...");
    try {
      const fetchReq = await fetch(`/api/resumes/${resume.id}`);
      const fullResume = await fetchReq.json();
      
      const copyPayload = {
        title: `${fullResume.title} (Copy)`,
        data: fullResume.data
      };

      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyPayload)
      });
      
      if (!res.ok) throw new Error();
      toast.success('Successfully duplicated!');
      router.refresh();
    } catch(e) {
      toast.error('Failed to duplicate');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow group flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{resume.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date(resume.updated_at).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 bg-muted/10 opacity-80 group-hover:opacity-100 transition-opacity">
        <Link href={`/builder?id=${resume.id}`}>
          <Button variant="ghost" size="sm" className="font-medium"><Edit2 className="w-4 h-4 mr-2" /> Edit</Button>
        </Link>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleDuplicate} title="Duplicate"><Copy className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
