import { AuthAction, AuthState } from "../types";

export const AuthReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      const sessionExpiration = Date.now() + 24 * 60 * 60 * 1000; // 1 day in ms

      localStorage.setItem(
        state.storageKey,
        JSON.stringify({
          user: action.payload.user,
          sessionExpiration,
        })
      );

      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        sessionExpiration,
      };

    case "LOGOUT":
      localStorage.removeItem(state.storageKey);

      return {
        ...state,
        isAuthenticated: false,
        user: null,
        sessionExpiration: null,
      };

    default:
      return state;
  }
};
