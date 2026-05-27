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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, User, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  _gotcha: z.string().optional(),
});

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('full-name', values.name);
    formData.append('email', values.email);
    formData.append('description', values.description);
    if (values._gotcha) {
      formData.append('_gotcha', values._gotcha);
    }

    try {
      const response = await fetch('https://getform.io/f/aejewnwb', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Message Sent!',
          description: "Thanks for reaching out. We'll get back to you soon.",
        });
        form.reset();
      } else {
        throw new Error('Form submission failed.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not send your message. Please try again later.',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-12 flex items-center justify-center">
       <div className="absolute inset-0 bg-grid-cyan-500/10 bg-[mask-image:linear-gradient(to_bottom,white_5%,transparent_100%)] dark:bg-grid-cyan-500/10 dark:bg-[mask-image:linear-gradient(to_bottom,black_5%,transparent_100%)]"></div>
      <div className="container mx-auto max-w-2xl z-10">
        <Card className="bg-background/80 backdrop-blur-sm border-secondary/50 rounded-xl">
          <CardHeader className="text-center">
            <Image src="/images/logo.png" alt="UniVault Logo" width={64} height={64} className="mx-auto" unoptimized />
            <CardTitle className="text-3xl font-bold mt-4">Contact Us</CardTitle>
            <CardDescription>Have a question or feedback? Fill out the form below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4" />Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4" />Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" />Your Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please describe your query in detail..." {...field} rows={5} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Honeypot field */}
                <FormField
                  control={form.control}
                  name="_gotcha"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} tabIndex={-1} autoComplete="off"/>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg shadow-[0_0_15px] shadow-primary/50 transition-shadow" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Send Message'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
