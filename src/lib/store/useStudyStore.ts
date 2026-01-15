import { create } from 'zustand';
import { supabase } from '../supabase';
import { getPressureIndex, getUrgencyTag, getDaysRemaining } from '../calculations';

// --- TYPES ---
export interface Goal {
  id: string;
  title: string;
  deadline: Date;
  color: string;
  completedChapters?: number; // How many chapters done
  totalChapters?: number; // Total chapters to study
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  goalId: string | null;
}

interface StudyState {
  // --- STATE ---
  timeLeft: number;
  isActive: boolean;
  isBreak: boolean;
  
  currentTask: string;
  activeTaskId: string | null; // <--- NEW: Tracks the ID of the running task

  isSoundOn: boolean;
  
  spotifyToken: string | null;
  xp: number;
  level: number;
  sessionsCompleted: number;
  totalTime: number;

  goals: Goal[];
  tasks: Task[];
  
  // Pressure tracking
  pressureByGoalId: { [goalId: string]: number }; // 0-100 pressure per goal
  urgencyByGoalId: { [goalId: string]: 'critical' | 'urgent' | 'medium' | 'comfortable' };

  // --- ACTIONS ---
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  
  setTask: (task: string) => void;
  setActiveTask: (id: string | null, title: string) => void; // <--- NEW

  toggleSound: () => void;
  setSpotifyToken: (token: string | null) => void;
  
  // Pressure & progress actions
  updateGoalProgress: (goalId: string, completed: number, total: number) => Promise<void>;
  calculateAllPressures: () => void;

