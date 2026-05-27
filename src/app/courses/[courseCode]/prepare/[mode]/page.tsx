'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Topic = {
  topic_id: number;
  topic_name: string;
  content: string;
  difficulty: string;
};

export default function PreparationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseCode = params.courseCode as string;
  const mode = params.mode as string;
  const courseName = searchParams.get('name') || courseCode;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!courseCode || !mode) return;

    async function fetchTopics() {
      try {
        const response = await fetch(`/api/get-topics?course_code=${courseCode}&mode=${mode}`);
        const result = await response.json();

        if (Array.isArray(result)) {
          setTopics(result);
        } else {
          setError('Failed to parse topic data.');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching the topics.');
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, [courseCode, mode]);

  const getDifficultyColor = (level: string) => {
      switch(level?.toLowerCase()) {
          case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
          case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
          case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
          default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
  }

  if (loading) {
    return <PreparationSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Topics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8">
        <header className="relative">
             <Button variant="ghost" size="icon" className="absolute -top-4 -left-4" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold tracking-tight text-foreground text-center">
              {courseName}: {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
            </h1>
            <p className="text-lg text-muted-foreground mt-2 text-center">
              Study the topics below to prepare for your tests.
            </p>
        </header>

        {topics.length === 0 ? (
          <Card className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl">
            <CardContent className="p-6 text-center text-muted-foreground">
              No topics available for this mode yet.
            </CardContent>
          </Card>
        ) : (
           <Accordion type="single" collapsible className="w-full space-y-4">
            {topics.map((topic, index) => (
                <AccordionItem value={`item-${index}`} key={topic.topic_id} className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl px-4">
                    <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                           <span className="text-lg text-left">{topic.topic_name}</span>
                            <Badge variant="outline" className={`${getDifficultyColor(topic.difficulty)}`}>
                                {topic.difficulty}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div 
                            className="prose dark:prose-invert max-w-none p-2"
                            dangerouslySetInnerHTML={{ __html: topic.content }}
                        />
                    </AccordionContent>
                </AccordionItem>
            ))}
           </Accordion>
        )}
      </div>
    </div>
  );
}


const PreparationSkeleton = () => (
    <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8 animate-pulse">
        <header className="text-center">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto mt-3" />
        </header>
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
        </div>
    </div>
);
