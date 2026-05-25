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
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  user: "user",
} as const;

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const persistAuth = (
  accessToken: string,
  refreshToken: string,
  user: AuthUser
) => {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
};

const clearStoredAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem("jwt");
  localStorage.removeItem("username");
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
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthSession = useCallback((data: LoginResponse) => {
    const token = data.accessToken || data.token;
    persistAuth(token, data.refreshToken, data.user);
    setAccessToken(token);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    setIsAuthenticated(true);
  }, []);

  const clearAuth = useCallback(() => {
    clearStoredAuth();
    setAccessToken(null);
    setRefreshToken(null);
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
    const token =
      accessToken || localStorage.getItem(STORAGE_KEYS.accessToken);
    if (token) {
      try {
        await logoutUser(token);
      } catch {
        // Clear local session even if backend logout fails
      }
    }
    clearAuth();
  }, [accessToken, clearAuth]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const storedRefresh =
      refreshToken || localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (!storedRefresh) {
      clearAuth();
      return null;
    }

    try {
      const data = await refreshAccessTokenApi(storedRefresh);
      const token = data.accessToken || data.token;
      const storedUser = readStoredUser();
      if (storedUser) {
        persistAuth(token, data.refreshToken, storedUser);
      } else {
        localStorage.setItem(STORAGE_KEYS.accessToken, token);
        localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
      }
      setAccessToken(token);
      setRefreshToken(data.refreshToken);
      setIsAuthenticated(true);
      return token;
    } catch {
      clearAuth();
      return null;
    }
  }, [refreshToken, clearAuth]);

  useEffect(() => {
    const initAuth = async () => {
      const storedAccess =
        localStorage.getItem(STORAGE_KEYS.accessToken) ||
        localStorage.getItem("jwt");
      const storedRefresh = localStorage.getItem(STORAGE_KEYS.refreshToken);
      const storedUser = readStoredUser();

      if (!storedAccess) {
        setIsLoading(false);
        return;
      }

      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      setUser(storedUser);
      setIsAuthenticated(true);

      try {
        const profile = await getProfile(storedAccess);
        setUser(profile.user);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile.user));
        if (storedRefresh) {
          localStorage.setItem(STORAGE_KEYS.refreshToken, storedRefresh);
        }
        localStorage.setItem(STORAGE_KEYS.accessToken, storedAccess);
      } catch {
        if (storedRefresh) {
          try {
            const data = await refreshAccessTokenApi(storedRefresh);
            const token = data.accessToken || data.token;
            const profile = await getProfile(token);
            persistAuth(token, data.refreshToken, profile.user);
            setAccessToken(token);
            setRefreshToken(data.refreshToken);
            setUser(profile.user);
          } catch {
            clearAuth();
          }
        } else {
          clearAuth();
        }
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
        refreshToken,
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
