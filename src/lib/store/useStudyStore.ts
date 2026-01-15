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
  
  // NEW: Sound State
  isSoundOn: boolean;

  // Stats
  sessionsCompleted: number;
  totalTime: number;

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
  
  // Task Actions
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // NEW: Sound Action
  toggleSound: () => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      // --- Initial Values ---
      timeLeft: 25 * 60,
      isActive: false,
      isBreak: false,
      currentTask: "Deep Work",
      isSoundOn: false, // Default to mute
      sessionsCompleted: 0,
      totalTime: 0,
      examName: "Finals",
      examDate: new Date(2026, 1, 15),
      tasks: [],

      // --- Timer Actions ---
      startTimer: () => set({ isActive: true }),
      pauseTimer: () => set({ isActive: false }),
      resetTimer: () => set({ isActive: false, timeLeft: 25 * 60, isBreak: false }),
      setTask: (task) => set({ currentTask: task }),
      
      setExamDetails: (name, date) => set({ examName: name, examDate: date }),

      // --- Heartbeat ---
      tick: () => set((state) => {
        if (state.timeLeft <= 0) {
          const wasWorking = !state.isBreak;
          return { 
            isActive: false, 
            isBreak: wasWorking, 
            timeLeft: wasWorking ? 5 * 60 : 25 * 60,
            currentTask: wasWorking ? "Rest & Recover" : "Deep Work",
            sessionsCompleted: wasWorking ? state.sessionsCompleted + 1 : state.sessionsCompleted,
            totalTime: wasWorking ? state.totalTime + 25 : state.totalTime
          };
        }
        return { timeLeft: state.timeLeft - 1 };
      }),

      // --- Task Logic ---
      addTask: (title) => set((state) => ({
        tasks: [...state.tasks, { id: Date.now().toString(), title, completed: false }]
      })),

      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),

      // --- NEW: Sound Logic ---
      toggleSound: () => set((state) => ({ isSoundOn: !state.isSoundOn })),

    }),
    { name: 'flowstate-storage' }
  )
);