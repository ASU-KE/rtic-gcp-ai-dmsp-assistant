import { AuthAction, User } from "../types";

export const login = (user: User): AuthAction => {
  return {
    type: "LOGIN",
    payload: { user },
  };
};

export const logout = (): AuthAction => {
  return { type: "LOGOUT" };
};
