'use client';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  Firestore,
  serverTimestamp
} from 'firebase/firestore';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Using string for icon names for simplicity
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
}

// In a real app, this would come from a database/Firestore collection
export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_question',
    name: 'Curious Mind',
    description: 'Asked your first question to the AI Campus Assistant.',
    icon: 'BrainCircuit',
  },
  {
    id: 'mcq_master',
    name: 'MCQ Master',
    description: 'Scored 90% or higher on an MCQ test.',
    icon: 'Award',
  },
  {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Achieved a perfect 100% score on any test.',
    icon: 'Star',
  },
  {
    id: 'study_streak',
    name: 'Study Streak',
    description: 'Completed a test every day for 3 days in a row.',
    icon: 'Flame',
  },
  {
    id: 'grade_explorer',
    name: 'Grade Explorer',
    description: 'Viewed your academic records for the first time.',
    icon: 'GraduationCap'
  }
];

export async function getAchievements(
  db: Firestore,
  userId: string
): Promise<(Achievement & { unlockedAt: Date })[]> {
  const userAchievementsCol = collection(db, 'users', userId, 'achievements');
  const q = query(userAchievementsCol);
  const querySnapshot = await getDocs(q);
  
  const unlockedAchievements: (Achievement & { unlockedAt: Date })[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data() as UserAchievement;
    const achievementDetails = ALL_ACHIEVEMENTS.find(a => a.id === data.achievementId);
    if (achievementDetails) {
      unlockedAchievements.push({
        ...achievementDetails,
        unlockedAt: (data.unlockedAt as any).toDate(),
      });
    }
  });

  return unlockedAchievements.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
}

export async function grantAchievement(
  db: Firestore,
  userId: string,
  achievementId: string
): Promise<Achievement | null> {
  const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) {
    console.error('Achievement not found:', achievementId);
    return null;
  }

  const userAchievementDocRef = doc(db, 'users', userId, 'achievements', achievementId);
  const docSnap = await getDoc(userAchievementDocRef);

  if (!docSnap.exists()) {
    await setDoc(userAchievementDocRef, {
      achievementId: achievementId,
      unlockedAt: serverTimestamp(),
    });
    return achievement; // Return the achievement details if it was newly granted
  }
  
  return null; // Return null if the user already has it
}
