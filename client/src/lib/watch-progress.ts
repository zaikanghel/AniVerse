export interface WatchProgress {
  episodeId: string;
  animeId: string;
  title: string;
  position: number;
  duration: number;
  timestamp: number;
  thumbnailUrl?: string;
  episodeNumber: number;
}

// Storage key in localStorage
const WATCH_PROGRESS_KEY = 'aniverse_watch_progress';

/**
 * Save a user's watch progress for an episode
 */
export function saveWatchProgress(progress: Omit<WatchProgress, 'timestamp'>): void {
  try {
    console.log('Saving watch progress:', progress);
    
    // Only save if more than 5 seconds watched and not at the very end
    if (progress.position < 5 || (progress.duration > 0 && progress.position >= progress.duration - 10)) {
      console.log('Position too early or too late, not saving', progress.position, progress.duration);
      return;
    }

    const existingData: Record<string, WatchProgress> = JSON.parse(
      localStorage.getItem(WATCH_PROGRESS_KEY) || '{}'
    );

    const newProgress = {
      ...progress,
      timestamp: Date.now(),
    };
    
    existingData[progress.episodeId] = newProgress;
    console.log('Saving to localStorage:', newProgress);

    localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(existingData));
    console.log('Watch progress saved successfully');
  } catch (error) {
    console.error('Failed to save watch progress:', error);
  }
}

/**
 * Get the watch progress for a specific episode
 */
export function getWatchProgress(episodeId: string): WatchProgress | null {
  try {
    const allProgress: Record<string, WatchProgress> = JSON.parse(
      localStorage.getItem(WATCH_PROGRESS_KEY) || '{}'
    );
    
    return allProgress[episodeId] || null;
  } catch (error) {
    console.error('Failed to get watch progress:', error);
    return null;
  }
}

/**
 * Get all watch progress entries for a specific anime
 */
export function getAnimeWatchProgress(animeId: string): WatchProgress[] {
  try {
    const allProgress: Record<string, WatchProgress> = JSON.parse(
      localStorage.getItem(WATCH_PROGRESS_KEY) || '{}'
    );
    
    return Object.values(allProgress)
      .filter(progress => progress.animeId === animeId)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get anime watch progress:', error);
    return [];
  }
}

/**
 * Remove watch progress entry for a specific episode
 */
export function removeWatchProgress(episodeId: string): void {
  try {
    const allProgress: Record<string, WatchProgress> = JSON.parse(
      localStorage.getItem(WATCH_PROGRESS_KEY) || '{}'
    );
    
    if (allProgress[episodeId]) {
      delete allProgress[episodeId];
      localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(allProgress));
    }
  } catch (error) {
    console.error('Failed to remove watch progress:', error);
  }
}

/**
 * Get the most recent watch progress entries
 */
export function getRecentWatchProgress(limit = 10): WatchProgress[] {
  try {
    const allProgress: Record<string, WatchProgress> = JSON.parse(
      localStorage.getItem(WATCH_PROGRESS_KEY) || '{}'
    );
    
    return Object.values(allProgress)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get recent watch progress:', error);
    return [];
  }
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (!seconds || Number.isNaN(seconds)) return '00:00';
  
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substring(11, 19).replace(/^00:/, '');
}

/**
 * Format a timestamp to a human-readable date/time
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today, ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday, ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' }) + 
      ', ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

/**
 * Calculate percentage watched
 */
export function calculatePercentWatched(position: number, duration: number): number {
  if (!duration) return 0;
  return Math.floor((position / duration) * 100);
}