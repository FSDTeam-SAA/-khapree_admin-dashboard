"use client";

import { apiClient } from "@/lib/axios";
import type {
  ApiResponse,
  AppUser,
  Archetype,
  DashboardData,
  JournalPrompt,
  Meditation,
  Playlist,
  Quiz,
  SubscriptionPlan,
  UsersListResponse,
} from "@/types/api";

type UsersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type SubscriptionPayload = {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  isActive?: boolean;
  features: string[];
  description?: string;
};

type QuizPayload = {
  questions: {
    question: string;
    options: { label: string; text: string }[];
    order: number;
  }[];
};

type QuizBulkPayload = {
  count: number;
  questions?: QuizPayload["questions"];
};

type JournalPayload = {
  title?: string;
  moodQuestion: string;
  emotion: string;
  questions: string[];
  tips: string[];
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type VerifyOtpPayload = {
  email: string;
  otp: string;
};

type ResetPasswordPayload = {
  email: string;
  otp: string;
  password: string;
};

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  users: (page: number, limit: number, search: string) =>
    ["users", page, limit, search] as const,
  subscriptions: ["subscriptions"] as const,
  quizzes: ["quizzes"] as const,
  archetypes: ["archetypes"] as const,
  journalPrompts: ["journal-prompts"] as const,
  meditations: ["meditations"] as const,
  playlists: ["playlists"] as const,
  profile: ["profile"] as const,
};

export async function forgotPassword(payload: ForgotPasswordPayload) {
  try {
    const response = await apiClient.post<ApiResponse<string>>(
      "/auth/forgot-password",
      payload,
    );
    return unwrap(response);
  } catch {
    const fallbackResponse = await apiClient.post<ApiResponse<string>>(
      "/auth/forget",
      payload,
    );
    return unwrap(fallbackResponse);
  }
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const response = await apiClient.post<ApiResponse<string>>("/auth/verify", payload);
  return unwrap(response);
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await apiClient.post<ApiResponse<object>>(
    "/auth/reset-password",
    payload,
  );
  return unwrap(response);
}

export async function getAdminDashboard() {
  const response = await apiClient.get<ApiResponse<DashboardData>>("/admin/dashboard");
  return unwrap(response);
}

export async function getAdminUsers(params: UsersParams) {
  const response = await apiClient.get<ApiResponse<AppUser[]>>("/admin/users", {
    params,
  });

  return {
    users: response.data.data,
    meta: response.data.meta || {
      page: params.page || 1,
      limit: params.limit || 10,
      total: response.data.data.length,
      totalPages: 1,
    },
  } satisfies UsersListResponse;
}

export async function deleteAdminUser(id: string) {
  const response = await apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`);
  return unwrap(response);
}

export async function getSubscriptionPlans() {
  const response =
    await apiClient.get<ApiResponse<SubscriptionPlan[]>>("/admin/subscriptions");
  return unwrap(response);
}

export async function createSubscriptionPlan(payload: SubscriptionPayload) {
  const response = await apiClient.post<ApiResponse<SubscriptionPlan>>(
    "/admin/subscriptions",
    payload,
  );
  return unwrap(response);
}

export async function updateSubscriptionPlan(
  id: string,
  payload: Partial<SubscriptionPayload>,
) {
  const response = await apiClient.put<ApiResponse<SubscriptionPlan>>(
    `/admin/subscriptions/${id}`,
    payload,
  );
  return unwrap(response);
}

export async function toggleSubscriptionPlan(
  id: string,
  action: "active" | "inactive" | "delete",
) {
  const response = await apiClient.patch<ApiResponse<SubscriptionPlan | null>>(
    `/admin/subscriptions/${id}`,
    { action },
  );
  return unwrap(response);
}

export async function getQuizzes() {
  const response = await apiClient.get<ApiResponse<Quiz[]>>("/quizzes", {
    params: { mode: "all" },
  });
  return unwrap(response);
}

export async function createQuiz(payload: QuizPayload) {
  const response = await apiClient.post<ApiResponse<Quiz>>("/quizzes", payload);
  return unwrap(response);
}

export async function createQuizzesBulk(payload: QuizBulkPayload) {
  const response = await apiClient.post<
    ApiResponse<{ count: number; quizIds: string[] }>
  >("/quizzes/bulk", payload);
  return unwrap(response);
}

export async function getArchetypes() {
  const response = await apiClient.get<ApiResponse<Archetype[]>>("/archetypes", {
    params: { onlyActive: "false" },
  });
  return unwrap(response);
}

export async function createArchetype(payload: FormData) {
  const response = await apiClient.post<ApiResponse<Archetype>>("/archetypes", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrap(response);
}

export async function deleteArchetype(id: string) {
  const response = await apiClient.delete<ApiResponse<null>>(`/archetypes/${id}`);
  return unwrap(response);
}

export async function getJournalPrompts() {
  const response = await apiClient.get<ApiResponse<JournalPrompt[]>>(
    "/journals/prompts",
    {
      params: { onlyActive: "false" },
    },
  );
  return unwrap(response);
}

export async function createJournalPrompt(payload: JournalPayload) {
  const response = await apiClient.post<ApiResponse<JournalPrompt>>(
    "/journals/prompts",
    payload,
  );
  return unwrap(response);
}

export async function getMeditations() {
  const response = await apiClient.get<ApiResponse<Meditation[]>>("/meditations", {
    params: { onlyActive: "false" },
  });
  return unwrap(response);
}

export async function createMeditation(payload: FormData) {
  const response = await apiClient.post<ApiResponse<Meditation>>(
    "/meditations",
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return unwrap(response);
}

export async function getPlaylists(meditationId?: string) {
  const response = await apiClient.get<ApiResponse<Playlist[]>>("/playlists", {
    params: { onlyActive: "false", meditationId },
  });
  return unwrap(response);
}

export async function createPlaylist(payload: FormData) {
  const response = await apiClient.post<ApiResponse<Playlist>>("/playlists", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrap(response);
}

export async function deletePlaylist(id: string) {
  const response = await apiClient.delete<ApiResponse<null>>(`/playlists/${id}`);
  return unwrap(response);
}

export async function getProfile() {
  const response = await apiClient.get<ApiResponse<AppUser>>("/user/profile");
  return unwrap(response);
}

export async function updateProfile(payload: FormData) {
  const response = await apiClient.patch<ApiResponse<AppUser>>(
    "/user/update-profile",
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return unwrap(response);
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await apiClient.post<ApiResponse<AppUser>>(
    "/user/change-password",
    payload,
  );
  return unwrap(response);
}

export async function logout() {
  const response = await apiClient.post<ApiResponse<string>>("/auth/logout");
  return unwrap(response);
}