  // Database Actions
  fetchData: () => Promise<void>;
  addGoal: (title: string, deadline: Date, color: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addTask: (title: string, goalId: string | null) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  // --- INITIAL VALUES ---
  timeLeft: 25 * 60,
  isActive: false,
  isBreak: false,
  currentTask: "Deep Work",
  activeTaskId: null, // Default: No specific task linked
  isSoundOn: false,
  spotifyToken: null,
  xp: 0,
  level: 1,
  sessionsCompleted: 0,
  totalTime: 0,
  goals: [],
  tasks: [],
  pressureByGoalId: {},
  urgencyByGoalId: {},

  // --- TIMER LOGIC ---
  startTimer: () => set({ isActive: true }),
  pauseTimer: () => set({ isActive: false }),
  resetTimer: () => set({ isActive: false, timeLeft: 25 * 60, isBreak: false }),
  
  setTask: (task) => set({ currentTask: task }),
  
  // NEW: Link a specific task to the timer
  setActiveTask: (id, title) => set({ activeTaskId: id, currentTask: title }),

  toggleSound: () => set((state) => ({ isSoundOn: !state.isSoundOn })),
  setSpotifyToken: (token) => set({ spotifyToken: token }),

  // Calculate pressure for all goals
  calculateAllPressures: () => set((state) => {
    const newPressures: { [key: string]: number } = {};
    const newUrgencies: { [key: string]: 'critical' | 'urgent' | 'medium' | 'comfortable' } = {};

    state.goals.forEach((goal) => {
      const completed = goal.completedChapters || 0;
      const total = goal.totalChapters || 1;
      const daysLeft = getDaysRemaining(goal.deadline);
      const totalDays = Math.max(1, Math.ceil((goal.deadline.getTime() - new Date(goal.deadline.getTime() - 365 * 24 * 60 * 60 * 1000).getTime()) / (1000 * 60 * 60 * 24)));

      const pressure = getPressureIndex(completed, total, daysLeft, totalDays);
      const urgency = getUrgencyTag(pressure, daysLeft);

      newPressures[goal.id] = pressure;
      newUrgencies[goal.id] = urgency;
    });

    return {
      pressureByGoalId: newPressures,
      urgencyByGoalId: newUrgencies,
    };
  }),

  // Update chapter progress for a goal
  updateGoalProgress: async (goalId: string, completed: number, total: number) => {
    // Update local state
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId ? { ...g, completedChapters: completed, totalChapters: total } : g
      ),
    }));

    // Update Supabase
    await supabase
      .from('goals')
      .update({ completed_chapters: completed, total_chapters: total })
      .eq('id', goalId);

    // Recalculate pressure for this goal
    get().calculateAllPressures();
  },

  tick: () => set((state) => {
    if (state.timeLeft <= 0) {
      const wasWorking = !state.isBreak;
      
      // XP Calculation
      // 100 XP for Session + 50 XP if a Task was completed
      let xpGain = wasWorking ? 100 : 0;
      if (wasWorking && state.activeTaskId) {
        xpGain += 50; // Bonus for finishing a specific task
      }

      const newXp = state.xp + xpGain;
      const newLevel = Math.floor(newXp / 500) + 1;

      // AUTO-COMPLETE LOGIC
      // If we were working on a specific task, mark it as done!
      if (wasWorking && state.activeTaskId) {
        const taskId = state.activeTaskId;
        
        // 1. Update Local State immediately
        const updatedTasks = state.tasks.map(t => 
          t.id === taskId ? { ...t, completed: true } : t
        );
        
        // 2. Update Supabase in background
        supabase.from('tasks').update({ is_completed: true }).eq('id', taskId).then();
        
        return { 
          isActive: false, 
          isBreak: wasWorking, 
          timeLeft: wasWorking ? 5 * 60 : 25 * 60,
          currentTask: "Rest & Recover",
          activeTaskId: null, // Clear the active task so next session is fresh
          tasks: updatedTasks, // Update the list
          sessionsCompleted: state.sessionsCompleted + 1,
          totalTime: state.totalTime + 25,
          xp: newXp,
          level: newLevel
        };
      }

      // Standard Timer Finish (No Task Linked)
      return { 
        isActive: false, 
        isBreak: wasWorking, 
        timeLeft: wasWorking ? 5 * 60 : 25 * 60,
        currentTask: wasWorking ? "Rest & Recover" : "Deep Work",
        sessionsCompleted: wasWorking ? state.sessionsCompleted + 1 : state.sessionsCompleted,
        totalTime: wasWorking ? state.totalTime + 25 : state.totalTime,
        xp: newXp,
        level: newLevel
      };
    }
    return { timeLeft: state.timeLeft - 1 };
  }),

  // --- DATABASE ACTIONS ---
  fetchData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: goalsData } = await supabase.from('goals').select('*').order('deadline', { ascending: true });
    const { data: tasksData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    set({
      goals: goalsData?.map(g => ({ ...g, deadline: new Date(g.deadline) })) || [],
      tasks: tasksData || [],
      xp: profileData?.xp || 0,
      level: profileData?.level || 1,
      totalTime: profileData?.total_time || 0,
      sessionsCompleted: profileData?.sessions_completed || 0
    });
  },

  addGoal: async (title, deadline, color) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('goals').insert({ user_id: user.id, title, deadline: deadline.toISOString(), color }).select().single();
    if (!error && data) {
      set((state) => ({ goals: [...state.goals, { ...data, deadline: new Date(data.deadline) }] }));
    }
  },

  deleteGoal: async (id) => {
    await supabase.from('goals').delete().eq('id', id);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id), tasks: state.tasks.filter((t) => t.goalId !== id) }));
  },

  addTask: async (title, goalId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('tasks').insert({ user_id: user.id, title, goal_id: goalId, is_completed: false }).select().single();
    if (!error && data) {
      set((state) => ({ tasks: [{ id: data.id, title: data.title, completed: data.is_completed, goalId: data.goal_id }, ...state.tasks] }));
    }
  },

  toggleTask: async (id, completed) => {
    set((state) => ({ tasks: state.tasks.map((t) => t.id === id ? { ...t, completed } : t) }));
    await supabase.from('tasks').update({ is_completed: completed }).eq('id', id);
    if (completed) {
      set((state) => {
        const newXp = state.xp + 50;
        return { xp: newXp, level: Math.floor(newXp / 500) + 1 };
      });
    }
  },

  deleteTask: async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },
}));