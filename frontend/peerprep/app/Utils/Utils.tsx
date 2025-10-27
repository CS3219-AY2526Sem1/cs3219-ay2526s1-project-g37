/**
 * Format time from seconds to MM:SS
 * @param totalSeconds - Total time in seconds
 * @returns Formatted time string in MM:SS format
 */
export const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Generate a consistent color from a string input
 * @param str - Input string
 * @returns Hex color code
 */
const DISCRETE_COLORS = [
    '#f44336', // Red
    '#2196f3', // Blue
    '#4caf50', // Green
    '#ff9800', // Orange
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#ffeb3b', // Yellow
    '#607d8b', // Slate Gray
];

/**
 * Map a string to a consistent color from the DISCRETE_COLORS array
 * @param str - Input string
 * @returns Color code from DISCRETE_COLORS
 */
export const stringToPaletteColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        // DJB2 (Daniel J. Bernstein) hash function
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % DISCRETE_COLORS.length; 
    
    return DISCRETE_COLORS[index];
};