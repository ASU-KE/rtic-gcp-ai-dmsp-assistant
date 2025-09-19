import { AuthState, User } from "../types";

const STORAGE_KEY = "auth_state";

const getDefaultState = (): AuthState => ({
  isAuthenticated: false,
  storageKey: STORAGE_KEY,
  user: null,
  sessionExpiration: null,
});

export const getInitialState = (): AuthState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getDefaultState();

  try {
    const parsed = JSON.parse(stored);

    const hasValidStructure =
      parsed &&
      typeof parsed === "object" &&
      "user" in parsed &&
      "sessionExpiration" in parsed;

    if (!hasValidStructure) {
      localStorage.removeItem(STORAGE_KEY);
      return getDefaultState();
    }

    const { user, sessionExpiration } = parsed as {
      user: User | null;
      sessionExpiration: number | null;
    };

    const isSessionValid =
      typeof sessionExpiration === "number" && Date.now() < sessionExpiration;

    if (user && isSessionValid) {
      return {
        isAuthenticated: true,
        storageKey: STORAGE_KEY,
        user,
        sessionExpiration,
      };
    }
  } catch {
    // Invalid JSON, clear storage after this
  }

  localStorage.removeItem(STORAGE_KEY);
  return getDefaultState();
};
