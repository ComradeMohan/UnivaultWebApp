'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Pen, Pencil, History, InfinityIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DetailItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="flex justify-between text-sm py-2 border-b border-white/10">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
    </div>
);


const PreparationModeCard = ({ title, description, href, badgeColor }: { title: string; description: string, href: string, badgeColor: string }) => (
    <Link href={href} className="flex-1 group">
        <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl transform transition-all duration-300 hover:scale-[1.03] hover:border-[#6ab2ff]/50 dark:hover:border-[#6ab2ff]/40 hover:shadow-[0_20px_50px_-12px_rgba(106,178,255,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,188,211,0.25)] h-full flex flex-col p-6 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md">
            <div className="flex justify-between items-start mb-4">
                <CardTitle className="text-xl font-bold font-poppins text-slate-800 dark:text-white group-hover:text-[#6ab2ff] transition-colors">{title}</CardTitle>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
                   {title.split(' ')[0]}
                </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">{description}</p>
            <div className="flex-grow flex items-end justify-end">
                 <div className="flex justify-end items-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-[#6ab2ff] dark:group-hover:text-[#50e1f9] transition-all">
                    Start Preparing <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </Card>
    </Link>
);

const TestOptionCard = ({
    icon,
    title,
    badgeText,
    description,
    stats,
    href,
    badgeColor,
}: {
    icon: React.ReactNode;
    title: string;
    badgeText: string;
    description: string;
    stats: { value: string | React.ReactNode; label: string }[];
    href: string;
    badgeColor: string;
}) => (
    <Link href={href} className="group block h-full">
     <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl transform transition-all duration-300 hover:scale-[1.02] hover:border-[#6ab2ff]/50 dark:hover:border-[#6ab2ff]/40 hover:shadow-[0_20px_50px_-12px_rgba(106,178,255,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,188,211,0.25)] h-full flex flex-col shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md overflow-hidden">
        <CardHeader className="flex items-start justify-between p-6 pb-2 gap-4">
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#060e20]/60 shrink-0 shadow-sm border border-slate-200/20 dark:border-white/5 text-blue-500 dark:text-[#6ab2ff]">
                  {icon}
                </div>
                <div>
                    <CardTitle className="text-xl font-bold font-poppins text-slate-800 dark:text-white group-hover:text-primary transition-colors">{title}</CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1.5">{description}</p>
                </div>
            </div>
            <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${badgeColor}`}>
              {badgeText}
            </div>
        </CardHeader>
        <CardContent className="p-6 pt-2 flex-grow flex flex-col justify-end">
            <div className="grid grid-cols-3 text-center border-t border-slate-100 dark:border-white/5 pt-4 mt-6">
                {stats.map(stat => (
                    <div key={stat.label} className="flex flex-col items-center border-r border-slate-100 dark:border-white/5 last:border-0 px-2">
                        <span className="text-xl font-bold text-blue-500 dark:text-[#50e1f9]">{stat.value}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">{stat.label}</span>
                    </div>
                ))}
            </div>
        </CardContent>
         <CardFooter className="bg-slate-50/50 dark:bg-[#060e20]/20 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-end group-hover:text-primary dark:group-hover:text-[#50e1f9] border-t border-slate-100/50 dark:border-white/5 transition-all">
            Start Test <ArrowRight className="h-4 w-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
        </CardFooter>
    </Card>
    </Link>
);


export default function CourseDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { user, loading } = useSession();
    const router = useRouter();

    const courseCode = params.courseCode as string;
    const courseName = searchParams.get('name') || 'Course';

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return (
            <div className="container mx-auto py-12 px-6 max-w-4xl space-y-8 animate-pulse">
                <Skeleton className="h-10 w-3/4"/>
                <Skeleton className="h-24 w-full" />
                <div className="flex flex-col md:flex-row gap-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                </div>
                 <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-transparent pb-16">
            <div className="container mx-auto py-12 px-6 max-w-4xl space-y-8">
                
                {/* Course Header Banner */}
                <div className="relative p-8 rounded-3xl bg-white/40 dark:bg-[#0f1930]/30 border border-slate-200/50 dark:border-white/5 shadow-sm dark:shadow-2xl backdrop-blur-xl overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#6ab2ff]/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-poppins text-slate-900 dark:text-white flex flex-wrap items-center gap-3">
                     {courseName}
                  </h1>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">Code: {courseCode} • SIMATS SUITE</p>
                </div>

                <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md p-6">
                    <CardHeader className="p-0 pb-4"><CardTitle className="text-lg font-bold font-poppins text-slate-800 dark:text-white">Course Information</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <DetailItem label="Course Code" value={courseCode} />
                        <DetailItem label="College" value={user?.college} />
                    </CardContent>
                </Card>

                <div>
                    <h2 className="text-xl font-bold font-poppins tracking-tight mb-4 text-slate-800 dark:text-white">Choose Your Preparation Mode</h2>
                    <div className="flex flex-col md:flex-row gap-6">
                        <PreparationModeCard title="Pass Mode" description="Quick revision with essential concepts and easy questions." href={`/courses/${courseCode}/prepare/pass?name=${encodeURIComponent(courseName)}`} badgeColor="bg-blue-500/10 text-blue-600 dark:bg-[#6ab2ff]/10 dark:text-[#6ab2ff]" />
                        <PreparationModeCard title="Master Mode" description="Comprehensive preparation with advanced concepts." href={`/courses/${courseCode}/prepare/master?name=${encodeURIComponent(courseName)}`} badgeColor="bg-emerald-500/10 text-emerald-600 dark:bg-[#50e1f9]/10 dark:text-[#50e1f9]" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                     <TestOptionCard
                        icon={<Pencil className="h-6 w-6" />}
                        title="MCQ Test"
                        href={`/courses/${courseCode}/mcq`}
                        badgeText="QUIZ"
                        description="Test your knowledge with multiple choice questions."
                        badgeColor="bg-amber-500/10 text-amber-600 dark:bg-[#ffb4ab]/10 dark:text-[#ffb4ab]"
                        stats={[
                            { value: '15', label: 'Questions' },
                            { value: '4', label: 'Options' },
                            { value: '15', label: 'Minutes' }
                        ]}
                    />

                    <TestOptionCard
                        icon={<Pen className="h-6 w-6" />}
                        title="Theory Questions"
                        href={`/courses/${courseCode}/theory`}
                        badgeText="THEORY"
                        description="Test your theoretical knowledge with descriptive questions."
                        badgeColor="bg-blue-500/10 text-blue-600 dark:bg-[#6ab2ff]/10 dark:text-[#6ab2ff]"
                        stats={[
                            { value: '15', label: 'Questions' },
                            { value: 'Text', label: 'Input' },
                            { value: <InfinityIcon className="h-5 w-5"/>, label: 'Time' }
                        ]}
                    />
                </div>

                <div>
                    <h2 className="text-xl font-bold font-poppins tracking-tight mb-4 text-slate-800 dark:text-white">Test History & Analytics</h2>
                     <Link href={`/courses/${courseCode}/history`} className="group block">
                        <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md p-6 transform transition-all duration-300 hover:scale-[1.01] hover:border-[#6ab2ff]/50 dark:hover:border-[#6ab2ff]/40">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#060e20]/60 shrink-0 text-blue-500 dark:text-[#50e1f9]">
                                        <History className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold font-poppins text-slate-800 dark:text-white">View Test History</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Review your past performance and analytics.</p>
                                    </div>
                                </div>
                                 <div className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-[#6ab2ff] dark:group-hover:text-[#50e1f9] transition-all">
                                    View <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Card>
                     </Link>
                </div>
            </div>
        </div>
    );
}
