/**
 * Format time from seconds to MM:SS
 * @param totalSeconds - Total time in seconds
 * @returns Formatted time string in MM:SS format
 */
export const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  return `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Generate a consistent color from a string input
 * @param str - Input string
 * @returns Hex color code
 */
const DISCRETE_COLORS = [
  "#f44336", // Red
  "#2196f3", // Blue
  "#4caf50", // Green
  "#ff9800", // Orange
  "#9c27b0", // Purple
  "#00bcd4", // Cyan
  "#ffeb3b", // Yellow
  "#607d8b", // Slate Gray
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

/**
 * Check if the session is less than one minute old
 * @returns boolean - whether the session is less than one minute old
 */
export const isLessThanOneMinuteOld = (raw: string | number | null) => {
  if (!raw) return false;
  if (typeof raw === "number") {
    const created = new Date(raw);
    const diffMs = Date.now() - created.getTime();
    return diffMs >= 0 && diffMs < 60_000;
  }
  const s = String(raw);
  const isoMatch = s.match(
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.(\d+))?(Z|[+-]\d{2}:\d{2})?$/
  );
  let created: Date;
  if (isoMatch) {
    const base = isoMatch[1];
    const fracDigits = isoMatch[3] ?? "";
    const tz = isoMatch[4] ?? "Z";
    const ms = (fracDigits + "000").slice(0, 3);
    const iso = `${base}.${ms}${tz}`;
    created = new Date(iso);
  } else {
    created = new Date(s);
  }

  if (Number.isNaN(created.getTime())) return false;
  const diffMs = Date.now() - created.getTime();
  return diffMs >= 0 && diffMs < 1_000;
};
