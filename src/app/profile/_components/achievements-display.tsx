'use client';
import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { getAchievements, type Achievement } from '@/lib/achievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as LucideIcons from 'lucide-react';
import { format } from 'date-fns';

export default function AchievementsDisplay() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [achievements, setAchievements] = useState<(Achievement & { unlockedAt: Date })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.currentUser && firestore) {
      getAchievements(firestore, auth.currentUser.uid)
        .then(setAchievements)
        .finally(() => setLoading(false));
    } else if (!auth?.currentUser) {
        setLoading(false);
    }
  }, [auth, firestore]);

  const Icon = ({ name, ...props }: { name: string } & LucideIcons.LucideProps) => {
    const LucideIcon = LucideIcons[name as keyof typeof LucideIcons] as LucideIcons.LucideIcon;
    if (!LucideIcon) return <LucideIcons.Award {...props} />; // Fallback icon
    return <LucideIcon {...props} />;
  };

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <Card className="bg-secondary/30 backdrop-blur-sm border-secondary/50 rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length > 0 ? (
          <TooltipProvider>
            <div className="flex flex-wrap gap-4">
              {achievements.map((ach) => (
                <Tooltip key={ach.id}>
                  <TooltipTrigger>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background/50 border border-border w-24 h-24 justify-center">
                      <Icon name={ach.icon} className="h-8 w-8 text-primary" />
                      <p className="text-xs text-center truncate w-full">{ach.name}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{ach.name}</p>
                    <p className="text-sm text-muted-foreground">{ach.description}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Unlocked: {format(ach.unlockedAt, 'PP')}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        ) : (
          <p className="text-muted-foreground text-center">No achievements unlocked yet. Keep learning!</p>
        )}
      </CardContent>
    </Card>
  );
}
