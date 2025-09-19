import { AuthState, User } from "../types";

const STORAGE_KEY = "auth_state";

export const getInitialState = (): AuthState => {

  // TEMPORARY DISABLE PERSISTENCE
  localStorage.removeItem(STORAGE_KEY);

  // const stored = localStorage.getItem(STORAGE_KEY);

  // if (stored) {
  //   const user: User = JSON.parse(stored);

  //   return {
  //     isAuthenticated: true,
  //     storageKey: STORAGE_KEY,
  //     user,
  //   };
  // }

  return {
    isAuthenticated: false,
    storageKey: STORAGE_KEY,
    user: null,
  };
};
