'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, BookOpen, Check, Hash, Lightbulb, MessageSquare, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

type AnswerReview = {
  answer_id: number;
  question_id: number;
  question_text: string;
  student_answer: string;
  marks_allocated: number;
  score_obtained: number;
  keywords_matched: string;
  keywords: string;
  complete_answer: string;
  difficulty_level: string;
  marks: number;
};

type TestSummary = {
  total_questions: number;
  total_marks: number;
  total_score: number;
  percentage: number;
  test_date: string;
};

type ReviewData = {
  success: boolean;
  test_result_id: number;
  answers: AnswerReview[];
  summary: TestSummary;
};

export default function TheoryTestReviewPage() {
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
        const response = await fetch(`/api/get-theory-test-review?test_result_id=${testId}`);
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
      <div className="container mx-auto py-12 px-4 max-w-4xl">
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
       <div className="container mx-auto py-12 px-4 max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No review data available for this theory test.
            </CardContent>
          </Card>
       </div>
    );
  }
  
  const { summary, answers } = reviewData;

  const getDifficultyColor = (level: string) => {
      switch(level.toLowerCase()) {
          case 'easy': return 'bg-green-500';
          case 'medium': return 'bg-yellow-500';
          case 'hard': return 'bg-red-500';
          default: return 'bg-gray-500';
      }
  }

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8">
        <header className="relative">
             <Button variant="ghost" size="sm" className="absolute -top-4 -left-4" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-4xl font-bold tracking-tight text-foreground text-center">Theory Test Review</h1>
            <p className="text-lg text-muted-foreground mt-2 text-center">
              Reviewed on {format(parseISO(summary.test_date), 'PPpp')}
            </p>
        </header>

        <Card>
            <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold text-primary">{summary.total_score}/{summary.total_marks}</span>
                    <span className="text-sm text-muted-foreground mt-1">TOTAL SCORE</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold text-primary">{summary.percentage}%</span>
                    <span className="text-sm text-muted-foreground mt-1">PERCENTAGE</span>
                </div>
                 <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold text-primary">{summary.total_questions}</span>
                    <span className="text-sm text-muted-foreground mt-1">QUESTIONS</span>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Answer Breakdown</CardTitle>
                <CardDescription>Review each question, your answer, and the ideal answer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {answers.map((q, index) => (
                    <div key={q.answer_id} className="border-t pt-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <p className="font-semibold text-lg flex-1 pr-4">{index + 1}. {q.question_text}</p>
                            <div className="flex flex-col items-end gap-2 text-right">
                                <Badge variant="outline">
                                    <Star className="h-3 w-3 mr-1" />
                                    {q.score_obtained} / {q.marks} Points
                                </Badge>
                                 <Badge className={`${getDifficultyColor(q.difficulty_level)}`}>
                                   {q.difficulty_level.charAt(0).toUpperCase() + q.difficulty_level.slice(1)}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Your Answer */}
                            <div className="space-y-2">
                                <h3 className="font-medium flex items-center"><MessageSquare className="h-4 w-4 mr-2 text-primary" />Your Answer</h3>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md min-h-[100px] whitespace-pre-wrap">{q.student_answer}</p>
                            </div>

                             {/* Ideal Answer */}
                            <div className="space-y-2">
                                <h3 className="font-medium flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Ideal Answer</h3>
                                <p 
                                    className="text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-md min-h-[100px] whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: q.complete_answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                />
                            </div>
                        </div>
                        
                        {q.keywords && (
                             <div className="space-y-2">
                                <h3 className="font-medium flex items-center"><Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />Keywords Matched</h3>
                                <div className="flex flex-wrap gap-2">
                                    {q.keywords_matched.split(', ').map((keyword, i) => (
                                        <Badge key={i} variant="secondary">{keyword}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
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
            <CardContent className="space-y-8">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="border-t pt-6 space-y-4">
                        <Skeleton className="h-6 w-full mb-4" />
                         <div className="grid md:grid-cols-2 gap-6">
                            <Skeleton className="h-24 w-full" />
                             <Skeleton className="h-24 w-full" />
                         </div>
                         <Skeleton className="h-8 w-1/2" />
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);
