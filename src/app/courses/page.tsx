'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Cpu, Dna, Code, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Course = {
  course_code: string;
  subject_name: string;
};

const iconMap = [
    <Cpu key="cpu" className="h-8 w-8 text-blue-500 dark:text-[#6ab2ff]" />,
    <Dna key="dna" className="h-8 w-8 text-emerald-500 dark:text-[#50e1f9]" />,
    <Code key="code" className="h-8 w-8 text-amber-500 dark:text-[#ffb4ab]" />,
]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/get-courses');
        const result = await response.json();

        if (result.success && Array.isArray(result.courses)) {
          setCourses(result.courses);
        } else {
          setError(result.message || 'Failed to parse course data.');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching courses.');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-6 max-w-7xl">
        <div className="p-8 rounded-3xl bg-slate-200/50 dark:bg-[#0f1930]/35 border border-transparent h-48 w-full mb-12 animate-pulse" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i} className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-md backdrop-blur-md animate-pulse">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/4 mt-2 mx-auto" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full rounded-xl" />
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-6 max-w-2xl">
        <Alert variant="destructive" className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 shadow-lg">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold font-poppins">Error Loading Courses</AlertTitle>
          <AlertDescription className="text-sm font-medium mt-1 leading-relaxed">{error}</AlertDescription>
          <Button asChild variant="secondary" className="mt-4 rounded-xl font-bold">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-transparent pb-16">
      <div className="container mx-auto py-12 px-6 max-w-7xl">
        
        {/* Banner Catalog */}
        <div className="relative p-8 md:p-10 rounded-3xl bg-white/40 dark:bg-[#0f1930]/30 border border-slate-200/50 dark:border-white/5 shadow-sm dark:shadow-2xl backdrop-blur-xl overflow-hidden group mb-12">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6ab2ff]/10 blur-[100px] rounded-full pointer-events-none -z-10 transition-all duration-500 group-hover:bg-[#6ab2ff]/15"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00bcd3]/10 blur-[100px] rounded-full pointer-events-none -z-10 transition-all duration-500 group-hover:bg-[#00bcd3]/15"></div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-poppins text-slate-900 dark:text-white flex flex-wrap items-center gap-3">
             <Cpu className="h-10 w-10 text-blue-500 dark:text-[#6ab2ff] drop-shadow-[0_0_10px_rgba(80,225,249,0.3)] animate-pulse" /> Course Catalog
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-3 font-medium max-w-2xl leading-relaxed">
             Explore your university courses, review content modules, and check grade metrics.
          </p>
        </div>

        {courses.length === 0 ? (
          <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl p-8 shadow-sm backdrop-blur-md">
            <CardContent>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-center leading-relaxed">No courses are available at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <Card key={course.course_code} className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl flex flex-col transition-all duration-300 hover:scale-[1.02] hover:border-[#6ab2ff]/50 dark:hover:border-[#6ab2ff]/40 hover:shadow-[0_20px_50px_-12px_rgba(106,178,255,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,188,211,0.25)] shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md overflow-hidden">
                <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-2xl font-bold font-poppins text-slate-800 dark:text-white group-hover:text-primary transition-colors">{course.subject_name}</CardTitle>
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#060e20]/60 shrink-0 shadow-sm border border-slate-200/20 dark:border-white/5">
                          {iconMap[index % iconMap.length]}
                        </div>
                    </div>
                  <CardDescription className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Code: {course.course_code}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2 flex-grow flex flex-col justify-end">
                  <Button asChild className="w-full mt-6 bg-slate-900 text-white dark:liquid-gradient dark:text-slate-900 font-bold py-3.5 rounded-xl hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(106,178,255,0.2)] dark:hover:shadow-[0_10px_20px_rgba(0,188,211,0.3)] transition-all duration-300 text-sm">
                    <Link href={`/courses/${course.course_code}?name=${encodeURIComponent(course.subject_name)}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
