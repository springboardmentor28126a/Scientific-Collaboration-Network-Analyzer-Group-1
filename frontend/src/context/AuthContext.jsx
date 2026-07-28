import { createContext, useState } from "react";

import {
  getAuth,
  saveAuth,
  clearAuth,
} from "../utils/authStorage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getAuth());

  const login = (authData) => {
    saveAuth(authData);
    setAuth(authData);
  };

  const logout = () => {
    clearAuth();
    setAuth(null);
  };

  const isLoggedIn = !!auth;

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}