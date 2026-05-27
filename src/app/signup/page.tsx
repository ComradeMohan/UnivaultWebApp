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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Hash, Mail, Lock, School, GraduationCap, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';

const formSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'Full name must be at least 2 characters.' })
      .regex(/^[a-zA-Z\s]*$/, {
        message: 'Full name should contain alphabets and spaces only',
      }),
    registerNumber: z.string().min(1, { message: 'Register number is required.' }),
    collegeEmail: z.string().email({ message: 'Invalid college email address.' }).refine(
      (email) => email.endsWith('@saveetha.com'),
      {
        message: 'Email must be a @saveetha.com address.',
      }
    ),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
    selectCollege: z.string().min(1, {message: 'Please select a college.'}),
    department: z.string().min(1, {message: 'Please select a department.'}),
    yearOfStudy: z.string().min(1, {message: 'Please select a year.'}),
  });

type College = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
  college_id: string;
};

export default function SignupPage() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);

  useEffect(() => {
    async function fetchColleges() {
      try {
        const response = await fetch('/api/get-colleges');
        const data = await response.json();
        if (data.success && Array.isArray(data.colleges)) {
          setColleges(data.colleges);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load colleges.",
          });
        }
      } catch (error) {
        console.error("Failed to fetch colleges:", error);
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Could not fetch the list of colleges.",
        });
      }
    }

    fetchColleges();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      registerNumber: '',
      collegeEmail: '',
      password: '',
      selectCollege: '',
      department: '',
      yearOfStudy: '',
    },
  });

  useEffect(() => {
    async function fetchDepartments() {
      if (!selectedCollegeId) {
        setDepartments([]);
        return;
      }
      setIsDepartmentsLoading(true);
      try {
        const response = await fetch(`/api/get-departments?collegeId=${selectedCollegeId}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.departments)) {
          setDepartments(data.departments);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: data.message || 'Could not load departments for the selected college.',
          });
          setDepartments([]);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Could not fetch departments.",
        });
        setDepartments([]);
      } finally {
        setIsDepartmentsLoading(false);
      }
    }

    fetchDepartments();
  }, [selectedCollegeId, toast]);

  function handleCollegeChange(collegeName: string) {
    const selected = colleges.find(c => c.name === collegeName);
    setSelectedCollegeId(selected ? selected.id : null);
    form.setValue('department', ''); // Reset department on college change
    form.setValue('selectCollege', collegeName);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(
        '/api/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: values.fullName,
            student_number: values.registerNumber,
            email: values.collegeEmail,
            password: values.password,
            college: values.selectCollege,
            department: values.department,
            year_of_study: values.yearOfStudy,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Registration Successful!',
          description:
            'You have been registered successfully. Please check your email to verify your account.',
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description:
            result.message || 'An unexpected error occurred. Please try again.',
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
    <div className="bg-obsidian-mesh text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[60%] h-[60%] bg-[#6ab2ff]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00bcd3]/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* Floating Home Link */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-[#50e1f9] hover:translate-x-[-2px] transition-all duration-300 z-20">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-lg z-10 py-8">
        
        {/* Core Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="flex flex-col items-center group">
            <div className="relative p-2.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(106,178,255,0.2)] transition-all duration-500">
              <Image src="/images/logo.png" alt="UniVault Logo" width={56} height={56} priority unoptimized />
            </div>
            <h1 className="text-lg font-bold font-poppins mt-3 text-white tracking-widest uppercase">
              UniVault
            </h1>
          </Link>
          <h2 className="text-2xl font-bold mt-5 text-white font-poppins">Create Student Account</h2>
          <p className="text-sm text-slate-400 mt-1.5">Join the UniVault academic community</p>
        </div>

        {/* Premium Form Glass Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,188,211,0.08)] w-full bg-[#0f1930]/45 backdrop-blur-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#50e1f9] transition-colors" />
                        <Input 
                          placeholder="Full Name *" 
                          {...field} 
                          className="pl-12 pr-4 py-6 bg-[#060e20]/90 text-white rounded-2xl border border-white/10 focus-visible:border-[#50e1f9] focus-visible:ring-2 focus-visible:ring-[#50e1f9]/20 transition-all font-medium placeholder-slate-500" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-400 font-medium pl-2" />
                  </FormItem>
                )}
              />

              {/* Register Number */}
              <FormField
                control={form.control}
                name="registerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#50e1f9] transition-colors" />
                        <Input 
                          placeholder="Register Number *" 
                          {...field} 
                          className="pl-12 pr-4 py-6 bg-[#060e20]/90 text-white rounded-2xl border border-white/10 focus-visible:border-[#50e1f9] focus-visible:ring-2 focus-visible:ring-[#50e1f9]/20 transition-all font-medium placeholder-slate-500" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-400 font-medium pl-2" />
                  </FormItem>
                )}
              />

              {/* College Email */}
              <FormField
                control={form.control}
                name="collegeEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#50e1f9] transition-colors" />
                        <Input 
                          type="email" 
                          placeholder="College Email *" 
                          {...field} 
                          className="pl-12 pr-4 py-6 bg-[#060e20]/90 text-white rounded-2xl border border-white/10 focus-visible:border-[#50e1f9] focus-visible:ring-2 focus-visible:ring-[#50e1f9]/20 transition-all font-medium placeholder-slate-500" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-400 font-medium pl-2" />
                  </FormItem>
                )}
              />

              {/* Password */}
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
                          placeholder="Password *" 
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
                    <FormMessage className="text-xs text-red-400 font-medium pl-2" />
                  </FormItem>
                )}
              />

              {/* Select College */}
              <FormField
                control={form.control}
                name="selectCollege"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={handleCollegeChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-[#060e20]/90 text-white border border-white/10 rounded-2xl py-6 focus:ring-[#50e1f9]/20 focus:border-[#50e1f9] transition-all">
                          <div className="flex items-center pl-2">
                            <School className="h-5 w-5 text-slate-400 mr-3" />
                            <SelectValue placeholder="Select College *" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#0f1930] text-white border border-white/10 rounded-xl">
                        {colleges.length > 0 ? (
                          colleges.map((college) => (
                            <SelectItem key={college.id} value={college.name} className="focus:bg-white/10 focus:text-white hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                              {college.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>Loading colleges...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-400 font-medium pl-2" />
                  </FormItem>
                )}
              />

              {/* Department and Year Selector Row */}
              <div className="flex gap-4">
                
                {/* Department Selector */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCollegeId || isDepartmentsLoading}>
                        <FormControl>
                          <SelectTrigger className="bg-[#060e20]/90 text-white border border-white/10 rounded-2xl py-6 focus:ring-[#50e1f9]/20 focus:border-[#50e1f9] transition-all disabled:opacity-50">
                            <div className="flex items-center pl-2">
                              <GraduationCap className="h-5 w-5 text-slate-400 mr-2" />
                              <SelectValue placeholder="Dept *" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0f1930] text-white border border-white/10 rounded-xl">
                          {isDepartmentsLoading ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : departments.length > 0 ? (
                            departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.name} className="focus:bg-white/10 focus:text-white hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                                {dept.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-depts" disabled>Select college first</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-400 font-medium pl-2" />
                    </FormItem>
                  )}
                />

                {/* Year of Study Selector */}
                <FormField
                  control={form.control}
                  name="yearOfStudy"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#060e20]/90 text-white border border-white/10 rounded-2xl py-6 focus:ring-[#50e1f9]/20 focus:border-[#50e1f9] transition-all">
                            <div className="flex items-center pl-2">
                              <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                              <SelectValue placeholder="Year *" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0f1930] text-white border border-white/10 rounded-xl">
                          <SelectItem value="1" className="focus:bg-white/10 focus:text-white hover:bg-white/10 hover:text-white cursor-pointer transition-colors">1st Year</SelectItem>
                          <SelectItem value="2" className="focus:bg-white/10 focus:text-white hover:bg-white/10 hover:text-white cursor-pointer transition-colors">2nd Year</SelectItem>
                          <SelectItem value="3" className="focus:bg-white/10 focus:text-white hover:bg-white/10 hover:text-white cursor-pointer transition-colors">3rd Year</SelectItem>
                          <SelectItem value="4" className="focus:bg-white/10 focus:text-white hover:bg-white/10 hover:text-white cursor-pointer transition-colors">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-400 font-medium pl-2" />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full liquid-gradient text-slate-900 font-bold py-3.5 rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(106,178,255,0.4)] transition-all duration-300 text-base" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-900" /> Creating Account...
                  </span>
                ) : 'Create Account'}
              </Button>
            </form>
          </Form>

          {/* Separation Divider */}
          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-slate-500 text-xs font-bold tracking-wider">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google College Mail Sign Up Button */}
          <button 
            type="button"
            className="w-full glass-panel flex items-center justify-center gap-3 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] transition-all py-3.5 px-6 rounded-2xl border border-white/10 font-bold text-sm text-slate-200"
          >
             <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
             </svg>
             Register with College Mail
          </button>
        </div>

        {/* Redirect Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#6ab2ff] hover:text-[#50e1f9] hover:underline transition-colors pl-1">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
