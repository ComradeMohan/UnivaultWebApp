'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Hash, GraduationCap, Calendar, KeyRound, Mail, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AchievementsDisplay from './_components/achievements-display';

type StudentData = {
  full_name: string;
  student_number: string;
  email: string;
  department: string;
  year_of_study: string;
  college: string;
};

export default function ProfilePage() {
  const { user, loading: sessionLoading } = useSession();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!user?.student_number) {
      setError('You must be logged in to view this page.');
      setLoading(false);
      return;
    }

    async function fetchStudentData() {
      try {
        const response = await fetch(`/api/get-student?student_number=${user.student_number}`);
        const result = await response.json();

        if (result.success) {
          setStudentData(result.data);
        } else {
          setError(result.message || 'Failed to fetch student data.');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching your data.');
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [user, sessionLoading]);

  const ProfileDetail = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => (
    <div className="flex items-center space-x-4 border-b border-white/10 pb-4 last:border-b-0">
      <Icon className="h-5 w-5 text-primary" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || 'N/A'}</p>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl animate-pulse">
        <Card className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl">
          <CardHeader className="flex flex-col items-center text-center p-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-8 w-48 mt-4" />
            <Skeleton className="h-4 w-56 mt-2" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter className="p-6 border-t border-white/10">
            <Skeleton className="h-10 w-40" />
          </CardFooter>
        </Card>
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

  if (!studentData) {
    return null; // Or another loading/empty state
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8">
        <Card className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl shadow-lg">
          <CardHeader className="flex flex-col items-center text-center p-6">
             <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-lg">
              <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${studentData.full_name}`} alt={studentData.full_name} />
              <AvatarFallback className="text-3xl">{studentData.full_name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold">{studentData.full_name}</CardTitle>
            <p className="text-muted-foreground mt-1">{studentData.email}</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             <ProfileDetail icon={Hash} label="Register Number" value={studentData.student_number} />
             <ProfileDetail icon={School} label="College" value={studentData.college} />
             <ProfileDetail icon={GraduationCap} label="Department" value={studentData.department} />
             <ProfileDetail icon={Calendar} label="Year of Study" value={studentData.year_of_study} />
          </CardContent>
          <CardFooter className="p-6 border-t border-white/10">
              <Button asChild variant="outline">
                <Link href="/profile/change-password">
                  <KeyRound className="mr-2 h-4 w-4" /> Change Password
                </Link>
              </Button>
          </CardFooter>
        </Card>

        <AchievementsDisplay />

      </div>
    </div>
  );
}
