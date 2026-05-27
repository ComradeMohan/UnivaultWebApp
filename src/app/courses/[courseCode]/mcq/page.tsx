'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from '@/components/ui/progress';
import { useSession } from '@/context/SessionContext';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type Question = {
  question_id: number;
  question_text: string;
  options: string[];
  correct_answer: number; // This is 1-indexed
};

type UserAnswer = {
  questionId: number;
  selectedOption: number; // 0-indexed
};

const TOTAL_TIME = 15 * 60; // 15 minutes in seconds

export default function MCQTestPage() {
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
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(`/api/get-mcq-questions?course_id=${courseCode}`);
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

  useEffect(() => {
    if (loading || isFinished) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isFinished]);

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

  const handleAnswerSelect = (optionIndex: number) => {
    const questionId = questions[currentQuestionIndex].question_id;
    const existingAnswerIndex = userAnswers.findIndex(a => a.questionId === questionId);
    
    const newAnswer: UserAnswer = { questionId, selectedOption: optionIndex };

    if (existingAnswerIndex > -1) {
      const updatedAnswers = [...userAnswers];
      updatedAnswers[existingAnswerIndex] = newAnswer;
      setUserAnswers(updatedAnswers);
    } else {
      setUserAnswers([...userAnswers, newAnswer]);
    }
  };
  
  const score = useMemo(() => {
    return userAnswers.reduce((correctCount, answer) => {
        const question = questions.find(q => q.question_id === answer.questionId);
        if (question && (answer.selectedOption + 1) === question.correct_answer) {
            return correctCount + 1;
        }
        return correctCount;
    }, 0);
  }, [userAnswers, questions]);

  const handleSubmit = useCallback(async () => {
    if (isFinished) return;
    setIsFinished(true);

    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to save your results.",
        });
        return;
    }
    
    setIsSaving(true);
    const answersObject = userAnswers.reduce((acc, ans) => {
        acc[ans.questionId] = ans.selectedOption;
        return acc;
    }, {} as Record<number, number>);

    const resultData = {
        student_id: user.student_number,
        course_code: courseCode,
        score: score,
        total_questions: questions.length,
        time_taken: TOTAL_TIME - timeLeft,
        answers: answersObject,
    };

    try {
        const response = await fetch('/api/save-mcq-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData),
        });

        const result = await response.json();
        if (result.success) {
            toast({
                title: "Results Saved!",
                description: "Your test results have been successfully saved.",
            });
        } else {
            throw new Error(result.message || "Failed to save results.");
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: error.message || "An error occurred while saving your results.",
        });
    } finally {
        setIsSaving(false);
    }
  }, [isFinished, user, courseCode, score, questions.length, timeLeft, userAnswers, toast]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || sessionLoading) {
    return <QuizSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Quiz</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
           <Button asChild variant="secondary" className="mt-4">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = userAnswers.find(a => a.questionId === currentQuestion?.question_id)?.selectedOption;

  if (isFinished) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
                <CardDescription>Here's how you did.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex justify-around text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-bold text-primary">{score} / {questions.length}</span>
                        <span className="text-sm text-muted-foreground">SCORE</span>
                    </div>
                     <div className="flex flex-col items-center">
                        <span className="text-4xl font-bold text-primary">{questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%</span>
                        <span className="text-sm text-muted-foreground">ACCURACY</span>
                    </div>
                </div>
                 {isSaving && (
                    <div className="flex items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Saving your results...</span>
                    </div>
                )}
                <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                    {questions.map((q, index) => {
                        const userAnswer = userAnswers.find(a => a.questionId === q.question_id);
                        const isCorrect = userAnswer && (userAnswer.selectedOption + 1) === q.correct_answer;
                        return (
                            <div key={q.question_id} className="text-sm border-b pb-2">
                                <p className="font-semibold">{index + 1}. {q.question_text}</p>
                                {isCorrect ? (
                                    <p className="text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-2"/> Correct: {q.options[q.correct_answer - 1]}</p>
                                ) : (
                                    <>
                                    <p className="text-red-600 flex items-center"><XCircle className="h-4 w-4 mr-2"/> Your Answer: {userAnswer ? q.options[userAnswer.selectedOption] : 'Not answered'}</p>
                                    <p className="text-green-600">Correct Answer: {q.options[q.correct_answer - 1]}</p>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                 <Button onClick={() => router.push(`/courses/${courseCode}/history`)} className="w-full">View History</Button>
                 <Button onClick={() => router.back()} className="w-full" variant="outline">Back to Course</Button>
            </CardFooter>
        </Card>
      </div>
    )
  }
  
  if (questions.length === 0) {
      return (
           <div className="container mx-auto py-12 px-4 max-w-2xl">
               <Card>
                   <CardContent className="p-6 text-center">
                       <p className="text-muted-foreground">No questions available for this course yet.</p>
                       <Button onClick={() => router.back()} className="mt-4">Back to Course</Button>
                   </CardContent>
               </Card>
           </div>
      )
  }


  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>MCQ Test: {courseCode}</CardTitle>
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Clock className="h-5 w-5"/>
                <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="space-y-2">
              <Progress value={(currentQuestionIndex + 1) / questions.length * 100} />
              <p className="text-sm text-muted-foreground text-center">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
        </CardHeader>
        <CardContent>
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.question_text}</h2>
            <RadioGroup onValueChange={(value) => handleAnswerSelect(parseInt(value, 10))} value={selectedOption !== undefined ? String(selectedOption) : ''}>
                {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:border-accent has-[:checked]:shadow-sm transition-all">
                        <RadioGroupItem value={String(index)} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                    </div>
                ))}
            </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</Button>
            {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNext} disabled={selectedOption === undefined}>Next</Button>
            ) : (
                <Button onClick={handleSubmit} disabled={isFinished || selectedOption === undefined}>Submit</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}

const QuizSkeleton = () => (
  <div className="container mx-auto py-12 px-4 max-w-2xl">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/6" />
        </div>
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-full mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  </div>
);
