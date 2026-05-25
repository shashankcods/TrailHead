const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface ProfileResponse {
  message: string;
  user: AuthUser;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  token: string;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
  checklist?: { rule: string; passed: boolean }[];
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!res.ok) {
    const err = new Error(
      data.error || data.message || "Request failed"
    ) as Error & { checklist?: ApiErrorBody["checklist"] };
    if (data.checklist) {
      err.checklist = data.checklist;
    }
    throw err;
  }

  return data as T;
}

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return parseResponse<RegisterResponse>(res);
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse<LoginResponse>(res);
}

export async function logoutUser(accessToken: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return parseResponse<{ message: string }>(res);
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshResponse> {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  return parseResponse<RefreshResponse>(res);
}

export async function getProfile(accessToken: string): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return parseResponse<ProfileResponse>(res);
}
