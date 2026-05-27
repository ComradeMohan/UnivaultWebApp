'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiChatbotForCampusResources } from '@/ai/flows/ai-chatbot-campus-resources';
import { useSession } from '@/context/SessionContext';
import { grantAchievement } from '@/lib/achievements';
import { useAuth, useFirestore } from '@/firebase';

export default function AIChatbot() {
  const { toast } = useToast();
  const { user } = useSession();
  const auth = useAuth();
  const firestore = useFirestore();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const result = await aiChatbotForCampusResources({ question });
      setAnswer(result.answer);

      // Grant achievement on first successful use
      if (user && auth?.currentUser && firestore) {
          const achievement = await grantAchievement(firestore, auth.currentUser.uid, 'first_question');
          if (achievement) {
              toast({
                  title: 'Achievement Unlocked!',
                  description: `You've earned the "${achievement.name}" badge!`,
              });
          }
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get an answer from the AI. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/60 dark:bg-[#0f1930]/30 border border-slate-200/40 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 relative group">
      {/* Top-edge ambient gradient glow line */}
      <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-blue-500/50 to-[#50e1f9]/50 dark:from-blue-500/50 dark:to-[#50e1f9]/20 opacity-30 group-hover:opacity-100 transition-all duration-300 rounded-full blur-[0.5px]" />
      
      <CardHeader className="pb-4 pt-6">
        <CardTitle className="flex items-center gap-2.5 text-2xl font-bold font-poppins text-slate-800 dark:text-white">
          <Sparkles className="h-6 w-6 text-blue-500 dark:text-[#50e1f9] drop-shadow-[0_0_10px_rgba(80,225,249,0.3)] animate-pulse" />
          AI Campus Assistant
        </CardTitle>
        <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Have a question about campus resources, deadlines, or anything else? Ask away!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., When is the library open during finals week?"
            disabled={loading}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060e20]/60 text-slate-900 dark:text-white focus-visible:ring-primary focus-visible:border-primary transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500"
          />
          <Button 
            type="submit" 
            disabled={loading || !auth || !firestore}
            className="liquid-gradient text-slate-900 font-bold px-5 rounded-xl hover:scale-105 transition-all duration-200 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Ask'}
          </Button>
        </form>
        {answer && (
          <div className="p-4 bg-slate-100/60 dark:bg-[#060e20]/50 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-inner animate-in fade-in duration-300">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
