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
import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/context/SessionContext';
import { useRouter } from 'next/navigation';

const formSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const { user } = useSession();
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to change your password.',
      });
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_number: user.student_number,
          current_password: values.currentPassword,
          new_password: values.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Password Changed Successfully!',
          description: 'Your password has been updated.',
        });
        router.push('/profile');
      } else {
        toast({
          variant: 'destructive',
          title: 'Password Change Failed',
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

  const PasswordInput = ({
    name,
    label,
    show,
    toggleShow,
  }: {
    name: 'currentPassword' | 'newPassword' | 'confirmPassword';
    label: string;
    show: boolean;
    toggleShow: () => void;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                {...field}
              />
              <button
                type="button"
                onClick={toggleShow}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {show ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-cyan-500/10 bg-[mask-image:linear-gradient(to_bottom,white_5%,transparent_100%)] dark:bg-grid-cyan-500/10 dark:bg-[mask-image:linear-gradient(to_bottom,black_5%,transparent_100%)]"></div>
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-secondary/50 rounded-xl z-10">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-max">
            <KeyRound className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl mt-4">Change Your Password</CardTitle>
          <CardDescription>Update your password for better security.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PasswordInput
                name="currentPassword"
                label="Current Password"
                show={showCurrentPassword}
                toggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
              />
              <PasswordInput
                name="newPassword"
                label="New Password"
                show={showNewPassword}
                toggleShow={() => setShowNewPassword(!showNewPassword)}
              />
              <PasswordInput
                name="confirmPassword"
                label="Confirm New Password"
                show={showConfirmPassword}
                toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg shadow-[0_0_15px] shadow-primary/50 transition-shadow"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Update Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
