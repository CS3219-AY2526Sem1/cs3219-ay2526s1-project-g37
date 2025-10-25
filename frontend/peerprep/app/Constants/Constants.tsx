/**
 * Constants used for programming language options
 */
export const LANGUAGES = ["C++", "Python", "Java", "JavaScript"];

/**
 * Color mapping for question difficulties
 */
export const DIFFICULTYCOLOR: Record<string, string> = {
  "Easy": "var(--mantine-color-green-5)",
  "Medium": "var(--mantine-color-yellow-5)",
  "Hard": "var(--mantine-color-red-5)",
};

export const CARDHEIGHT = "calc(100vh - 95px)";

export const COLLABCARDHEIGHT = "calc(100vh - 145px)";

/**
 * Common Firebase authentication error codes and their custom messages
 */
export const FIREBASE_AUTH_ERROR_CODES: Record<string, string> = {
  "auth/email-already-in-use": "Email is already in use.",
  "auth/invalid-email": "Invalid email address.",
  "auth/invalid-password": "Invalid password.",
};

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

