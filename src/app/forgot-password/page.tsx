
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formSchema = z.object({
  student_number: z.string().min(1, { message: 'Student number is required.' }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_number: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_number: values.student_number,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Request Sent',
          description: 'If an account with that student number exists, a password reset link has been sent to the associated email.',
        });
        router.push('/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'Request Failed',
          description: result.message || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not connect to the server. Please try again later.',
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-grid-cyan-500/10 bg-[mask-image:linear-gradient(to_bottom,white_5%,transparent_100%)] dark:bg-grid-cyan-500/10 dark:bg-[mask-image:linear-gradient(to_bottom,black_5%,transparent_100%)]"></div>
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-secondary/50 rounded-xl z-10">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-max">
            <Mail className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl mt-4">Forgot Password?</CardTitle>
          <CardDescription>Enter your student number to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="student_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Enter your student number" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg shadow-[0_0_15px] shadow-primary/50 transition-shadow"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <Button variant="ghost" asChild>
                <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
