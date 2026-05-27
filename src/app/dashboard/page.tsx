'use client';

import { useSession } from '@/context/SessionContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, GraduationCap, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import AIChatbot from './_components/ai-chatbot';
import AchievementsOverview from './_components/achievements-overview';

export default function DashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <DashboardSkeleton />;
  }
  
  const getFirstName = (fullName: string) => {
    const nameParts = fullName.split(' ');
    // Find the first part of the name that is longer than a single character, or default to the first part.
    return nameParts.find(part => part.length > 1) || nameParts[0] || 'Student';
  };

  const QuickLinkCard = ({
    title,
    icon,
    href,
    badgeColor,
    description,
    glowGradient,
  }: {
    title: string;
    icon: React.ReactNode;
    href: string;
    badgeColor: string;
    description: string;
    glowGradient: string;
  }) => (
    <Link href={href} className="group block h-full relative">
      {/* Top-edge ambient gradient glow line */}
      <div className={`absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r ${glowGradient} opacity-30 group-hover:opacity-100 transition-all duration-300 rounded-full blur-[0.5px]`} />
      
      <Card className="h-full bg-white/60 dark:bg-[#0f1930]/30 border border-slate-200/40 dark:border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-[1.02] hover:border-slate-200 dark:hover:border-[#6ab2ff]/30 hover:shadow-[0_20px_50px_-12px_rgba(106,178,255,0.1)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,188,211,0.25)] flex flex-col justify-between overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <CardTitle className="text-xl font-bold font-poppins text-slate-800 dark:text-white transition-colors">{title}</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed pr-2">
              {description}
            </p>
          </div>
          <div className={`p-3 rounded-2xl ${badgeColor} transition-all duration-300 group-hover:scale-110 shadow-sm shrink-0`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-[#50e1f9] transition-all pt-4 border-t border-slate-100 dark:border-white/5">
          Enter Hub <ArrowRight className="ml-1.5 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-transparent pb-16">
      <div className="container mx-auto py-12 px-6 space-y-12 max-w-7xl">
        
        {/* Welcome Premium Box */}
        <div className="relative p-8 md:p-10 rounded-3xl bg-white/40 dark:bg-[#0f1930]/30 border border-slate-200/50 dark:border-white/5 shadow-sm dark:shadow-2xl backdrop-blur-xl overflow-hidden group">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6ab2ff]/10 blur-[100px] rounded-full pointer-events-none -z-10 transition-all duration-500 group-hover:bg-[#6ab2ff]/15"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00bcd3]/10 blur-[100px] rounded-full pointer-events-none -z-10 transition-all duration-500 group-hover:bg-[#00bcd3]/15"></div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-poppins text-slate-900 dark:text-white flex flex-wrap items-center gap-3">
            Welcome back, <span className="bg-gradient-to-r from-[#6ab2ff] to-[#00bcd3] bg-clip-text text-transparent drop-shadow-sm font-extrabold">{getFirstName(user.full_name)}</span>!
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl leading-relaxed">
            Here's your academic cockpit for today. Access your courses, review grades, or launch an evaluation.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <QuickLinkCard
            title="My Courses"
            href="/courses"
            icon={<BookOpen className="h-6 w-6 text-blue-500 dark:text-[#6ab2ff]" />}
            badgeColor="bg-blue-500/10 text-blue-600 dark:bg-[#6ab2ff]/10 dark:text-[#6ab2ff]"
            description="Explore your registered semesters, view syllabus trackers, and lecture timelines."
            glowGradient="from-blue-500/50 to-indigo-500/50 dark:from-[#6ab2ff]/50 dark:to-[#6ab2ff]/20"
          />
          <QuickLinkCard
            title="My Grades"
            href="/grades"
            icon={<GraduationCap className="h-6 w-6 text-emerald-500 dark:text-[#50e1f9]" />}
            badgeColor="bg-emerald-500/10 text-emerald-600 dark:bg-[#50e1f9]/10 dark:text-[#50e1f9]"
            description="Inspect credit ledger breakdowns, GPA predictions, and full grade logs."
            glowGradient="from-emerald-500/50 to-teal-500/50 dark:from-[#50e1f9]/50 dark:to-[#50e1f9]/20"
          />
          <QuickLinkCard
            title="Upcoming Tests"
            href="/tests"
            icon={<FileText className="h-6 w-6 text-amber-500 dark:text-[#ffb4ab]" />}
            badgeColor="bg-amber-500/10 text-amber-600 dark:bg-[#ffb4ab]/10 dark:text-[#ffb4ab]"
            description="Track upcoming active test dates, descriptive practice, and MCQs."
            glowGradient="from-amber-500/50 to-orange-500/50 dark:from-[#ffb4ab]/50 dark:to-[#ffb4ab]/20"
          />
        </div>
        
        {/* Core Sections Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <AchievementsOverview />
          </div>
          <div className="lg:col-span-5">
            <AIChatbot />
          </div>
        </div>

      </div>
    </div>
  );
}

const DashboardSkeleton = () => (
  <div className="min-h-[calc(100vh-4rem)] bg-transparent pb-16">
    <div className="container mx-auto py-12 px-6 space-y-12 max-w-7xl animate-pulse">
      <div className="p-8 rounded-3xl bg-slate-200/50 dark:bg-[#0f1930]/35 border border-transparent h-48 w-full" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);
