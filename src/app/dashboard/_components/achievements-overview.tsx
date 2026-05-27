'use client';
import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { getAchievements, type Achievement, ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

export default function AchievementsOverview() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.currentUser && firestore) {
      getAchievements(firestore, auth.currentUser.uid)
        .then(achievements => {
            setUnlockedAchievements(achievements.map(a => ({ id: a.id, name: a.name, description: a.description, icon: a.icon })));
        })
        .finally(() => setLoading(false));
    } else if (!auth?.currentUser || !firestore) {
        setLoading(false);
    }
  }, [auth, firestore]);

  const Icon = ({ name, ...props }: { name: string } & LucideIcons.LucideProps) => {
    const LucideIcon = LucideIcons[name as keyof typeof LucideIcons] as LucideIcons.LucideIcon;
    if (!LucideIcon) return <LucideIcons.Award {...props} />; // Fallback icon
    return <LucideIcon {...props} />;
  };
  
  const unlockedCount = unlockedAchievements.length;
  const totalCount = ALL_ACHIEVEMENTS.length;

  if (loading) {
    return (
        <Card className="bg-white/50 dark:bg-[#0f1930]/35 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-md">
             <CardHeader>
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
             </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 w-28 rounded-2xl" />)}
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="bg-white/60 dark:bg-[#0f1930]/30 border border-slate-200/40 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 relative group">
      {/* Top-edge ambient gradient glow line */}
      <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-amber-500/50 to-yellow-400/50 dark:from-yellow-400/50 dark:to-yellow-400/20 opacity-30 group-hover:opacity-100 transition-all duration-300 rounded-full blur-[0.5px]" />
      
      <CardHeader className="pb-4 pt-6">
        <CardTitle className="flex items-center gap-2.5 text-2xl font-bold font-poppins text-slate-800 dark:text-white">
            <Trophy className="h-6 w-6 text-amber-500 dark:text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
            Achievements
        </CardTitle>
        <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
            You've unlocked <span className="text-amber-600 dark:text-yellow-400 font-bold">{unlockedCount}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount}</span> badges. Keep up the great work!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="flex flex-wrap gap-4">
              {ALL_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = unlockedAchievements.some(unlocked => unlocked.id === ach.id);
                return (
                    <Tooltip key={ach.id} delayDuration={100}>
                        <TooltipTrigger asChild>
                            <div className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-transparent w-28 h-28 justify-center transition-all duration-300 cursor-help",
                                isUnlocked 
                                  ? "bg-amber-500/5 dark:bg-yellow-400/5 border-amber-500/20 dark:border-yellow-400/20 shadow-amber-500/10 dark:shadow-yellow-400/10 shadow-[0_0_15px] hover:scale-105" 
                                  : "bg-slate-100/50 dark:bg-[#060e20]/40 opacity-40 grayscale hover:opacity-60"
                            )}>
                                <Icon name={ach.icon} className={cn("h-9 w-9", isUnlocked ? "text-amber-600 dark:text-yellow-400" : "text-slate-400 dark:text-slate-500")} />
                                <p className="text-[11px] text-center truncate w-full font-bold tracking-tight text-slate-700 dark:text-slate-300">{ach.name}</p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-white border border-slate-800 rounded-xl p-3 shadow-xl max-w-xs">
                            <p className="font-bold text-sm text-yellow-400 flex items-center gap-1.5">
                              <Trophy className="h-3.5 w-3.5" /> {ach.name}
                            </p>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ach.description}</p>
                            {!isUnlocked && <p className="text-[10px] text-amber-500 font-bold mt-1.5 uppercase tracking-wider">Locked badge</p>}
                        </TooltipContent>
                    </Tooltip>
                )
              })}
            </div>
          </TooltipProvider>
      </CardContent>
    </Card>
  );
}
