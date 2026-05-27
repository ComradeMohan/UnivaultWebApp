'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, Clock, BarChart } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type TestInfo = {
  test_result_id: number;
  course_code: string;
  course_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken: number;
  test_date: string;
};

type QuestionReview = {
  question_id: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  selected_answer: number;
  is_correct: boolean;
};

type ReviewData = {
  test_info: TestInfo;
  questions: QuestionReview[];
};

export default function TestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!testId) return;

    async function fetchReviewData() {
      try {
        const response = await fetch(`/api/get-mcq-test-review?test_result_id=${testId}`);
        const result = await response.json();

        if (result.success) {
          setReviewData(result);
        } else {
          setError(result.message || 'Failed to parse review data.');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching the test review.');
      } finally {
        setLoading(false);
      }
    }

    fetchReviewData();
  }, [testId]);

  if (loading) {
    return <ReviewSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Review</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  if (!reviewData) {
    return (
       <div className="container mx-auto py-12 px-4 max-w-3xl">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No review data available for this test.
            </CardContent>
          </Card>
       </div>
    );
  }
  
  const { test_info, questions } = reviewData;

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8">
        <header className="relative">
             <Button variant="ghost" size="sm" className="absolute -top-4 -left-4" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-4xl font-bold tracking-tight text-foreground text-center">Test Review</h1>
            <p className="text-lg text-muted-foreground mt-2 text-center">
              {test_info.course_name} - {format(parseISO(test_info.test_date), 'PPpp')}
            </p>
        </header>

        <Card>
            <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold text-primary">{test_info.score}/{test_info.total_questions}</span>
                    <span className="text-sm text-muted-foreground mt-1">SCORE</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold text-primary">{test_info.percentage}%</span>
                    <span className="text-sm text-muted-foreground mt-1">ACCURACY</span>
                </div>
                 <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold text-primary">{test_info.time_taken}s</span>
                    <span className="text-sm text-muted-foreground mt-1">TIME TAKEN</span>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Question Breakdown</CardTitle>
                <CardDescription>Review each question and your answer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {questions.map((q, index) => (
                    <div key={q.question_id} className="border-t pt-4">
                        <p className="font-semibold mb-4">{index + 1}. {q.question_text}</p>
                        <div className="space-y-2">
                            {q.options.map((option, optIndex) => {
                                const isCorrect = (optIndex + 1) === q.correct_answer;
                                const isSelected = optIndex === q.selected_answer;
                                
                                return (
                                    <div 
                                        key={optIndex}
                                        className={`p-3 border rounded-md flex items-start text-sm
                                            ${isCorrect ? 'bg-green-100/80 dark:bg-green-900/30 border-green-300 dark:border-green-700' : ''}
                                            ${isSelected && !isCorrect ? 'bg-red-100/80 dark:bg-red-900/30 border-red-300 dark:border-red-700' : ''}
                                        `}
                                    >
                                        {isCorrect ? <CheckCircle className="h-5 w-5 mr-3 text-green-600 flex-shrink-0"/> : null}
                                        {isSelected && !isCorrect ? <XCircle className="h-5 w-5 mr-3 text-red-600 flex-shrink-0"/> : null}
                                        {!isCorrect && !isSelected ? <div className="w-5 h-5 mr-3 flex-shrink-0"></div> : null}

                                        <span className="flex-1">{option}</span>
                                        {isSelected && <Badge variant="secondary" className="ml-4">Your Answer</Badge>}
                                        {isCorrect && <Badge variant="default" className="ml-4 bg-green-600">Correct</Badge>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


const ReviewSkeleton = () => (
    <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8 animate-pulse">
        <header className="text-center">
            <Skeleton className="h-10 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-2/3 mx-auto mt-3" />
        </header>
        <Skeleton className="h-36 w-full" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-t pt-4">
                        <Skeleton className="h-6 w-full mb-4" />
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
)
