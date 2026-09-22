/**
 * Shared Helper Utilities
 */

/**
 * Format meters into human-readable distance (meters or kilometers)
 */
export function formatDistance(meters?: number): string {
  if (meters === undefined || meters === null) return '0 m';
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Format walking duration from seconds or minutes into a readable string
 */
export function formatEstimatedTime(seconds?: number): string {
  if (!seconds || seconds <= 0) return '< 1 min';
  const mins = Math.ceil(seconds / 60);
  if (mins === 1) return '1 min';
  return `${mins} mins`;
}

/**
 * Cleanly join conditional CSS class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Safe text truncation with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
