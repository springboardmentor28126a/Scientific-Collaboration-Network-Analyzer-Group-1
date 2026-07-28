const AUTH_KEY = "scna_auth";

export const saveAuth = (authData) => {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify(authData)
  );
};

export const getAuth = () => {
  const data = localStorage.getItem(AUTH_KEY);

  return data ? JSON.parse(data) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = () => {
  return getAuth() !== null;
};