'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, BookCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSession } from '@/context/SessionContext';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

type Question = {
  question_id: number;
  question_text: string;
};

type UserAnswer = {
  questionId: number;
  answerText: string;
};

export default function TheoryTestPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const courseCode = params.courseCode as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(`/api/get-theory-questions?course_id=${courseCode}`);
        const result = await response.json();
        
        if (result.success && Array.isArray(result.questions)) {
          setQuestions(result.questions);
        } else {
          setError(result.message || 'Failed to parse question data.');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching questions.');
      } finally {
        setLoading(false);
      }
    }
    if (!sessionLoading) {
        fetchQuestions();
    }
  }, [courseCode, sessionLoading]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswerChange = (answerText: string) => {
    const questionId = questions[currentQuestionIndex].question_id;
    const existingAnswerIndex = userAnswers.findIndex(a => a.questionId === questionId);
    
    const newAnswer: UserAnswer = { questionId, answerText };

    if (existingAnswerIndex > -1) {
      const updatedAnswers = [...userAnswers];
      updatedAnswers[existingAnswerIndex] = newAnswer;
      setUserAnswers(updatedAnswers);
    } else {
      setUserAnswers([...userAnswers, newAnswer]);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isFinished) return;
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to save your answers.',
      });
      return;
    }
    
    setIsSaving(true);

    const formattedAnswers = userAnswers.map(ua => ({
      question_id: ua.questionId,
      answer: ua.answerText,
    }));
    
    const resultData = {
        student_id: user.student_number,
        course_code: courseCode,
        answers: formattedAnswers,
    };

    try {
      const response = await fetch('/api/save-theory-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Test Submitted!',
          description: 'Your answers have been successfully saved.',
        });
        setIsFinished(true);
      } else {
        throw new Error(result.message || 'Failed to save answers.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'An error occurred while saving your answers.',
      });
    } finally {
        setIsSaving(false);
    }
  }, [isFinished, user, courseCode, userAnswers, toast]);

  if (loading || sessionLoading) {
    return <QuizSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Test</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </Alert>
      </div>
    );
  }
  
  if (isFinished) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Card className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Test Submitted!</CardTitle>
                <p className="text-muted-foreground">Here are the answers you provided.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                    {questions.map((q, index) => {
                        const userAnswer = userAnswers.find(a => a.questionId === q.question_id);
                        return (
                            <div key={q.question_id} className="text-sm border-b border-white/10 pb-4">
                                <p className="font-semibold mb-2">{index + 1}. {q.question_text}</p>
                                <p className="text-muted-foreground whitespace-pre-wrap bg-background/50 p-2 rounded-md">
                                    {userAnswer?.answerText || 'Not answered'}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                 <Button onClick={() => router.push(`/courses/${courseCode}/history`)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg shadow-[0_0_15px] shadow-primary/50 transition-shadow">View History</Button>
                 <Button onClick={() => router.back()} className="w-full" variant="outline">Back to Course</Button>
            </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion?.question_id)?.answerText || '';

  if (questions.length === 0) {
      return (
           <div className="container mx-auto py-12 px-4 max-w-2xl">
               <Card className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl">
                   <CardContent className="p-6 text-center">
                       <p className="text-muted-foreground">No theory questions available for this course yet.</p>
                       <Button onClick={() => router.back()} className="mt-4">Back to Course</Button>
                   </CardContent>
               </Card>
           </div>
      )
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>Theory Test: {courseCode}</CardTitle>
             <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <BookCheck className="h-5 w-5"/>
                <span>Theory Exam</span>
            </div>
          </div>
          <div className="space-y-2">
              <Progress value={(currentQuestionIndex + 1) / questions.length * 100} />
              <p className="text-sm text-muted-foreground text-center">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
        </CardHeader>
        <CardContent>
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.question_text}</h2>
            <Textarea 
                placeholder="Type your answer here..."
                className="min-h-[200px]"
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
            />
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</Button>
            {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNext} disabled={currentAnswer.trim() === ''}>Next</Button>
            ) : (
                <Button onClick={handleSubmit} disabled={isSaving || currentAnswer.trim() === ''} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px] shadow-primary/50 transition-shadow">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSaving ? 'Submitting...' : 'Submit Answers'}
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}

const QuizSkeleton = () => (
  <div className="container mx-auto py-12 px-4 max-w-3xl">
    <Card className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/6" />
        </div>
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-full mb-6" />
        <Skeleton className="h-48 w-full" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  </div>
);
