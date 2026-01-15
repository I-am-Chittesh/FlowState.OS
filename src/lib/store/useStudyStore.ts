import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Task Interface
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface StudyState {
  // Timer State
  timeLeft: number;
  isActive: boolean;
  isBreak: boolean;
  currentTask: string;
  isSoundOn: boolean;
  
  // Spotify Auth
  spotifyToken: string | null;

  // Stats & Gamification
  sessionsCompleted: number;
  totalTime: number;
  xp: number;         // <--- NEW
  level: number;      // <--- NEW

  // Exam Customization
  examName: string;
  examDate: Date; 

  // Task Management
  tasks: Task[];

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setTask: (task: string) => void;
  setExamDetails: (name: string, date: Date) => void;
  
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  toggleSound: () => void;
  setSpotifyToken: (token: string | null) => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      // --- Initial Values ---
      timeLeft: 25 * 60,
      isActive: false,
      isBreak: false,
      currentTask: "Deep Work",
      isSoundOn: false,
      spotifyToken: null,
      sessionsCompleted: 0,
      totalTime: 0,
      xp: 0,          // Start at 0 XP
      level: 1,       // Start at Level 1
      examName: "Finals",
      examDate: new Date(2026, 1, 15),
      tasks: [],

      // --- Timer Actions ---
      startTimer: () => set({ isActive: true }),
      pauseTimer: () => set({ isActive: false }),
      resetTimer: () => set({ isActive: false, timeLeft: 25 * 60, isBreak: false }),
      setTask: (task) => set({ currentTask: task }),
      setExamDetails: (name, date) => set({ examName: name, examDate: date }),

      // --- Gamified Heartbeat ---
      tick: () => set((state) => {
        if (state.timeLeft <= 0) {
          const wasWorking = !state.isBreak;
          
          // XP LOGIC: 100 XP for a finished session
          const xpGain = wasWorking ? 100 : 0;
          const newXp = state.xp + xpGain;
          // Level Up every 500 XP
          const newLevel = Math.floor(newXp / 500) + 1;

          return { 
            isActive: false, 
            isBreak: wasWorking, 
            timeLeft: wasWorking ? 5 * 60 : 25 * 60,
            currentTask: wasWorking ? "Rest & Recover" : "Deep Work",
            sessionsCompleted: wasWorking ? state.sessionsCompleted + 1 : state.sessionsCompleted,
            totalTime: wasWorking ? state.totalTime + 25 : state.totalTime,
            xp: newXp,      // Update XP
            level: newLevel // Update Level
          };
        }
        return { timeLeft: state.timeLeft - 1 };
      }),

      addTask: (title) => set((state) => ({
        tasks: [...state.tasks, { id: Date.now().toString(), title, completed: false }]
      })),

      // --- Gamified Tasks ---
      toggleTask: (id) => set((state) => {
        // Find the task to see if we are checking or unchecking
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return {};

        const isCompleting = !task.completed;
        // +50 XP for finishing, -50 XP if you uncheck it
        const xpChange = isCompleting ? 50 : -50;
        
        const newXp = Math.max(0, state.xp + xpChange); // Don't go below 0
        const newLevel = Math.floor(newXp / 500) + 1;

        return {
          tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
          xp: newXp,
          level: newLevel
        };
      }),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),

      toggleSound: () => set((state) => ({ isSoundOn: !state.isSoundOn })),
      setSpotifyToken: (token) => set({ spotifyToken: token }),

    }),
    { name: 'flowstate-storage' }
  )
);