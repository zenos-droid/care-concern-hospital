const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type ApiOptions = RequestInit & { auth?: boolean };

export interface AuthUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName: string;
  role: "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";
  patientId?: string | null;
  doctorId?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

const getAccessToken = () => localStorage.getItem("cch_access_token");

export const saveSession = (session: AuthSession) => {
  localStorage.setItem("cch_access_token", session.accessToken);
  localStorage.setItem("cch_refresh_token", session.refreshToken);
  localStorage.setItem("cch_user", JSON.stringify(session.user));
};

export const clearSession = () => {
  localStorage.removeItem("cch_access_token");
  localStorage.removeItem("cch_refresh_token");
  localStorage.removeItem("cch_user");
};

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem("cch_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearSession();
    return null;
  }
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  if (options.auth !== false) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.log("FULL BACKEND ERROR:", payload);
    throw new Error(
      payload.error?.message ||
      JSON.stringify(payload) ||
      "Request failed"
    );
  }

  return payload.data as T;
}

export const authApi = {
  login: (identifier: string, password: string) =>
    apiFetch<AuthSession>("/api/v1/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ identifier, password })
    }),
  signup: (fullName: string, phone: string, email: string, password: string) =>
    apiFetch<AuthSession>("/api/v1/auth/signup", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ fullName, phone, email: email || undefined, password, role: "PATIENT" })
    }),
  me: () => apiFetch<AuthUser>("/api/v1/auth/me"),
  logout: () => apiFetch<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" })
};

export const dashboardApi = {
  admin: () => apiFetch<any>("/api/v1/dashboards/admin"),
  doctor: () => apiFetch<any>("/api/v1/dashboards/doctor"),
  reception: () => apiFetch<any>("/api/v1/dashboards/reception"),
  patient: () => apiFetch<any>("/api/v1/dashboards/patient")
};

export const appointmentApi = {
  create: (body: unknown) =>
    apiFetch<any>("/api/v1/public/appointments", {
      method: "POST",
      auth: false,
      body: JSON.stringify(body)
    }),
  list: () => apiFetch<any[]>("/api/v1/appointments"),
  approve: (id: string) => apiFetch<any>(`/api/v1/appointments/${id}/approve`, { method: "POST" }),
  checkIn: (id: string) => apiFetch<any>(`/api/v1/appointments/${id}/check-in`, { method: "POST" }),
  cancel: (id: string, reason: string) =>
    apiFetch<any>(`/api/v1/appointments/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason })
    })
};

export const publicApi = {
  departments: () => apiFetch<any[]>("/api/v1/public/departments", { auth: false }),
  doctors: () => apiFetch<any[]>("/api/v1/public/doctors", { auth: false })
};

