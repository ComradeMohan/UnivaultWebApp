'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Percent, CheckCircle, BarChart, FileSearch } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type TestAttempt = {
  id: number;
  test_type: 'MCQ' | 'Theory';
  test_date: string;
  total_score: number;
  total_questions: number;
  percentage: string;
};

type Statistics = {
    total_tests: number;
    average_score: number;
    best_score: string;
}

export default function TestHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const courseCode = params.courseCode as string;

  const [history, setHistory] = useState<TestAttempt[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;

    if (!user?.student_number) {
      setError('You must be logged in to view test history.');
      setLoading(false);
      return;
    }

    async function fetchHistory() {
      const url = `/api/get-test-history?student_id=${user.student_number}&course_id=${courseCode}`;
      try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.success && Array.isArray(result.test_history) && result.statistics) {
          const sortedData = result.test_history.sort((a: TestAttempt, b: TestAttempt) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());
          setHistory(sortedData);
          setStatistics(result.statistics);
        } else {
          setError(result.message || `Failed to parse history data from ${url}`);
        }
      } catch (err) {
        setError(`An unexpected error occurred while fetching your test history from ${url}`);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [courseCode, user, sessionLoading]);
  
  const formattedChartData = history.map((attempt, index) => ({
    name: `Test ${index + 1}`,
    score: parseFloat(attempt.percentage),
    date: format(parseISO(attempt.test_date), 'MMM d'),
  }));

  const summaryStats = {
    totalTests: statistics?.total_tests ?? 0,
    averageScore: statistics?.average_score.toFixed(1) ?? 0,
    highestScore: parseFloat(statistics?.best_score ?? '0').toFixed(1),
  };
  
  const getGrade = (percentage: number): { grade: string, color: string } => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-500' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-500' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-500' };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-500' };
  };


  if (loading) {
    return <HistorySkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
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

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Test History</h1>
                <p className="text-lg text-muted-foreground mt-2">Your performance analytics for course: {courseCode}</p>
            </header>

            {history.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        You have not attempted any tests for this course yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                     <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tests Taken</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryStats.totalTests}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                                <Percent className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryStats.averageScore}%</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryStats.highestScore}%</div>
                            </CardContent>
                        </Card>
                    </div>


                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Score Progression</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="h-[250px] w-full">
                                <ResponsiveContainer>
                                    <LineChart data={formattedChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%"/>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: 'var(--radius)',
                                            }}
                                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
                                        />
                                        <Line type="monotone" dataKey="score" name="Score" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed History</CardTitle>
                            <CardDescription>A log of all your test attempts for this course.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Test Type</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Accuracy</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead className="text-right">Review</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.slice().reverse().map((attempt) => {
                                        const percentage = parseFloat(attempt.percentage);
                                        const gradeInfo = getGrade(percentage);
                                        const reviewPath = attempt.test_type === 'MCQ' 
                                            ? `/courses/${courseCode}/history/${attempt.id}`
                                            : `/courses/${courseCode}/history/theory/${attempt.id}`;
                                        return (
                                            <TableRow key={attempt.id}>
                                                <TableCell className="font-medium">{format(parseISO(attempt.test_date), 'PPpp')}</TableCell>
                                                <TableCell>
                                                    <Badge variant={attempt.test_type === 'MCQ' ? 'default' : 'secondary'}>
                                                        {attempt.test_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{attempt.total_score} / {attempt.total_questions}</TableCell>
                                                <TableCell>{percentage.toFixed(1)}%</TableCell>
                                                <TableCell className={`font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => router.push(reviewPath)}
                                                    >
                                                        <FileSearch className="h-4 w-4 mr-2"/>
                                                        Review
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    </div>
  );
}


const HistorySkeleton = () => (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
        <header className="mb-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/2 mt-3" />
        </header>
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    </div>
);
