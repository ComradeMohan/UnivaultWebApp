'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Megaphone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Notice = {
  title: string;
  description: string;
  schedule_date: string;
  schedule_time: string;
  is_high_priority: number;
};

export default function NotificationsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!user?.college) {
      setError('You must be logged in to view notifications.');
      setLoading(false);
      return;
    }

    async function fetchNotices() {
      try {
        const response = await fetch(`/api/get-notifications?college=${encodeURIComponent(user.college)}`);
        const result = await response.json();

        if (response.ok) {
          setNotices(result);
        } else {
          setError(result.message || 'Failed to fetch notifications.');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching notifications.');
      } finally {
        setLoading(false);
      }
    }

    fetchNotices();
  }, [user, sessionLoading]);
  
  const formatDate = (dateString: string, timeString: string) => {
    try {
        const date = new Date(`${dateString}T${timeString}`);
        return format(date, "MMMM d, yyyy 'at' h:mm a");
    } catch {
        return `${dateString} ${timeString}`;
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Notifications</h1>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">Notifications</h1>

        {notices.length === 0 ? (
            <Card className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl">
                <CardContent className="p-6">
                    <p className="text-muted-foreground text-center">You have no new notifications.</p>
                </CardContent>
            </Card>
        ) : (
            <div className="space-y-6">
            {notices.map((notice, index) => (
                <Card key={index} className={`bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl transition-all hover:shadow-lg ${notice.is_high_priority ? 'border-primary' : ''}`}>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle className="text-xl">{notice.title}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(notice.schedule_date, notice.schedule_time)}</span>
                            </CardDescription>
                        </div>
                        {notice.is_high_priority === 1 && <Megaphone className="h-6 w-6 text-primary" />}
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{notice.description}</p>
                    </CardContent>
                </Card>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}
