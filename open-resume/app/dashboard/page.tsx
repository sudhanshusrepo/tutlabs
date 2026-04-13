import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardResumeCard } from '@/components/dashboard/DashboardResumeCard';

// Opt out of static generation since checking session is dynamic
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  // Server fetch
  const { data: resumes } = await supabase
    .from('resumes')
    .select('id, title, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="container mx-auto py-10 px-6 max-w-7xl min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage and edit your saved variations safely secured in the cloud.</p>
        </div>
        <Link href="/builder">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      {(!resumes || resumes.length === 0) ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed flex flex-col items-center">
          <h2 className="text-xl font-medium mb-2">No resumes found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">You haven&apos;t saved any resumes to your account yet. Let&apos;s create your first impressive layout!</p>
          <Link href="/builder">
            <Button variant="outline">Start Building Your Next Job</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume: any) => (
            // Passing empty fn since client component handles local DOM remove via router.refresh() 
            <DashboardResumeCard key={resume.id} resume={resume} onDelete={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
