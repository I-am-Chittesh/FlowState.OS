/**
 * Calculation Engine for Study Pressure & Urgency
 * 
 * This module contains all the math that powers the visual feedback system.
 * No raw hours or percentages are shown to the user - only color-coded urgency.
 */

/**
 * Calculate how "behind" or "ahead" you are on a goal
 * @returns pressure index 0-100 (0 = comfortable, 100 = critical)
 */
export function getPressureIndex(
  completedChapters: number,
  totalChapters: number,
  daysLeft: number,
  totalDays: number
): number {
  // Avoid division by zero
  if (totalChapters === 0 || totalDays === 0) return 0;

  // What % of work should be done by now?
  const expectedProgress = 1 - daysLeft / totalDays;
  
  // What % of work is actually done?
  const actualProgress = completedChapters / totalChapters;
  
  // Gap: if you're behind, gap is positive
  const gap = expectedProgress - actualProgress;
  
  // Convert gap to 0-100 scale
  // gap of 0 = on track = 50
  // gap of 0.5 = 50% behind = 100
  // gap of -0.5 = 50% ahead = 0
  const pressure = Math.max(0, Math.min(100, 50 + gap * 100));
  
  return pressure;
}

/**
 * Convert pressure index to human-readable urgency level
 */
export function getUrgencyTag(
  pressure: number,
  daysLeft: number
): 'critical' | 'urgent' | 'medium' | 'comfortable' {
  // Critical: High pressure + not much time
  if (pressure > 70 || (pressure > 50 && daysLeft <= 7)) {
    return 'critical';
  }
  
  // Urgent: Moderate-high pressure or medium time left
  if (pressure > 50 || daysLeft <= 14) {
    return 'urgent';
  }
  
  // Medium: Some pressure or some time
  if (pressure > 30 || daysLeft <= 30) {
    return 'medium';
  }
  
  // Comfortable: Low pressure and lots of time
  return 'comfortable';
}

/**
 * Get emoji for urgency level
 */
export function getUrgencyEmoji(urgency: 'critical' | 'urgent' | 'medium' | 'comfortable'): string {
  switch (urgency) {
    case 'critical':
      return '🔴';
    case 'urgent':
      return '🟠';
    case 'medium':
      return '🟡';
    case 'comfortable':
      return '🟢';
  }
}

/**
 * Get Tailwind color classes for urgency
 */
export function getUrgencyColors(urgency: 'critical' | 'urgent' | 'medium' | 'comfortable'): {
  bg: string;
  border: string;
  text: string;
  glow: string;
} {
  switch (urgency) {
    case 'critical':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        glow: 'bg-red-500'
      };
    case 'urgent':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'bg-orange-500'
      };
    case 'medium':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        glow: 'bg-yellow-500'
      };
    case 'comfortable':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'bg-emerald-500'
      };
  }
}

/**
 * Calculate days remaining until deadline
 */
export function getDaysRemaining(deadline: Date): number {
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Get progress percentage (0-100)
 */
export function getProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Get motivational message based on pressure
 */
export function getMotivationalMessage(pressure: number, daysLeft: number): string {
  if (pressure > 70) {
    return "⚡ Time to grind! You're falling behind.";
  }
  if (pressure > 50) {
    return "⚠️ Keep the pace up to stay on track.";
  }
  if (pressure > 30) {
    return "📈 You're on track. Keep going!";
  }
  if (daysLeft <= 3) {
    return "🎯 Final stretch! You got this!";
  }
  return "✅ You're crushing it! Stay ahead!";
}

/**
 * Get overall pressure from multiple goals
 * Used for the main dashboard gauge
 */
export function getOverallPressure(
  pressures: number[]
): number {
  if (pressures.length === 0) return 0;
  // Average of all goal pressures
  return Math.round(pressures.reduce((a, b) => a + b, 0) / pressures.length);
}
