'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from '@/context/SessionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Clock, Download, University, AlertTriangle, Book, Award, Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TranscriptTemplate, type Course, type User, type Stats } from '@/components/layout/transcript';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { grantAchievement } from '@/lib/achievements';
import { useToast } from '@/hooks/use-toast';


type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';
type GradeInfo = { grade: Grade, percentage: number, color: string };

const gradePointMap: Record<Grade, number> = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, U: 0 };
const TOTAL_COURSES = 32;

export default function GradesPage() {
    const router = useRouter();
    const { user, loading: sessionLoading } = useSession();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const transcriptRef = useRef<HTMLDivElement>(null);


    const handleDownloadTranscript = async () => {
        if (!transcriptRef.current || !user) return;
        setIsDownloading(true);

        const canvas = await html2canvas(transcriptRef.current, {
            scale: 2, // Higher scale for better quality
            backgroundColor: '#ffffff', // Set a white background for the canvas
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`transcript-${user.student_number}.pdf`);
        setIsDownloading(false);
    };

    useEffect(() => {
        if (sessionLoading) return;
        if (!user) {
            setError("You need to be logged in to view grades.");
            setLoading(false);
            return;
        }

        async function fetchGrades() {
            const url = `/api/get-completed-grades?department_id=1&student_id=${user.student_number}`;
            try {
                const response = await fetch(url);
                const result = await response.json();

                if (result.success && Array.isArray(result.courses)) {
                    setCourses(result.courses);
                    // Grant achievement on successful fetch
                    if (auth?.currentUser && firestore) {
                        const achievement = await grantAchievement(firestore, auth.currentUser.uid, 'grade_explorer');
                        if (achievement) {
                            toast({
                                title: 'Achievement Unlocked!',
                                description: `You've earned the "${achievement.name}" badge!`,
                            });
                        }
                    }
                } else {
                    setError(`${result.message || "Failed to parse grade data."} (URL: ${url})`);
                }
            } catch (err) {
                setError(`An unexpected error occurred while fetching grades. (URL: ${url})`);
            } finally {
                setLoading(false);
            }
        }

        fetchGrades();
    }, [user, sessionLoading, auth, firestore, toast]);

    const stats: Stats = React.useMemo(() => {
        if (courses.length === 0) {
            return {
                cgpa: 0,
                completedCourses: 0,
                pendingCourses: TOTAL_COURSES,
                degreeProgress: 0,
                gradeDistribution: [
                    { grade: 'S', percentage: 0, color: 'text-blue-400' },
                    { grade: 'A', percentage: 0, color: 'text-green-400' },
                    { grade: 'B', percentage: 0, color: 'text-yellow-400' },
                    { grade: 'C', percentage: 0, color: 'text-orange-400' },
                    { grade: 'D', percentage: 0, color: 'text-red-400' },
                    { grade: 'E', percentage: 0, color: 'text-red-500' },
                ],
            };
        }

        let totalCredits = 0;
        let totalPoints = 0;
        const gradeCounts: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, U: 0 };

        courses.forEach(course => {
            const credits = parseInt(course.credits, 10);
            const grade = course.grade.trim() as Grade;
            if (!isNaN(credits) && gradePointMap[grade] !== undefined) {
                totalCredits += credits;
                totalPoints += credits * gradePointMap[grade];
                if (gradeCounts[grade] !== undefined) {
                    gradeCounts[grade]++;
                }
            }
        });

        const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
        const completedCourses = courses.length;

        const gradeDistribution: GradeInfo[] = (Object.keys(gradePointMap) as Grade[]).map(grade => {
            const count = gradeCounts[grade] || 0;
            const percentage = completedCourses > 0 ? (count / completedCourses) * 100 : 0;
            let color = 'text-gray-400';
            if (grade === 'S') color = 'text-blue-400';
            else if (grade === 'A') color = 'text-green-400';
            else if (grade === 'B') color = 'text-yellow-400';
            else if (grade === 'C') color = 'text-orange-400';
            else if (grade === 'D') color = 'text-red-400';
            else if (grade === 'E') color = 'text-red-500';
            return { grade, percentage, color };
        }).filter(item => item.grade !== 'U');


        return {
            cgpa,
            completedCourses,
            pendingCourses: TOTAL_COURSES - completedCourses,
            degreeProgress: (completedCourses / TOTAL_COURSES) * 100,
            gradeDistribution,
        };
    }, [courses]);

    if (loading) {
        return <GradesSkeleton />;
    }

    if (error) {
        return (
            <div className="container mx-auto py-12 px-4 max-w-2xl">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button asChild variant="secondary" className="mt-4">
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                </Alert>
            </div>
        );
    }
    
    const getGradeColor = (grade: Grade) => {
        const gradeInfo = stats.gradeDistribution.find(g => g.grade === grade);
        return gradeInfo ? gradeInfo.color.replace('text-', 'bg-').replace('-400', '-500/20') + ` border-${gradeInfo.color.replace('text-', '')}/30` : 'bg-gray-500/20';
    };


    return (
        <div className="min-h-[calc(100vh-4rem)] bg-transparent pb-16">
            <div className="absolute -left-[9999px] -top-[9999px]">
                <TranscriptTemplate ref={transcriptRef} user={user} courses={courses} stats={stats} />
            </div>
            <div className="container mx-auto py-12 px-6 max-w-6xl space-y-8">
                 
                 {/* Page Header Banner */}
                 <header className="relative flex items-center p-8 rounded-3xl bg-white/40 dark:bg-[#0f1930]/30 border border-slate-200/50 dark:border-white/5 shadow-sm dark:shadow-2xl backdrop-blur-xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#6ab2ff]/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
                    <Button variant="ghost" size="icon" className="absolute left-6 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-[#50e1f9] hover:bg-slate-100 dark:hover:bg-white/5 rounded-full" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="w-full text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-poppins text-slate-900 dark:text-white flex justify-center items-center gap-2">
                             Academic Records
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">SIMATS SUITE • TRANSCRIPT CONSOLE</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* CGPA Card */}
                    <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md overflow-hidden relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#6ab2ff] to-[#00bcd3] opacity-0 group-hover:opacity-10 rounded-2xl blur transition-opacity duration-300"></div>
                        <CardContent className="p-6 text-center space-y-1 relative">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Current CGPA</p>
                            <p className="text-5xl font-extrabold font-poppins bg-gradient-to-r from-[#6ab2ff] to-[#00bcd3] bg-clip-text text-transparent drop-shadow-sm leading-tight">{stats.cgpa.toFixed(2)}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Scale (0.00 - 10.00)</p>
                        </CardContent>
                    </Card>

                    {/* Degree Progress */}
                     <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md p-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Degree Progress</h2>
                            <span className="text-sm font-bold text-blue-500 dark:text-[#50e1f9]">{stats.degreeProgress.toFixed(0)}%</span>
                        </div>
                        <Progress value={stats.degreeProgress} className="h-2.5 bg-slate-100 dark:bg-[#060e20]/60 [&>div]:bg-gradient-to-r [&>div]:from-[#6ab2ff] [&>div]:to-[#00bcd3] rounded-full"/>
                    </Card>

                    {/* Completion Grid */}
                    <div className="grid grid-cols-2 gap-4">
                         <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-emerald-500/20 rounded-2xl shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-md">
                            <CardContent className="p-5 text-center">
                                <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
                                <p className="text-3xl font-extrabold text-slate-855 dark:text-white">{stats.completedCourses}</p>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Completed</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-orange-500/20 rounded-2xl shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-md">
                            <CardContent className="p-5 text-center">
                                <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
                                <p className="text-3xl font-extrabold text-slate-855 dark:text-white">{stats.pendingCourses}</p>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Pending</p>
                            </CardContent>
                        </Card>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    {/* Grade Distribution */}
                    <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold font-poppins text-slate-800 dark:text-white">Grade Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            {stats.gradeDistribution.map(item => (
                                <div key={item.grade} className="flex items-center gap-4">
                                    <span className={`w-4 font-bold text-sm ${item.color}`}>{item.grade}</span>
                                    <Progress value={item.percentage} className="flex-1 h-2 bg-slate-100 dark:bg-[#060e20]/60 [&>div]:bg-gradient-to-r [&>div]:from-[#6ab2ff] [&>div]:to-[#00bcd3] rounded-full"/>
                                    <span className={`w-10 text-right text-xs font-bold tracking-tight ${item.color}`}>{item.percentage.toFixed(0)}%</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* PDF Generation Button */}
                    <Button onClick={handleDownloadTranscript} disabled={isDownloading} className="w-full h-12 text-sm bg-slate-900 text-white dark:liquid-gradient dark:text-slate-900 font-bold rounded-xl shadow-[0_4px_20px_rgba(106,178,255,0.15)] dark:shadow-[0_4px_20px_rgba(0,188,211,0.25)] hover:scale-[1.01] hover:glow-active transition-all duration-300">
                         {isDownloading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-5 w-5" />
                          )}
                        {isDownloading ? 'Generating PDF...' : 'Download Official Transcript'}
                    </Button>
                  </div>
                </div>

                {courses.length > 0 ? (
                    <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-bold font-poppins text-slate-800 dark:text-white">Completed Courses</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                                        <TableHead className="px-6 py-4 font-bold text-slate-400 dark:text-slate-500"><Book className="inline h-4 w-4 mr-2" /> Course Name</TableHead>
                                        <TableHead className="px-6 py-4 font-bold text-slate-400 dark:text-slate-500"><Star className="inline h-4 w-4 mr-2" /> Credits</TableHead>
                                        <TableHead className="px-6 py-4 font-bold text-slate-400 dark:text-slate-500 text-right"><Award className="inline h-4 w-4 mr-2" /> Grade</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map(course => (
                                        <TableRow key={course.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                                            <TableCell className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{course.name.trim()}</TableCell>
                                            <TableCell className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">{course.credits}</TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getGradeColor(course.grade.trim() as Grade)}`}>
                                                    {course.grade.trim()}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm backdrop-blur-md">
                      <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2.5 font-bold">
                            <University className="h-5 w-5 text-slate-400" />
                            No completed courses found
                      </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
}

const GradesSkeleton = () => (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6 animate-pulse">
        <header className="flex items-center relative mb-4">
             <Skeleton className="h-10 w-10 rounded-full" />
             <Skeleton className="h-8 w-48 mx-auto" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <Skeleton className="h-64 w-full rounded-xl" />
                 <Skeleton className="h-12 w-full rounded-xl" />
            </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
    </div>
);

    
