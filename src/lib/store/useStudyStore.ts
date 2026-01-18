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

  // Timer Configuration
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  totalSets: number;
  currentSet: number;
  isSetupMode: boolean; // Show config screen before starting
  sessionJustCompleted: boolean; // Flag to trigger confetti only once per completion

  isSoundOn: boolean;
  
  spotifyToken: string | null;
  userName: string | null;
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
  skipPhase: () => void; // Skip to next phase
  
  setTask: (task: string) => void;
  setActiveTask: (id: string | null, title: string) => void; // <--- NEW

  // Timer Configuration
  setTimerConfig: (workDuration: number, breakDuration: number, totalSets: number) => void;
  setSetupMode: (isSetup: boolean) => void;
  startTimerSession: () => void; // Start from config

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
  
  workDuration: 25 * 60, // 25 minutes default
  breakDuration: 5 * 60, // 5 minutes default
  totalSets: 4,
  currentSet: 1,
  isSetupMode: true, // Start with setup screen
  sessionJustCompleted: false, // Track if session just finished
  
  isSoundOn: false,
  spotifyToken: null,
  userName: null,
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
  resetTimer: () => set((state) => ({ 
    isActive: false, 
    timeLeft: state.isBreak ? state.breakDuration : state.workDuration,
    isBreak: false,
    currentSet: 1,
    isSetupMode: true,
    sessionJustCompleted: false
  })),
  
  setTask: (task) => set({ currentTask: task }),
  
  // NEW: Link a specific task to the timer
  setActiveTask: (id, title) => set({ activeTaskId: id, currentTask: title }),

  // Timer Configuration
  setTimerConfig: (workDuration, breakDuration, totalSets) => 
    set({ 
      workDuration, 
      breakDuration, 
      totalSets,
      timeLeft: workDuration
    }),

  setSetupMode: (isSetup) => set({ isSetupMode: isSetup }),

  startTimerSession: () => set((state) => ({
    isSetupMode: false,
    isActive: true,
    timeLeft: state.workDuration,
    isBreak: false,
    currentSet: 1,
    sessionJustCompleted: false
  })),

  skipPhase: () => set((state) => {
    if (state.isBreak) {
      // Break is done, go to next work phase or setup
      if (state.currentSet < state.totalSets) {
        return {
          isBreak: false,
          timeLeft: state.workDuration,
          currentSet: state.currentSet + 1,
          currentTask: "Deep Work",
          isActive: true
        };
      } else {
        // All sets done
        return {
          isBreak: false,
          timeLeft: state.workDuration,
          currentSet: 1,
          isSetupMode: true,
          currentTask: "Deep Work",
          isActive: false
        };
      }
    } else {
      // Work is done, go to break
      return {
        isBreak: true,
        timeLeft: state.breakDuration,
        currentTask: "Rest & Recover",
        isActive: true
      };
    }
  }),

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
    // Decrement time
    if (state.timeLeft > 0) {
      return { timeLeft: state.timeLeft - 1 };
    }

    // When time reaches 0
    const wasWorking = !state.isBreak;
    
    if (wasWorking) {
      // Finished a work session
      let xpGain = 100;
      if (state.activeTaskId) {
        xpGain += 50; // Bonus for task completion
      }

      const newXp = state.xp + xpGain;
      const newLevel = Math.floor(newXp / 500) + 1;

      // Update task if linked
      if (state.activeTaskId) {
        const taskId = state.activeTaskId;
        const updatedTasks = state.tasks.map(t => 
          t.id === taskId ? { ...t, completed: true } : t
        );
        
        supabase.from('tasks').update({ is_completed: true }).eq('id', taskId).then();
        
        const newSessions = state.sessionsCompleted + 1;
        const newTotalTime = state.totalTime + Math.floor(state.workDuration / 60);
        
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase
              .from('profiles')
              .update({ 
                xp: newXp, 
                level: newLevel,
                sessions_completed: newSessions,
                total_time: newTotalTime
              })
              .eq('id', user.id)
              .then();
          }
        });

        return { 
          isActive: true,
          isBreak: true, 
          timeLeft: state.breakDuration,
          currentTask: "Rest & Recover",
          activeTaskId: null,
          tasks: updatedTasks,
          sessionsCompleted: newSessions,
          totalTime: newTotalTime,
          xp: newXp,
          level: newLevel
        };
      }

      // Standard work session (no task)
      const newSessions = state.sessionsCompleted + 1;
      const newTotalTime = state.totalTime + Math.floor(state.workDuration / 60);
      
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('profiles')
            .update({ 
              xp: newXp, 
              level: newLevel,
              sessions_completed: newSessions,
              total_time: newTotalTime
            })
            .eq('id', user.id)
            .then();
        }
      });
      
      return { 
        isActive: true,
        isBreak: true, 
        timeLeft: state.breakDuration,
        currentTask: "Rest & Recover",
        sessionsCompleted: newSessions,
        totalTime: newTotalTime,
        xp: newXp,
        level: newLevel
      };
    } else {
      // Finished a break session
      if (state.currentSet < state.totalSets) {
        // More sets to go
        return {
          isActive: true,
          isBreak: false,
          timeLeft: state.workDuration,
          currentSet: state.currentSet + 1,
          currentTask: "Deep Work"
        };
      } else {
        // All sets completed! Stop and go back to setup
        return {
          isActive: false,
          isBreak: false,
          timeLeft: state.workDuration,
          currentSet: 1,
          isSetupMode: true, // Go back to setup after completion
          currentTask: "Deep Work",
          sessionJustCompleted: true
        };
      }
    }
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
      tasks: tasksData?.map(t => ({ id: t.id, title: t.title, completed: t.is_completed, goalId: t.goal_id })) || [],
      xp: profileData?.xp || 0,
      level: profileData?.level || 1,
      totalTime: profileData?.total_time || 0,
      sessionsCompleted: profileData?.sessions_completed || 0,
      userName: profileData?.full_name || user.user_metadata?.full_name || "User"
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
        const newLevel = Math.floor(newXp / 500) + 1;
        
        // Persist XP to profile (async in background)
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase
              .from('profiles')
              .update({ xp: newXp, level: newLevel })
              .eq('id', user.id)
              .then();
          }
        });
        
        return { xp: newXp, level: newLevel };
      });
    }
  },

  deleteTask: async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },
}));