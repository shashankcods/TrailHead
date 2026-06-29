import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getProfile,
  loginUser,
  logoutUser,
  refreshAccessToken as refreshAccessTokenApi,
  registerUser,
  type AuthUser,
  type LoginResponse,
} from "../services/authService";

export const STORAGE_KEYS = {
  user: "user",
} as const;

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const persistAuth = (user: AuthUser) => {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
};

const clearStoredAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem("jwt");
  localStorage.removeItem("username");
  // Clear legacy keys if present
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

const readStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthSession = useCallback((data: LoginResponse) => {
    const token = data.accessToken || data.token;
    persistAuth(data.user);
    setAccessToken(token);
    setUser(data.user);
    setIsAuthenticated(true);
  }, []);

  const clearAuth = useCallback(() => {
    clearStoredAuth();
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginUser(email, password);
      applyAuthSession(data);
    },
    [applyAuthSession]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await registerUser(username, email, password);
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    if (accessToken) {
      try {
        await logoutUser(accessToken);
      } catch {
        // Clear local session even if backend logout fails
      }
    }
    clearAuth();
  }, [accessToken, clearAuth]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const data = await refreshAccessTokenApi();
      const token = data.accessToken || data.token;
      setAccessToken(token);
      setIsAuthenticated(true);
      return token;
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  useEffect(() => {
    const initAuth = async () => {
      // Show stored user optimistically while we verify the session
      const storedUser = readStoredUser();
      if (storedUser) setUser(storedUser);

      try {
        const data = await refreshAccessTokenApi();
        const token = data.accessToken || data.token;
        const profile = await getProfile(token);
        persistAuth(profile.user);
        setAccessToken(token);
        setUser(profile.user);
        setIsAuthenticated(true);
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthProvider;
