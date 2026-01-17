import { useStudyStore } from "../lib/store/useStudyStore";

// Custom hook for timer functionality
// This consolidates timer-related state and actions from the store
export function useTimer() {
  const {
    timeLeft,
    isActive,
    isBreak,
    currentSet,
    totalSets,
    workDuration,
    breakDuration,
    isSetupMode,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    setTimerConfig,
    startTimerSession,
    setSetupMode,
  } = useStudyStore();

  return {
    // State
    timeLeft,
    isActive,
    isBreak,
    currentSet,
    totalSets,
    workDuration,
    breakDuration,
    isSetupMode,
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    setTimerConfig,
    startTimerSession,
    setSetupMode,
  };
}
