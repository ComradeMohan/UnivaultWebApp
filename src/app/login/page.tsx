'use client';

// Safeguard for Node.js 25+ where an experimental, incomplete global `localStorage` is defined on the server side
if (typeof window === 'undefined' && typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
  try {
    const localstorage = (globalThis as any).localStorage;
    if (!localstorage || typeof localstorage.getItem !== 'function') {
      delete (globalThis as any).localStorage;
    }
  } catch (e) {
    // Silently ignore deletion failures
  }
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Lock, Chrome, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useSession } from '@/context/SessionContext';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';

const formSchema = z.object({
  registerNumber: z.string().min(1, { message: 'Register number is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registerNumber: '',
      password: '',
    },
  });

  const handleSuccessfulLogin = async (studentNumber: string, college?: string, fullName?: string, email?: string) => {
    try {
      const studentResponse = await fetch(`/api/get-student?student_number=${studentNumber}`);
      const studentResult = await studentResponse.json();

      if (studentResult.success && studentResult.data) {
        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${studentResult.data.full_name.split(' ')[0]}!`,
        });
        login(studentResult.data);
        router.push('/dashboard');
      } else {
        const partialUser = {
          full_name: fullName || 'Student',
          email: email || 'student@example.com',
          student_number: studentNumber,
          college: college || 'University',
        };
        login(partialUser);
        toast({
          title: 'Login Successful!',
          description: `Welcome back!`,
        });
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Profile Fetch Failed',
        description: "Logged in, but couldn't fetch your profile details.",
      });
      const partialUser = {
        full_name: fullName || 'Student',
        email: email || 'student@example.com',
        student_number: studentNumber,
        college: college || 'University',
      };
      login(partialUser);
      router.push('/dashboard');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const loginResponse = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registerNumber: values.registerNumber,
          password: values.password,
        }),
      });

      const loginResult = await loginResponse.json();

      if (loginResult.success) {
        await handleSuccessfulLogin(values.registerNumber, loginResult.college);
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: loginResult.message || 'Invalid credentials. Please try again.',
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

  const handleGoogleSignIn = async () => {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Google Sign-In is not ready. Please try again in a moment.'
      });
      return;
    }

    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser: FirebaseUser = result.user;

      const googleLoginResponse = await fetch('/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          user_id: firebaseUser.uid,
          name: firebaseUser.displayName,
        })
      });

      const googleLoginResult = await googleLoginResponse.json();

      if (googleLoginResult.success && googleLoginResult.student_number) {
        await handleSuccessfulLogin(googleLoginResult.student_number, googleLoginResult.college, firebaseUser.displayName || undefined, firebaseUser.email || undefined);
      } else {
        toast({
          variant: 'destructive',
          title: 'Google Login Failed',
          description: googleLoginResult.message || 'Could not log you in with Google.'
        });
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Error',
        description: error.message || 'An unexpected error occurred during Google Sign-In.'
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-obsidian-mesh text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[60%] h-[60%] bg-[#6ab2ff]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#00bcd3]/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* Floating Home Link */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-[#50e1f9] hover:translate-x-[-2px] transition-all duration-300 z-20">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md z-10">
        
        {/* Core Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex flex-col items-center group">
            <div className="relative p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(106,178,255,0.2)] transition-all duration-500">
              <Image src="/images/logo.png" alt="UniVault Logo" width={64} height={64} priority unoptimized />
            </div>
            <h1 className="text-xl font-bold font-poppins mt-4 text-white tracking-widest uppercase">
              UniVault
            </h1>
          </Link>
          <h2 className="text-2xl font-bold mt-6 text-white font-poppins">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1.5">Sign in to initialize your session</p>
        </div>

        {/* Premium Form Glass Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,188,211,0.08)] w-full bg-[#0f1930]/45 backdrop-blur-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Register Number Input */}
              <FormField
                control={form.control}
                name="registerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#50e1f9] transition-colors" />
                        <Input 
                          placeholder="Enter your Register No" 
                          {...field} 
                          className="pl-12 pr-4 py-6 bg-[#060e20]/90 text-white rounded-2xl border border-white/10 focus-visible:border-[#50e1f9] focus-visible:ring-2 focus-visible:ring-[#50e1f9]/20 transition-all font-medium placeholder-slate-500" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-400 font-medium pl-2" />
                  </FormItem>
                )}
              />

              {/* Password Input */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#50e1f9] transition-colors" />
                        <Input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Password" 
                          {...field} 
                          className="pl-12 pr-12 py-6 bg-[#060e20]/90 text-white rounded-2xl border border-white/10 focus-visible:border-[#50e1f9] focus-visible:ring-2 focus-visible:ring-[#50e1f9]/20 transition-all font-medium placeholder-slate-500" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    
                    <div className="flex justify-end pt-1 pr-1">
                      <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-[#50e1f9] hover:underline transition-colors">
                        Forgot Password?
                      </Link>
                    </div>
                    <FormMessage className="text-xs text-red-400 font-medium pl-2" />
                  </FormItem>
                )}
              />
              
              {/* Form Submit Button */}
              <Button 
                type="submit" 
                className="w-full liquid-gradient text-slate-900 font-bold py-3.5 rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(106,178,255,0.4)] transition-all duration-300 text-base" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-900" /> Authenticating...
                  </span>
                ) : 'Login'}
              </Button>
            </form>
          </Form>

          {/* Separation Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-slate-500 text-xs font-bold tracking-wider">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google College Mail Sign In Button */}
          <button 
            type="button"
            className="w-full glass-panel flex items-center justify-center gap-3 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] transition-all py-3.5 px-6 rounded-2xl border border-white/10 font-bold text-sm text-slate-200" 
            onClick={handleGoogleSignIn} 
            disabled={isGoogleLoading}
          >
             {isGoogleLoading ? (
               <Loader2 className="h-5 w-5 animate-spin text-[#50e1f9]" />
             ) : (
               <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
               </svg>
             )}
             {isGoogleLoading ? 'Signing In...' : 'Login with College Mail'}
          </button>
        </div>

        {/* Redirect Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-[#6ab2ff] hover:text-[#50e1f9] hover:underline transition-colors pl-1">
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}
